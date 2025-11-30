import { useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';
import { getEscanosPorProvincia, calcularEscanosProvincia, calcularEscanosJuvenilesProvincia } from '@/lib/dhondtByProvince';
import { VerifySeatsModal } from '@/components/VerifySeatsModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Grid3x3, Map } from 'lucide-react';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapProvincialProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
  isYouthAssociations?: boolean;  // true para Asociaciones Juveniles, false para Elecciones Generales
}

// Coordenadas aproximadas del centroide de cada provincia para el mapa realista
const provinceCoordinates: { [key: string]: { x: number; y: number } } = {
  "Álava": { x: 520, y: 200 },
  "Albacete": { x: 650, y: 380 },
  "Alicante": { x: 720, y: 420 },
  "Almería": { x: 750, y: 480 },
  "Ávila": { x: 580, y: 300 },
  "Badajoz": { x: 420, y: 380 },
  "Baleares": { x: 800, y: 380 },
  "Barcelona": { x: 780, y: 150 },
  "Burgos": { x: 580, y: 200 },
  "Cáceres": { x: 450, y: 340 },
  "Cádiz": { x: 350, y: 520 },
  "Castellón": { x: 750, y: 300 },
  "Ciudad Real": { x: 580, y: 380 },
  "Córdoba": { x: 500, y: 420 },
  "Cuenca": { x: 650, y: 320 },
  "Girona": { x: 800, y: 120 },
  "Granada": { x: 650, y: 480 },
  "Guadalajara": { x: 620, y: 300 },
  "Guipúzcoa": { x: 500, y: 160 },
  "Huelva": { x: 380, y: 480 },
  "Huesca": { x: 650, y: 150 },
  "Jaén": { x: 600, y: 440 },
  "La Coruña": { x: 300, y: 100 },
  "La Rioja": { x: 600, y: 180 },
  "Las Palmas": { x: 200, y: 550 },
  "León": { x: 480, y: 180 },
  "Lleida": { x: 700, y: 140 },
  "Lugo": { x: 320, y: 80 },
  "Madrid": { x: 620, y: 320 },
  "Málaga": { x: 550, y: 500 },
  "Murcia": { x: 700, y: 420 },
  "Navarra": { x: 580, y: 160 },
  "Ourense": { x: 350, y: 120 },
  "Palencia": { x: 540, y: 220 },
  "Palma de Mallorca": { x: 780, y: 380 },
  "Pontevedra": { x: 320, y: 140 },
  "Salamanca": { x: 500, y: 280 },
  "Santa Cruz de Tenerife": { x: 180, y: 600 },
  "Segovia": { x: 600, y: 280 },
  "Sevilla": { x: 450, y: 460 },
  "Soria": { x: 620, y: 220 },
  "Tarragona": { x: 760, y: 180 },
  "Teruel": { x: 680, y: 240 },
  "Toledo": { x: 600, y: 360 },
  "Valencia": { x: 720, y: 360 },
  "Valladolid": { x: 540, y: 240 },
  "Vizcaya": { x: 500, y: 180 },
  "Zamora": { x: 480, y: 240 },
  "Zaragoza": { x: 680, y: 200 },
  "Ceuta": { x: 380, y: 520 },
  "Melilla": { x: 800, y: 520 },
};

/**
 * Mapa interactivo de España mostrando provincias coloreadas por partido ganador
 */
export const SpainMapProvincial: React.FC<SpainMapProvincialProps> = ({
  votosPorProvincia,
  onProvinceClick,
  isYouthAssociations = false,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [mapView, setMapView] = useState<"schematic" | "realistic">("schematic");
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
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

  // Función para calcular escaños por provincia usando Ley d'Hondt correcta
  const calcularEscanosPorProvinciaCorrecta = (provincia: string, votos: Record<string, number>): Record<string, number> => {
    // Usar la función correcta según el tipo de elección
    return isYouthAssociations
      ? calcularEscanosJuvenilesProvincia(provincia, votos)
      : calcularEscanosProvincia(provincia, votos);
  };

  const handleProvinceClick = (province: string) => {
    const data = getProvinceData(province);
    const votos = votosPorProvincia[province] || {};
    const escanos = calcularEscanosPorProvinciaCorrecta(province, votos);
    setSelectedProvince(province);
    onProvinceClick?.(province, data, votos, escanos);
  };

  // Obtener todas las provincias del sistema electoral
  const todasLasProvincias = Object.keys(getEscanosPorProvincia());
  
  // Crear lista de todas las provincias con sus datos (incluyendo las sin datos)
  const provinciasConDatos = todasLasProvincias.map((province) => ({
    province,
    data: getProvinceData(province),
    tieneData: Object.keys(votosPorProvincia).includes(province),
  }));

  return (
    <div className="w-full space-y-4">
      {/* Llamada a la accion */}
      <div className="p-4 bg-gradient-to-r from-red-900 to-red-800 rounded-lg border border-red-600">
        <p className="text-white text-sm mb-2">
          <strong>Tu provincia no aparece?</strong> Ayudanos respondiendo la encuesta.
        </p>
        <a
          href="https://encuestabc-6q57y6uz.manus.space/nano-encuesta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-white text-red-900 font-semibold rounded hover:bg-gray-100 transition-colors text-sm"
        >
          Responder Encuesta
        </a>
      </div>

      {/* Botones de vista */}
      <div className="flex gap-2 p-4 bg-gray-900 rounded-lg">
        <Button
          onClick={() => setMapView("schematic")}
          variant={mapView === "schematic" ? "default" : "outline"}
          className={`flex items-center gap-2 ${
            mapView === "schematic"
              ? "bg-[#C41E3A] hover:bg-[#A01830]"
              : "border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          Esquemática
        </Button>
      </div>

      {/* Vista esquemática (grid) */}
      {mapView === "schematic" && (
        <>
          {/* Cartel de versión final y estable */}
          <div className="w-full p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="text-green-800 font-semibold text-center">
              ✅ Versión Final. Estable. La versión realista es recomendable no verla dado los fallos que tiene.
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 bg-gray-900 rounded-lg">
          {provinciasConDatos.map(({ province, data, tieneData }) => (
            <button
              key={province}
              onClick={() => tieneData && handleProvinceClick(province)}
              className={`p-3 rounded-lg text-center text-xs font-semibold transition-all transform ${
                tieneData ? 'hover:scale-110 cursor-pointer' : 'cursor-help opacity-40'
              } ${
                selectedProvince === province ? 'ring-2 ring-white' : ''
              }`}
              style={{
                backgroundColor: tieneData ? getPartyColor(data.ganador) : '#4B5563',
                opacity: selectedProvince === province ? 1 : (tieneData ? 0.8 : 0.4),
              }}
              title={tieneData ? `${province}: ${data.ganador} (${data.porcentajeGanador.toFixed(1)}%)` : `${province}: Sin datos - Responde la encuesta`}
            >
              <div className="text-white truncate">{province}</div>
              <div className="text-gray-200 text-xs mt-1">
                {tieneData ? (data.ganador || 'N/A') : '?'}
              </div>
            </button>
          ))}
          </div>
        </>
      )}

      {/* Vista realista (mapa) */}
      {mapView === "realistic" && (
        <div className="w-full flex justify-center p-4 bg-gray-900 rounded-lg">
          <svg
            viewBox="0 0 900 650"
            className="w-full max-w-4xl border border-[#C41E3A] rounded-lg bg-[#F5F5F7]"
            style={{ aspectRatio: "16/11" }}
          >
            {/* Fondo del mapa */}
            <rect width="900" height="650" fill="#F5F5F7" />

            {/* Provincias como círculos */}
            {provinciasConDatos.map(({ province, data, tieneData }) => {
              const coords = provinceCoordinates[province];
              if (!coords) return null;

              const winnerColor = tieneData ? getPartyColor(data.ganador) : '#CCCCCC';
              const isSelected = selectedProvince === province;
              const isHovered = hoveredProvince === province;

              return (
                <g key={province}>
                  {/* Círculo de provincia */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isHovered || isSelected ? 28 : 22}
                    fill={winnerColor}
                    opacity={tieneData ? 1 : 0.3}
                    stroke={isSelected ? "#1D1D1F" : isHovered ? "#C41E3A" : "white"}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => tieneData && setHoveredProvince(province)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    onClick={() => tieneData && handleProvinceClick(province)}
                  />

                  {/* Etiqueta de provincia */}
                  {(isHovered || isSelected) && (
                    <text
                      x={coords.x}
                      y={coords.y + 40}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-[#1D1D1F] pointer-events-none"
                    >
                      {province.substring(0, 3).toUpperCase()}
                    </text>
                  )}

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={coords.x - 60}
                        y={coords.y - 70}
                        width="120"
                        height="60"
                        rx="8"
                        fill="white"
                        stroke="#D5D5D7"
                        strokeWidth="1"
                      />
                      <text
                        x={coords.x}
                        y={coords.y - 50}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-[#1D1D1F]"
                      >
                        {province}
                      </text>
                      <text
                        x={coords.x}
                        y={coords.y - 35}
                        textAnchor="middle"
                        className="text-xs fill-[#555555]"
                      >
                        {Object.values(data.votos).reduce((a, b) => a + b, 0)} votos
                      </text>
                      <text
                        x={coords.x}
                        y={coords.y - 20}
                        textAnchor="middle"
                        className="text-xs fill-[#555555]"
                      >
                        {data.ganador}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

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
              const escanos = calcularEscanosPorProvinciaCorrecta(selectedProvince, votos);
              const escanosPorPartido = calcularEscanosPorProvinciaCorrecta(selectedProvince, votos);
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
                const escanosPart = calcularEscanosPorProvinciaCorrecta(selectedProvince, votosPorProvincia[selectedProvince] || {})[partido] || 0;
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
