import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPartyColor } from '@/lib/partyConfig';
import { calcularEscanosProvincia } from '@/lib/dhondtByProvince';
import { VerifySeatsModal } from '@/components/VerifySeatsModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { topoJsonToGeoJson } from '@/lib/topoJsonToGeoJson';
import { getProvinceNameFromTopoJSON } from '@/lib/provinceMapping';

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
  const [error, setError] = useState<string | null>(null);
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
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((topoData) => {
        try {
          const geoJson = topoJsonToGeoJson(topoData, 'provinces');
          setGeoJsonData(geoJson);
          setLoading(false);
        } catch (err) {
          console.error('Error convirtiendo TopoJSON:', err);
          setError('Error al convertir TopoJSON a GeoJSON');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando TopoJSON:', err);
        setError('Error al cargar el archivo de provincias');
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
    const topoJsonName = feature.properties?.name;
    if (!topoJsonName) return;

    // Convertir nombre TopoJSON a nombre de encuesta
    const surveyProvinceName = getProvinceNameFromTopoJSON(topoJsonName);
    
    if (!surveyProvinceName) {
      console.warn(`No mapping found for province: ${topoJsonName}`);
      return;
    }

    const hasData = surveyProvinceName in votosPorProvincia;
    
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

    const data = getProvinceData(surveyProvinceName);
    const color = getPartyColor(data.ganador) || '#999999';

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: 0.8,
      color: '#D5D5D7',
      weight: 1,
    });

    layer.on('click', () => {
      handleProvinceClick(surveyProvinceName);
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
      `<strong>${surveyProvinceName}</strong><br/>${data.ganador}: ${data.porcentajeGanador.toFixed(1)}%<br/>Votos: ${totalVotos}`
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
