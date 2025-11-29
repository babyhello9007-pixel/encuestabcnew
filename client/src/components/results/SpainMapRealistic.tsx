import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor } from '@/lib/partyConfig';
import { spanishToGeoJson, geoJsonToSpanish } from '@/lib/provinceGeoJsonMapper';
import { ProvincePopup } from './ProvincePopup';
import { FilterState } from './MapFilters';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapRealisticProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap?: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
  filters?: FilterState;
}

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  provinciaMetricsMap = {},
  onProvinceClick,
  filters,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  // LAZY LOADING: Cargar GeoJSON solo cuando el componente se monta
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/georef-spain-provincia.geojson');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setGeoJsonData(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando GeoJSON:', err);
        setError('Error al cargar el archivo de provincias');
      } finally {
        setLoading(false);
      }
    };

    loadGeoJson();
  }, []);

  // Calcular el partido ganador por provincia
  const getProvinceData = (province: string): ProvinceData => {
    const votos = votosPorProvincia[province] || {};
    const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
    
    let ganador = '';
    let maxVotos = 0;
    
    for (const [partido, votoCount] of Object.entries(votos)) {
      if (votoCount > maxVotos) {
        maxVotos = votoCount;
        ganador = partido;
      }
    }

    return {
      name: province,
      votos,
      ganador,
      porcentajeGanador: totalVotos > 0 ? (maxVotos / totalVotos) * 100 : 0,
    };
  };

  // Verificar si una provincia cumple con los filtros
  const provinceMatchesFilters = (province: string): boolean => {
    if (!filters) return true;

    const metrics = provinciaMetricsMap[province];
    
    // Filtro de edad
    if (metrics) {
      const edad = metrics.edad_promedio;
      if (edad < filters.ageRange[0] || edad > filters.ageRange[1]) {
        return false;
      }

      // Filtro de ideología
      const ideologia = metrics.ideologia_promedio;
      if (ideologia < filters.ideologyRange[0] || ideologia > filters.ideologyRange[1]) {
        return false;
      }
    }

    // Filtro de partidos
    const votos = votosPorProvincia[province] || {};
    const hasSelectedParty = Object.keys(votos).some(party =>
      filters.selectedParties.includes(party)
    );

    if (filters.selectedParties.length > 0 && !hasSelectedParty) {
      return false;
    }

    return true;
  };

  const handleProvinceClick = (provinceName: string) => {
    const data = getProvinceData(provinceName);
    const votos = votosPorProvincia[provinceName] || {};
    setSelectedProvince(provinceName);
    onProvinceClick?.(provinceName, data, votos, {});
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    // Obtener nombre de provincia del GeoJSON (en valenciano/euskera)
    const geoJsonProvinceName = feature.properties?.prov_name;
    if (!geoJsonProvinceName) return;

    // MAPEO BIDIRECCIONAL: Convertir nombre GeoJSON al nombre en español (Supabase)
    const spanishProvinceName = geoJsonToSpanish(geoJsonProvinceName);
    
    const hasData = spanishProvinceName in votosPorProvincia;
    const matchesFilters = provinceMatchesFilters(spanishProvinceName);
    
    if (!hasData) {
      // Provincia sin datos
      (layer as L.Path).setStyle({
        fillColor: '#CCCCCC',
        fillOpacity: 0.2,
        color: '#D5D5D7',
        weight: 1,
      });
      return;
    }

    const data = getProvinceData(spanishProvinceName);
    const color = getPartyColor(data.ganador) || '#999999';

    // Si no coincide con los filtros, mostrar en gris claro
    const finalColor = matchesFilters ? color : '#E5E7EB';
    const finalOpacity = matchesFilters ? 0.8 : 0.3;

    (layer as L.Path).setStyle({
      fillColor: finalColor,
      fillOpacity: finalOpacity,
      color: '#D5D5D7',
      weight: 1,
    });

    layer.on('click', () => {
      handleProvinceClick(spanishProvinceName);
    });

    layer.on('mouseover', () => {
      (layer as L.Path).setStyle({
        weight: 2,
        fillOpacity: matchesFilters ? 1 : 0.5,
        color: '#C41E3A',
      });
    });

    layer.on('mouseout', () => {
      (layer as L.Path).setStyle({
        weight: 1,
        fillOpacity: finalOpacity,
        color: '#D5D5D7',
      });
    });

    const metrics = provinciaMetricsMap[spanishProvinceName];
    const totalVotos = Object.values(data.votos).reduce((a, b) => a + b, 0);

    // Crear popup con componente mejorado
    const popupContent = (
      <ProvincePopup
        provinceName={spanishProvinceName}
        votos={data.votos}
        edadPromedio={metrics?.edad_promedio}
        ideologiaPromedio={metrics?.ideologia_promedio}
      />
    );

    // Crear elemento DOM para el popup
    const popupDiv = document.createElement('div');
    const root = document.createElement('div');
    popupDiv.appendChild(root);

    // Renderizar el componente en el DOM
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="w-80 p-4 bg-white rounded-lg shadow-lg">
        <h3 class="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-500">${spanishProvinceName}</h3>
        <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div class="bg-gray-50 p-2 rounded">
            <p class="text-gray-600 text-xs font-semibold">TOTAL VOTOS</p>
            <p class="text-lg font-bold text-gray-900">${totalVotos}</p>
          </div>
          ${metrics ? `
            <div class="bg-gray-50 p-2 rounded">
              <p class="text-gray-600 text-xs font-semibold">EDAD MEDIA</p>
              <p class="text-lg font-bold text-gray-900">${metrics.edad_promedio.toFixed(1)}</p>
            </div>
            <div class="bg-gray-50 p-2 rounded col-span-2">
              <p class="text-gray-600 text-xs font-semibold">POSICIÓN IDEOLÓGICA</p>
              <p class="text-lg font-bold text-gray-900">${metrics.ideologia_promedio.toFixed(1)}/10</p>
            </div>
          ` : ''}
        </div>
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-600 uppercase">RESULTADOS POR PARTIDO</p>
          <div class="max-h-64 overflow-y-auto space-y-2">
            ${Object.entries(data.votos)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([partido, votos]) => {
                const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0';
                return `
                  <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-900 truncate">${partido}</p>
                      <div class="flex items-center gap-1">
                        <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div class="h-full rounded-full" style="width: ${porcentaje}%; background-color: ${getPartyColor(partido) || '#999999'};"></div>
                        </div>
                        <span class="text-xs font-bold text-gray-700 w-10 text-right">${porcentaje}%</span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="text-xs font-bold text-gray-900">${votos}</p>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    layer.bindPopup(container, {
      maxWidth: 400,
      className: 'province-popup',
    });
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  if (error || !geoJsonData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-red-600">{error || 'Error al cargar el mapa'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Cartel de versión funcional */}
      <div className="w-full p-4 bg-green-50 border-2 border-green-400 rounded-lg">
        <p className="text-green-800 font-semibold text-center">
          ✓ Versión Funcional. El mapa realista muestra los resultados de la encuesta por provincia.
        </p>
      </div>

      {/* Mapa con Leaflet - LAZY LOADED */}
      <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
        <MapContainer
          center={[40, -3.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          ref={setMapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>

      {/* Leyenda de filtros */}
      {filters && (
        <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold">Filtros aplicados:</p>
          <p>Edad: {filters.ageRange[0]}-{filters.ageRange[1]} años | 
             Ideología: {filters.ideologyRange[0]}-{filters.ideologyRange[1]} | 
             Partidos: {filters.selectedParties.length} seleccionados</p>
        </div>
      )}
    </div>
  );
};
