import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';
import { calcularEscanosProvincia } from '@/lib/dhondtByProvince';
import { VerifySeatsModal } from '@/components/VerifySeatsModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

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

// GeoJSON con las provincias de España
const SPAIN_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature', properties: { name: 'Álava' }, geometry: { type: 'Polygon', coordinates: [[[-2.8, 43.3], [-2.8, 42.8], [-2.3, 42.8], [-2.3, 43.3], [-2.8, 43.3]]] } },
    { type: 'Feature', properties: { name: 'Albacete' }, geometry: { type: 'Polygon', coordinates: [[[-1.5, 39.5], [-1.5, 38.5], [-0.5, 38.5], [-0.5, 39.5], [-1.5, 39.5]]] } },
    { type: 'Feature', properties: { name: 'Alicante' }, geometry: { type: 'Polygon', coordinates: [[[-0.5, 38.8], [-0.5, 37.8], [0.5, 37.8], [0.5, 38.8], [-0.5, 38.8]]] } },
    { type: 'Feature', properties: { name: 'Almería' }, geometry: { type: 'Polygon', coordinates: [[[-2.5, 37.5], [-2.5, 36.5], [-1.5, 36.5], [-1.5, 37.5], [-2.5, 37.5]]] } },
    { type: 'Feature', properties: { name: 'Ávila' }, geometry: { type: 'Polygon', coordinates: [[[-5.5, 41.0], [-5.5, 40.0], [-4.5, 40.0], [-4.5, 41.0], [-5.5, 41.0]]] } },
    { type: 'Feature', properties: { name: 'Badajoz' }, geometry: { type: 'Polygon', coordinates: [[[-6.5, 39.5], [-6.5, 38.0], [-5.5, 38.0], [-5.5, 39.5], [-6.5, 39.5]]] } },
    { type: 'Feature', properties: { name: 'Barcelona' }, geometry: { type: 'Polygon', coordinates: [[[1.5, 42.5], [1.5, 41.3], [2.8, 41.3], [2.8, 42.5], [1.5, 42.5]]] } },
    { type: 'Feature', properties: { name: 'Burgos' }, geometry: { type: 'Polygon', coordinates: [[[-3.8, 42.8], [-3.8, 41.8], [-2.8, 41.8], [-2.8, 42.8], [-3.8, 42.8]]] } },
    { type: 'Feature', properties: { name: 'Cáceres' }, geometry: { type: 'Polygon', coordinates: [[[-6.0, 40.3], [-6.0, 39.3], [-5.0, 39.3], [-5.0, 40.3], [-6.0, 40.3]]] } },
    { type: 'Feature', properties: { name: 'Cádiz' }, geometry: { type: 'Polygon', coordinates: [[[-6.3, 36.8], [-6.3, 35.8], [-5.3, 35.8], [-5.3, 36.8], [-6.3, 36.8]]] } },
    { type: 'Feature', properties: { name: 'Castellón' }, geometry: { type: 'Polygon', coordinates: [[[0.3, 40.8], [0.3, 39.8], [1.3, 39.8], [1.3, 40.8], [0.3, 40.8]]] } },
    { type: 'Feature', properties: { name: 'Ceuta' }, geometry: { type: 'Polygon', coordinates: [[[-5.3, 35.9], [-5.3, 35.8], [-5.2, 35.8], [-5.2, 35.9], [-5.3, 35.9]]] } },
    { type: 'Feature', properties: { name: 'Ciudad Real' }, geometry: { type: 'Polygon', coordinates: [[[-3.8, 39.8], [-3.8, 38.8], [-2.8, 38.8], [-2.8, 39.8], [-3.8, 39.8]]] } },
    { type: 'Feature', properties: { name: 'Córdoba' }, geometry: { type: 'Polygon', coordinates: [[[-4.8, 38.5], [-4.8, 37.5], [-3.8, 37.5], [-3.8, 38.5], [-4.8, 38.5]]] } },
    { type: 'Feature', properties: { name: 'La Coruña' }, geometry: { type: 'Polygon', coordinates: [[[-8.8, 43.5], [-8.8, 42.5], [-7.8, 42.5], [-7.8, 43.5], [-8.8, 43.5]]] } },
    { type: 'Feature', properties: { name: 'Cuenca' }, geometry: { type: 'Polygon', coordinates: [[[-1.8, 40.8], [-1.8, 39.8], [-0.8, 39.8], [-0.8, 40.8], [-1.8, 40.8]]] } },
    { type: 'Feature', properties: { name: 'Girona' }, geometry: { type: 'Polygon', coordinates: [[[2.0, 42.5], [2.0, 41.8], [3.0, 41.8], [3.0, 42.5], [2.0, 42.5]]] } },
    { type: 'Feature', properties: { name: 'Granada' }, geometry: { type: 'Polygon', coordinates: [[[-3.8, 37.5], [-3.8, 36.5], [-2.8, 36.5], [-2.8, 37.5], [-3.8, 37.5]]] } },
    { type: 'Feature', properties: { name: 'Guadalajara' }, geometry: { type: 'Polygon', coordinates: [[[-3.0, 41.3], [-3.0, 40.3], [-2.0, 40.3], [-2.0, 41.3], [-3.0, 41.3]]] } },
    { type: 'Feature', properties: { name: 'Guipúzcoa' }, geometry: { type: 'Polygon', coordinates: [[[-2.0, 43.5], [-2.0, 43.0], [-1.3, 43.0], [-1.3, 43.5], [-2.0, 43.5]]] } },
    { type: 'Feature', properties: { name: 'Huelva' }, geometry: { type: 'Polygon', coordinates: [[[-7.3, 37.8], [-7.3, 36.8], [-6.3, 36.8], [-6.3, 37.8], [-7.3, 37.8]]] } },
    { type: 'Feature', properties: { name: 'Huesca' }, geometry: { type: 'Polygon', coordinates: [[[-0.5, 42.8], [-0.5, 41.8], [0.5, 41.8], [0.5, 42.8], [-0.5, 42.8]]] } },
    { type: 'Feature', properties: { name: 'Jaén' }, geometry: { type: 'Polygon', coordinates: [[[-4.0, 38.3], [-4.0, 37.3], [-3.0, 37.3], [-3.0, 38.3], [-4.0, 38.3]]] } },
    { type: 'Feature', properties: { name: 'León' }, geometry: { type: 'Polygon', coordinates: [[[-5.8, 42.8], [-5.8, 41.8], [-4.8, 41.8], [-4.8, 42.8], [-5.8, 42.8]]] } },
    { type: 'Feature', properties: { name: 'Lleida' }, geometry: { type: 'Polygon', coordinates: [[[0.5, 42.5], [0.5, 41.5], [1.5, 41.5], [1.5, 42.5], [0.5, 42.5]]] } },
    { type: 'Feature', properties: { name: 'Lugo' }, geometry: { type: 'Polygon', coordinates: [[[-8.5, 43.2], [-8.5, 42.3], [-7.5, 42.3], [-7.5, 43.2], [-8.5, 43.2]]] } },
    { type: 'Feature', properties: { name: 'Madrid' }, geometry: { type: 'Polygon', coordinates: [[[-4.0, 41.0], [-4.0, 40.0], [-3.0, 40.0], [-3.0, 41.0], [-4.0, 41.0]]] } },
    { type: 'Feature', properties: { name: 'Málaga' }, geometry: { type: 'Polygon', coordinates: [[[-4.0, 37.3], [-4.0, 36.3], [-3.0, 36.3], [-3.0, 37.3], [-4.0, 37.3]]] } },
    { type: 'Feature', properties: { name: 'Melilla' }, geometry: { type: 'Polygon', coordinates: [[[-3.0, 35.3], [-3.0, 35.2], [-2.9, 35.2], [-2.9, 35.3], [-3.0, 35.3]]] } },
    { type: 'Feature', properties: { name: 'Murcia' }, geometry: { type: 'Polygon', coordinates: [[[-1.5, 38.3], [-1.5, 37.3], [-0.5, 37.3], [-0.5, 38.3], [-1.5, 38.3]]] } },
    { type: 'Feature', properties: { name: 'Navarra' }, geometry: { type: 'Polygon', coordinates: [[[-1.8, 43.0], [-1.8, 42.0], [-0.8, 42.0], [-0.8, 43.0], [-1.8, 43.0]]] } },
    { type: 'Feature', properties: { name: 'Ourense' }, geometry: { type: 'Polygon', coordinates: [[[-8.3, 42.5], [-8.3, 41.8], [-7.3, 41.8], [-7.3, 42.5], [-8.3, 42.5]]] } },
    { type: 'Feature', properties: { name: 'Palencia' }, geometry: { type: 'Polygon', coordinates: [[[-4.8, 42.3], [-4.8, 41.3], [-3.8, 41.3], [-3.8, 42.3], [-4.8, 42.3]]] } },
    { type: 'Feature', properties: { name: 'Pontevedra' }, geometry: { type: 'Polygon', coordinates: [[[-8.8, 42.5], [-8.8, 41.8], [-7.8, 41.8], [-7.8, 42.5], [-8.8, 42.5]]] } },
    { type: 'Feature', properties: { name: 'La Rioja' }, geometry: { type: 'Polygon', coordinates: [[[-2.3, 42.5], [-2.3, 41.8], [-1.3, 41.8], [-1.3, 42.5], [-2.3, 42.5]]] } },
    { type: 'Feature', properties: { name: 'Salamanca' }, geometry: { type: 'Polygon', coordinates: [[[-5.8, 41.3], [-5.8, 40.3], [-4.8, 40.3], [-4.8, 41.3], [-5.8, 41.3]]] } },
    { type: 'Feature', properties: { name: 'Segovia' }, geometry: { type: 'Polygon', coordinates: [[[-4.3, 41.3], [-4.3, 40.8], [-3.8, 40.8], [-3.8, 41.3], [-4.3, 41.3]]] } },
    { type: 'Feature', properties: { name: 'Sevilla' }, geometry: { type: 'Polygon', coordinates: [[[-6.3, 37.8], [-6.3, 36.8], [-5.3, 36.8], [-5.3, 37.8], [-6.3, 37.8]]] } },
    { type: 'Feature', properties: { name: 'Soria' }, geometry: { type: 'Polygon', coordinates: [[[-2.5, 42.3], [-2.5, 41.3], [-1.5, 41.3], [-1.5, 42.3], [-2.5, 42.3]]] } },
    { type: 'Feature', properties: { name: 'Tarragona' }, geometry: { type: 'Polygon', coordinates: [[[1.0, 41.5], [1.0, 40.8], [2.0, 40.8], [2.0, 41.5], [1.0, 41.5]]] } },
    { type: 'Feature', properties: { name: 'Teruel' }, geometry: { type: 'Polygon', coordinates: [[[-0.5, 41.3], [-0.5, 40.3], [0.5, 40.3], [0.5, 41.3], [-0.5, 41.3]]] } },
    { type: 'Feature', properties: { name: 'Toledo' }, geometry: { type: 'Polygon', coordinates: [[[-4.3, 40.3], [-4.3, 39.3], [-3.3, 39.3], [-3.3, 40.3], [-4.3, 40.3]]] } },
    { type: 'Feature', properties: { name: 'Valencia' }, geometry: { type: 'Polygon', coordinates: [[[-0.3, 39.8], [-0.3, 38.8], [0.7, 38.8], [0.7, 39.8], [-0.3, 39.8]]] } },
    { type: 'Feature', properties: { name: 'Valladolid' }, geometry: { type: 'Polygon', coordinates: [[[-4.8, 42.0], [-4.8, 41.0], [-3.8, 41.0], [-3.8, 42.0], [-4.8, 42.0]]] } },
    { type: 'Feature', properties: { name: 'Vizcaya' }, geometry: { type: 'Polygon', coordinates: [[[-3.2, 43.5], [-3.2, 43.0], [-2.3, 43.0], [-2.3, 43.5], [-3.2, 43.5]]] } },
    { type: 'Feature', properties: { name: 'Zamora' }, geometry: { type: 'Polygon', coordinates: [[[-6.3, 41.8], [-6.3, 41.0], [-5.3, 41.0], [-5.3, 41.8], [-6.3, 41.8]]] } },
    { type: 'Feature', properties: { name: 'Zaragoza' }, geometry: { type: 'Polygon', coordinates: [[[-1.0, 42.3], [-1.0, 41.0], [0.3, 41.0], [0.3, 42.3], [-1.0, 42.3]]] } },
  ]
};

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  onProvinceClick,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState<{
    provincia: string;
    votos: Record<string, number>;
    escanos: Record<string, number>;
    escanosPorPartido: Record<string, number>;
  } | null>(null);

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
    const escanos = calcularEscanosProvincia(provinceName, votos);
    setSelectedProvince(provinceName);
    onProvinceClick?.(provinceName, data, votos, escanos);
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const provinceName = feature.properties.name;
    const data = getProvinceData(provinceName);
    const hasData = Object.keys(votosPorProvincia).includes(provinceName);
    const color = hasData ? getPartyColor(data.ganador) : '#CCCCCC';

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: 0.8,
      color: 'white',
      weight: 2,
    });

    layer.on('click', () => handleProvinceClick(provinceName));
    layer.on('mouseover', () => {
      (layer as L.Path).setStyle({ weight: 3, fillOpacity: 1 });
    });
    layer.on('mouseout', () => {
      (layer as L.Path).setStyle({ weight: 2, fillOpacity: 0.8 });
    });

    layer.bindPopup(`<strong>${provinceName}</strong><br/>${data.ganador}: ${data.porcentajeGanador.toFixed(1)}%`);
  };

  return (
    <div className="w-full space-y-4">

      {/* Mapa con Leaflet */}
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
          <GeoJSON data={SPAIN_GEOJSON} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>

      {/* Botón de verificación de escaños */}
      {selectedProvince && Object.keys(votosPorProvincia[selectedProvince] || {}).length > 0 && (
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Verificar Escaños</h3>
            <p className="text-sm text-blue-700">Comprueba si la distribución de escaños es correcta según la Ley d'Hondt</p>
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
            className="flex items-center gap-2"
            variant="default"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verificar
          </Button>
        </div>
      )}

      {/* Información de la provincia seleccionada */}
      {selectedProvince && (
        <div className="p-4 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-3">{selectedProvince}</h3>
          <div className="space-y-2">
            {Object.entries(
              votosPorProvincia[selectedProvince] || {}
            )
              .sort(([, a], [, b]) => b - a)
              .map(([partido, votos]) => {
                const total = Object.values(
                  votosPorProvincia[selectedProvince] || {}
                ).reduce((a, b) => a + b, 0);
                const porcentaje = total > 0 ? (votos / total) * 100 : 0;
                const escanosPart = calcularEscanosProvincia(selectedProvince, votosPorProvincia[selectedProvince] || {})[partido] || 0;
                const partyName = PARTIES_GENERAL[partido as keyof typeof PARTIES_GENERAL]?.name || partido;

                return (
                  <div key={partido} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getPartyColor(partido) }}
                      />
                      <span className="text-gray-300">{partyName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{votos}</span>
                      <span className="text-gray-400 ml-2">({porcentaje.toFixed(1)}%) - {escanosPart} escaños</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal de verificación de escaños */}
      {verifyData && (
        <VerifySeatsModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          provincia={verifyData.provincia}
          votosProvincia={verifyData.votos}
          escanosProvincia={verifyData.escanos}
          escanosPorPartido={verifyData.escanosPorPartido}
        />
      )}
    </div>
  );
};
