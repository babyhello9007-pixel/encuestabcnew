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
 * Estructura real: columnas verticales
 * Izquierda (PSOE), Centro (gris), Derecha (PP)
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

  // Clasificación política de partidos
  const getPartyPosition = (party: string): 'left' | 'center' | 'right' => {
    const leftParties = ['PSOE', 'PODEMOS', 'SUMAR', 'Izquierda Española', 'ERC', 'BILDU', 'Bloque Nacionalista Galego'];
    const rightParties = ['PP', 'Ciudadanos', 'UPN', 'Aliança Catalana', 'JUNTS'];
    const centerParties = ['VOX', 'Se Acabó La Fiesta', 'P-Lib'];

    if (leftParties.includes(party)) return 'left';
    if (rightParties.includes(party)) return 'right';
    if (centerParties.includes(party)) return 'center';

    return 'center';
  };

  // Agrupar escaños por partido y posición
  const leftByParty: Array<{ party: string; count: number }> = [];
  const centerByParty: Array<{ party: string; count: number }> = [];
  const rightByParty: Array<{ party: string; count: number }> = [];

  Object.entries(escanos)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      const pos = getPartyPosition(party);
      if (pos === 'left') leftByParty.push({ party, count });
      else if (pos === 'center') centerByParty.push({ party, count });
      else rightByParty.push({ party, count });
    });

  // Calcular posiciones de escaños en estructura de hemiciclo real
  const getSeatPositions = (): SeatInfo[] => {
    const positions: SeatInfo[] = [];
    const centerX = 400;
    const baseY = 350;
    const seatSize = 8;
    const seatSpacing = 16; // Espacio entre escaños en columna
    const columnWidth = 16; // Ancho de columna
    const maxRows = 20; // Máximo de filas

    // Función para posicionar escaños en columnas verticales
    const addPartyColumn = (party: string, count: number, columnIndex: number, isLeft: boolean) => {
      const percentage = ((count / totalEscanos) * 100).toFixed(1);
      
      for (let row = 0; row < count; row++) {
        let x: number;
        if (isLeft) {
          x = centerX - 150 - (columnIndex * columnWidth);
        } else {
          x = centerX + 150 + (columnIndex * columnWidth);
        }

        const y = baseY + (row * seatSpacing);

        positions.push({
          party,
          x,
          y,
          totalSeats: count,
          percentage: parseFloat(percentage),
        });
      }
    };

    // Posicionar escaños de izquierda
    leftByParty.forEach((item, idx) => {
      addPartyColumn(item.party, item.count, idx, true);
    });

    // Posicionar escaños del centro
    centerByParty.forEach((item, idx) => {
      const x = centerX + (idx - Math.floor(centerByParty.length / 2)) * columnWidth;
      const percentage = ((item.count / totalEscanos) * 100).toFixed(1);
      
      for (let row = 0; row < item.count; row++) {
        const y = baseY + (row * seatSpacing);
        positions.push({
          party: item.party,
          x,
          y,
          totalSeats: item.count,
          percentage: parseFloat(percentage),
        });
      }
    });

    // Posicionar escaños de derecha
    rightByParty.forEach((item, idx) => {
      addPartyColumn(item.party, item.count, idx, false);
    });

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
      <div className="p-4 bg-gray-900 rounded-lg flex justify-center items-center overflow-x-auto relative">
        <svg
          width="900"
          height="600"
          viewBox="0 0 800 600"
          className="min-w-full"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Fondo del hemiciclo */}
          <ellipse
            cx="400"
            cy="350"
            rx="350"
            ry="280"
            fill="#0a0a0a"
            stroke="#444"
            strokeWidth="2"
          />

          {/* Líneas de referencia */}
          {[1, 2, 3, 4, 5].map((i) => (
            <circle
              key={`arc-${i}`}
              cx="400"
              cy="350"
              r={i * 50}
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
              opacity="0.2"
            />
          ))}

          {/* Escaños */}
          {seatPositions.map((seat, idx) => {
            const isHovered = hoveredParty === seat.party;
            const seatSize = 8;

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
                  r={seatSize}
                  fill={getPartyColor(seat.party)}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all"
                />
                {isHovered && (
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={seatSize + 4}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Etiquetas de posición política */}
          <text
            x="80"
            y="350"
            textAnchor="middle"
            fontSize="12"
            fill="#999"
            fontWeight="bold"
          >
            IZQUIERDA
          </text>
          <text
            x="400"
            y="580"
            textAnchor="middle"
            fontSize="12"
            fill="#999"
            fontWeight="bold"
          >
            CENTRO
          </text>
          <text
            x="720"
            y="350"
            textAnchor="middle"
            fontSize="12"
            fill="#999"
            fontWeight="bold"
          >
            DERECHA
          </text>

          {/* Texto central */}
          <text
            x="400"
            y="360"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#999"
          >
            Congreso de los Diputados
          </text>
          <text
            x="400"
            y="385"
            textAnchor="middle"
            fontSize="14"
            fill="#666"
            fontWeight="bold"
          >
            {totalEscanos}
          </text>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-gray-800 text-white px-3 py-2 rounded shadow-lg text-sm border border-gray-600 pointer-events-none z-10"
            style={{
              left: `${(tooltip.x / 800) * 100}%`,
              top: `${(tooltip.y / 600) * 100}%`,
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
