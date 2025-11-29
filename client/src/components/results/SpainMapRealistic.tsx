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
import { normalizeProvinceName } from '@/lib/provinceNameNormalizer';
import { topoJsonToGeoJson } from '@/lib/topoJsonToGeoJson';

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
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState<{
    provincia: string;
    votos: Record<string, number>;
    escanos: Record<string, number>;
    escanosPorPartido: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    // Cargar el archivo TopoJSON y convertirlo a GeoJSON
    fetch('/data/provinces.json')
      .then((res) => res.json())
      .then((topoData) => {
        const geoJson = topoJsonToGeoJson(topoData, 'provinces');
        setGeoJsonData(geoJson);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando TopoJSON:', err);
        setLoading(false);
      });
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
    const escanos = calcularEscanosProvincia(provinceName, votos);
    setSelectedProvince(provinceName);
    onProvinceClick?.(provinceName, data, votos, escanos);
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const provinceName = feature.properties.name;
    
    // Normalizar nombre y buscar en los datos
    const normalizedName = normalizeProvinceName(provinceName);
    let matchingProvince: string | null = null;

    // Buscar provincia coincidente en los datos
    for (const [key] of Object.entries(votosPorProvincia)) {
      if (normalizeProvinceName(key) === normalizedName) {
        matchingProvince = key;
        break;
      }
    }

    const data = matchingProvince ? getProvinceData(matchingProvince) : null;
    const hasData = matchingProvince && Object.keys(votosPorProvincia[matchingProvince] || {}).length > 0;
    const color = hasData ? getPartyColor(data!.ganador) : '#CCCCCC';

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: hasData ? 0.8 : 0.2,
      color: '#D5D5D7',
      weight: 1,
    });

    layer.on('click', () => {
      if (matchingProvince) {
        handleProvinceClick(matchingProvince);
      }
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
        fillOpacity: hasData ? 0.8 : 0.2,
        color: '#D5D5D7',
      });
    });

    if (matchingProvince && data) {
      layer.bindPopup(
        `<strong>${matchingProvince}</strong><br/>${data.ganador}: ${data.porcentajeGanador.toFixed(1)}%<br/>Votos: ${Object.values(data.votos).reduce((a, b) => a + b, 0)}`
      );
    }
  };

  if (loading || !geoJsonData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

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
          <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
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
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verificar
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
    </div>
  );
};
