import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor } from '@/lib/partyConfig';
import { calcularEscanosProvincia } from '@/lib/dhondtByProvince';
import { VerifySeatsModal } from '@/components/VerifySeatsModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { getProvinceNameFromTopoJSON } from '@/lib/provinceMapping';
import { useState, useEffect, useRef, useMemo } from 'react';

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

// Cache global para GeoJSON
let geoJsonCache: any = null;

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  onProvinceClick,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState<{
    provincia: string;
    votos: Record<string, number>;
    escanos: Record<string, number>;
    escanosPorPartido: Record<string, number>;
  } | null>(null);

  // Cargar GeoJSON precompilado (mucho más rápido)
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        // Si ya está en caché, usar directamente
        if (geoJsonCache) {
          setGeoJsonData(geoJsonCache);
          setLoading(false);
          return;
        }

        // Cargar el GeoJSON precompilado
        const response = await fetch('/data/provinces-geojson.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        geoJsonCache = data;
        setGeoJsonData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando GeoJSON:', err);
        setError('Error al cargar el mapa de provincias');
        setLoading(false);
      }
    };

    loadGeoJson();
  }, []);

  // Calcular datos de provincia
  const getProvinceData = useMemo(() => {
    return (province: string): ProvinceData => {
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
  }, [votosPorProvincia]);

  const handleProvinceClick = (provinceName: string) => {
    const data = getProvinceData(provinceName);
    const votos = votosPorProvincia[provinceName] || {};
    const escanos = calcularEscanosProvincia(provinceName, votos);
    setSelectedProvince(provinceName);
    onProvinceClick?.(provinceName, data, votos, escanos);
  };

  // Manejador de eventos para cada feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const topoJsonName = feature.properties?.name;
    if (!topoJsonName) return;

    // Usar el nombre directamente del GeoJSON
    const surveyProvinceName = topoJsonName;
    const hasData = surveyProvinceName in votosPorProvincia;
    
    if (!hasData) {
      (layer as L.Path).setStyle({
        fillColor: '#CCCCCC',
        fillOpacity: 0.2,
        color: '#D5D5D7',
        weight: 1,
      });
      return;
    }

    const data = getProvinceData(surveyProvinceName);
    const color = getPartyColor(data.ganador) || '#999999';

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: 0.8,
      color: '#D5D5D7',
      weight: 1,
    });

    // Event listeners
    layer.on('click', () => handleProvinceClick(surveyProvinceName));
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
      `<strong>${surveyProvinceName}</strong><br/>${data.ganador}: ${data.porcentajeGanador.toFixed(1)}%<br/>Votos: ${totalVotos}`
    );
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Cargando mapa realista...</p>
        </div>
      </div>
    );
  }

  if (error || !geoJsonData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error || 'Error al cargar el mapa'}</p>
          <p className="text-sm text-gray-500 mt-2">Por favor, recarga la página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Cartel informativo */}
      <div className="w-full p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
        <p className="text-blue-800 font-semibold text-center">
          ✅ Mapa realista de España - Haz clic en una provincia para ver detalles
        </p>
      </div>

      {/* Mapa con Leaflet */}
      <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[40, -3.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={18}
            minZoom={5}
          />
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>

      {/* Botón de verificación de escaños */}
      {selectedProvince && Object.keys(votosPorProvincia[selectedProvince] || {}).length > 0 && (
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 flex items-center justify-between animate-fadeIn">
          <div>
            <h3 className="font-semibold text-blue-900">Provincia: {selectedProvince}</h3>
            <p className="text-sm text-blue-700">Verifica la distribución de escaños según la Ley d'Hondt</p>
          </div>
          <Button
            onClick={() => {
              const votos = votosPorProvincia[selectedProvince] || {};
              const escanos = calcularEscanosProvincia(selectedProvince, votos);
              const escanosPorPartido = calcularEscanosProvincia(selectedProvince, votos);
              setVerifyData({
                provincia: selectedProvince,
                votos,
                escanos,
                escanosPorPartido,
              });
              setShowVerifyModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verificar Escaños
          </Button>
        </div>
      )}

      {/* Modal de verificación */}
      {showVerifyModal && verifyData && (
        <VerifySeatsModal
          data={verifyData}
          onClose={() => setShowVerifyModal(false)}
        />
      )}

      {/* Leyenda del mapa */}
      <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Cómo leer el mapa:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ El color de cada provincia indica el partido ganador</li>
          <li>✓ Haz clic en una provincia para ver detalles de votos</li>
          <li>✓ Pasa el ratón sobre una provincia para resaltarla</li>
          <li>✓ Usa los controles de zoom para acercarte</li>
        </ul>
      </div>
    </div>
  );
};
