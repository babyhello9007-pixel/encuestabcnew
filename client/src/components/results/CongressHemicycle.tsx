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

interface SeatInfo {
  party: string;
  x: number;
  y: number;
  totalSeats: number;
  percentage: number;
}

/**
 * Hemiciclo del Congreso de los Diputados Español
 * Estructura: gradas semicirculares de 180° con distribución uniforme
 * Sin agrupación por posición política
 */
export const CongressHemicycle: React.FC<CongressHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
  provinciaSeleccionada,
  votosProvincia,
  escanosProvincia,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; party: string; seats: number; percentage: number } | null>(null);

  // Crear lista de escaños individuales ordenados por partido
  const allSeats: Array<{ party: string; totalSeats: number }> = [];
  
  Object.entries(escanos)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      for (let i = 0; i < count; i++) {
        allSeats.push({ party, totalSeats: count });
      }
    });

  // Calcular posiciones de escaños
  const getSeatPositions = (): SeatInfo[] => {
    const positions: SeatInfo[] = [];
    const centerX = 600;
    const centerY = 410;
    const minRadius = 18;
    const maxRadius = 380;
    
    // Crear gradas con distribucion uniforme de 350 escanos en 13 filas
    const numRows = 13;
    const totalSeatsToDistribute = allSeats.length;
    const baseSeatsPerRow = Math.floor(totalSeatsToDistribute / numRows);
    const extraSeats = totalSeatsToDistribute % numRows;
    
    let seatIndex = 0;
    
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      // Calcular radio para esta fila
      const radiusProgress = rowIndex / (numRows - 1);
      const radius = minRadius + (maxRadius - minRadius) * radiusProgress;
      
      // Distribuir escanos: filas posteriores tienen mas escanos
      const seatsInRow = baseSeatsPerRow + (rowIndex >= numRows - extraSeats ? 1 : 0);
      
      // Distribuir escaños uniformemente en esta fila (180° a 0°) con espaciado
      for (let i = 0; i < seatsInRow && seatIndex < allSeats.length; i++) {
        // Ángulo: 180° (izquierda) a 0° (derecha)
        const angleProgress = i / Math.max(1, seatsInRow - 1);
        const angle = Math.PI - (Math.PI * angleProgress); // 180° a 0°
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);

        const seat = allSeats[seatIndex];
        const percentage = ((seat.totalSeats / totalEscanos) * 100).toFixed(1);

        positions.push({
          party: seat.party,
          x,
          y,
          totalSeats: seat.totalSeats,
          percentage: parseFloat(percentage),
        });

        seatIndex++;
      }
    }

    return positions;
  };

  const seatPositions = getSeatPositions();

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
            <div
              key={party}
              className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:bg-gray-800 transition-colors"
              onMouseEnter={() => setHoveredParty(party)}
              onMouseLeave={() => setHoveredParty(null)}
            >
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

      {/* Hemiciclo SVG */}
      <div className="p-4 bg-gray-900 rounded-lg flex flex-col justify-center items-center relative">
        <svg
          width="100%"
          height="auto"
          viewBox="0 0 1200 500"
          className="w-full"
          style={{ backgroundColor: '#1a1a1a', maxWidth: '800px' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Fondo del hemiciclo - sin sombra */}

          {/* Líneas de gradas (arcos de referencia) */}
          {Array.from({ length: 13 }).map((_, i) => {
            const radiusProgress = i / 12;
            const radius = 18 + (380 - 18) * radiusProgress;
            return (
              <path
                key={`grade-${i}`}
                d={`M ${600 - radius} 410 A ${radius} ${radius} 0 0 1 ${600 + radius} 410`}
                fill="none"
                stroke="#333"
                strokeWidth="0.5"
                opacity="0.1"
              />
            );
          })}

          {/* Escaños */}
          {seatPositions.map((seat, idx) => {
            const isHovered = hoveredParty === seat.party;

            return (
              <g
                key={`seat-${idx}`}
                onMouseEnter={() => {
                  setHoveredParty(seat.party);
                  setTooltip({
                    x: seat.x,
                    y: seat.y,
                    party: seat.party,
                    seats: seat.totalSeats,
                    percentage: seat.percentage,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredParty(null);
                  setTooltip(null);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={9}
                  fill={getPartyColor(seat.party)}
                  opacity={isHovered ? 1 : 0.75}
                  className="transition-all"
                />
                {isHovered && (
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={13}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Texto central - vacío */}
        </svg>
        
        {/* Número 350 debajo */}
        <div className="mt-4 text-center text-gray-400 text-2xl font-bold">
          {totalEscanos}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm border border-gray-600 pointer-events-none z-10"
            style={{
              left: `${(tooltip.x / 800) * 100}%`,
              top: `${(tooltip.y / 500) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-bold">{PARTIES_GENERAL[tooltip.party as keyof typeof PARTIES_GENERAL]?.name || tooltip.party}</div>
            <div className="text-gray-300">{tooltip.seats} escaños</div>
            <div className="text-gray-400">{tooltip.percentage}% del total</div>
          </div>
        )}
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
                <div className="text-gray-300 text-sm font-medium">
                  {PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name || party}
                </div>
                <div className="text-white text-2xl font-bold">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
