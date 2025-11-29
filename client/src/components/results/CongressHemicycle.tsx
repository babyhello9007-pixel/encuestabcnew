import React, { useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface CongressHemicycleProps {
  escanos: Record<string, number>;
  totalEscanos?: number;
  provinciaSeleccionada?: string | null;
  votosProvincia?: Record<string, number>;
  escanosProvincia?: Record<string, number>;
}

/**
 * Hemiciclo del Congreso de los Diputados Español
 * Forma semicircular real con distribución de escaños en arcos concéntricos
 * El hemiciclo tiene 350 escaños distribuidos en 15 filas semicirculares
 */
export const CongressHemicycle: React.FC<CongressHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
  provinciaSeleccionada,
  votosProvincia,
  escanosProvincia,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  // Crear array de escaños con información del partido
  const seatArray: Array<{ party: string; index: number }> = [];
  let seatIndex = 0;

  // Ordenar partidos por escaños (mayor a menor) para distribución visual
  const sortedParties = Object.entries(escanos)
    .sort((a, b) => b[1] - a[1])
    .map(([party]) => party);

  for (const party of sortedParties) {
    const count = escanos[party] || 0;
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++ });
    }
  }

  // Distribución del hemiciclo del Congreso Español
  // 15 filas semicirculares con distribución realista
  const rows = 15;
  const seatsPerRow = Math.ceil(totalEscanos / rows);

  // Agrupar escaños por filas
  const hemicycleRows: Array<Array<{ party: string; index: number }>> = [];
  for (let i = 0; i < rows; i++) {
    const start = i * seatsPerRow;
    const end = Math.min(start + seatsPerRow, seatArray.length);
    hemicycleRows.push(seatArray.slice(start, end));
  }

  // Calcular posición de cada escaño en forma semicircular
  const getSeatPosition = (rowIndex: number, seatIndexInRow: number, totalSeatsInRow: number) => {
    // Radio del hemiciclo (aumenta con cada fila)
    const baseRadius = 40;
    const radius = baseRadius + rowIndex * 18;

    // Ángulo: de 0 a π radianes (180 grados) para forma semicircular
    // Distribuir los escaños en el arco
    const angleSpan = Math.PI; // 180 grados
    const startAngle = 0; // Comienza en la izquierda

    // Calcular ángulo para este escaño
    const anglePerSeat = angleSpan / (totalSeatsInRow - 1 || 1);
    const angle = startAngle + seatIndexInRow * anglePerSeat;

    // Convertir coordenadas polares a cartesianas
    // Centro del hemiciclo en (0, 0)
    const x = radius * Math.cos(angle - Math.PI / 2); // Ajustar para que sea semicircular hacia arriba
    const y = radius * Math.sin(angle - Math.PI / 2);

    return { x, y, angle };
  };

  return (
    <div className="w-full space-y-4">
      {/* Información de provincia seleccionada */}
      {provinciaSeleccionada && votosProvincia && Object.keys(votosProvincia).length > 0 && (
        <div className="p-4 bg-blue-900 rounded-lg border border-blue-600">
          <h3 className="text-white font-bold mb-3">Provincia: {provinciaSeleccionada}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(votosProvincia)
              .sort((a, b) => b[1] - a[1])
              .map(([party, votos]) => {
                const escanosPart = escanosProvincia?.[party] || 0;
                const partyName = PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name || party;
                return (
                  <div key={party} className="p-3 rounded bg-blue-800 border-l-4" style={{ borderColor: getPartyColor(party) }}>
                    <div className="text-blue-200 text-sm font-semibold">{partyName}</div>
                    <div className="text-white text-lg font-bold">{votos} votos</div>
                    <div className="text-blue-100 text-sm">{escanosPart} escaños</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-900 rounded-lg text-sm">
        {Object.entries(escanos)
          .sort((a, b) => b[1] - a[1])
          .map(([party, count]) => (
            <div key={party} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getPartyColor(party) }}
              />
              <span className="text-gray-300">
                {PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name || party}: {count}
              </span>
            </div>
          ))}
      </div>

      {/* Hemiciclo Semicircular */}
      <div className="p-8 bg-gray-900 rounded-lg overflow-x-auto">
        <div className="flex justify-center items-end min-h-[600px]">
          <svg
            viewBox="-350 -50 700 450"
            className="w-full max-w-4xl"
            style={{ minHeight: '500px' }}
          >
            {/* Fondo del hemiciclo */}
            <ellipse cx="0" cy="0" rx="320" ry="320" fill="#1a1a1a" stroke="#444" strokeWidth="2" />

            {/* Líneas de referencia (opcional) */}
            <circle cx="0" cy="0" r="60" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
            <circle cx="0" cy="0" r="120" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
            <circle cx="0" cy="0" r="180" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
            <circle cx="0" cy="0" r="240" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />

            {/* Escaños */}
            {hemicycleRows.map((row, rowIndex) => (
              <g key={`row-${rowIndex}`}>
                {row.map((seat, seatIndexInRow) => {
                  const { x, y } = getSeatPosition(rowIndex, seatIndexInRow, row.length);
                  const seatSize = rowIndex < 5 ? 10 : rowIndex < 10 ? 12 : 14;
                  const isHovered = hoveredParty === seat.party || hoveredSeat === seat.index;

                  return (
                    <g
                      key={`seat-${seat.index}`}
                      onMouseEnter={() => {
                        setHoveredParty(seat.party);
                        setHoveredSeat(seat.index);
                      }}
                      onMouseLeave={() => {
                        setHoveredParty(null);
                        setHoveredSeat(null);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={seatSize / 2}
                        fill={getPartyColor(seat.party)}
                        stroke={isHovered ? '#fff' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                        opacity={isHovered ? 1 : 0.85}
                        className="transition-all"
                      />
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r={seatSize / 2 + 4}
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Texto central */}
            <text
              x="0"
              y="30"
              textAnchor="middle"
              className="text-gray-400 text-sm"
              fill="#999"
            >
              Congreso de los Diputados
            </text>
            <text
              x="0"
              y="50"
              textAnchor="middle"
              className="text-gray-500 text-xs"
              fill="#666"
            >
              {totalEscanos} escaños
            </text>
          </svg>
        </div>
      </div>

      {/* Tabla de distribución */}
      <div className="p-4 bg-gray-900 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Distribución de Escaños</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(escanos)
            .sort((a, b) => b[1] - a[1])
            .map(([party, count]) => (
              <div
                key={party}
                className="p-3 rounded bg-gray-800 border-l-4 cursor-pointer hover:bg-gray-700 transition-colors"
                style={{ borderColor: getPartyColor(party) }}
                onMouseEnter={() => setHoveredParty(party)}
                onMouseLeave={() => setHoveredParty(null)}
              >
                <div className="text-gray-300 text-sm">
                  {PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name || party}
                </div>
                <div className="text-white text-lg font-bold">{count}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-300 text-sm">
        <p>Pasa el mouse sobre los escaños para ver detalles. Haz clic en los partidos para resaltar.</p>
      </div>
    </div>
  );
};
