import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor } from '@/lib/partyConfig';
import { spanishToGeoJson, geoJsonToSpanish } from '@/lib/provinceGeoJsonMapper';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapRealisticProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
}

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  onProvinceClick,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleProvinceClick = (provinceName: string) => {
    const data = getProvinceData(provinceName);
    const votos = votosPorProvincia[provinceName] || {};
    onProvinceClick?.(provinceName, data, votos, {});
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    // Obtener nombre de provincia del GeoJSON (en valenciano/euskera)
    const geoJsonProvinceName = feature.properties?.prov_name;
    if (!geoJsonProvinceName) return;

    // MAPEO BIDIRECCIONAL: Convertir nombre GeoJSON al nombre en español (Supabase)
    const spanishProvinceName = geoJsonToSpanish(geoJsonProvinceName);
    
    const hasData = spanishProvinceName in votosPorProvincia;
    
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

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: 0.8,
      color: '#D5D5D7',
      weight: 1,
    });

    layer.on('click', () => {
      handleProvinceClick(spanishProvinceName);
    });

    layer.on('mouseover', () => {
      (layer as L.Path).setStyle({
        weight: 2,
        fillOpacity: 1,
        color: '#C41E3A',
      });
    });

    layer.on('mouseout', () => {
      (layer as L.Path).setStyle({
        weight: 1,
        fillOpacity: 0.8,
        color: '#D5D5D7',
      });
    });

    const totalVotos = Object.values(data.votos).reduce((a, b) => a + b, 0);
    layer.bindPopup(
      `<strong>${spanishProvinceName}</strong><br/>${data.ganador}: ${data.porcentajeGanador.toFixed(1)}%<br/>Votos: ${totalVotos}`
    );
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
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>
    </div>
  );
};
