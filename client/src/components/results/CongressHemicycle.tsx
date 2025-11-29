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
 */
export const CongressHemicycle: React.FC<CongressHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
  provinciaSeleccionada,
  votosProvincia,
  escanosProvincia,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);

  // Crear array de escaños ordenados por partido (mayor a menor)
  const seatArray: Array<{ party: string; index: number }> = [];
  let seatIndex = 0;

  const sortedParties = Object.entries(escanos)
    .sort((a, b) => b[1] - a[1])
    .map(([party]) => party);

  for (const party of sortedParties) {
    const count = escanos[party] || 0;
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++ });
    }
  }

  // Distribución en 15 filas semicirculares
  const rows = 15;
  const seatsPerRow = Math.ceil(totalEscanos / rows);

  const hemicycleRows: Array<Array<{ party: string; index: number }>> = [];
  for (let i = 0; i < rows; i++) {
    const start = i * seatsPerRow;
    const end = Math.min(start + seatsPerRow, seatArray.length);
    hemicycleRows.push(seatArray.slice(start, end));
  }

  // Calcular posiciones de escaños en semicírculo
  const getSeatPositions = () => {
    const positions: Array<{ x: number; y: number; party: string; index: number }> = [];
    const centerX = 250;
    const centerY = 250;
    const startRadius = 50;
    const radiusStep = 20;

    hemicycleRows.forEach((row, rowIndex) => {
      const radius = startRadius + rowIndex * radiusStep;
      const seatsInRow = row.length;

      row.forEach((seat, seatIdx) => {
        // Distribuir en semicírculo (0 a π radianes)
        const angle = (Math.PI * seatIdx) / (seatsInRow - 1 || 1);
        
        // Convertir a coordenadas cartesianas
        const x = centerX + radius * Math.cos(angle - Math.PI / 2);
        const y = centerY + radius * Math.sin(angle - Math.PI / 2);

        positions.push({
          x,
          y,
          party: seat.party,
          index: seat.index,
        });
      });
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
      <div className="p-4 bg-gray-900 rounded-lg flex justify-center items-center">
        <svg
          width="100%"
          height="600"
          viewBox="0 0 500 350"
          className="max-w-4xl"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Fondo del hemiciclo */}
          <ellipse
            cx="250"
            cy="250"
            rx="230"
            ry="230"
            fill="#0a0a0a"
            stroke="#444"
            strokeWidth="2"
          />

          {/* Líneas de referencia (arcos) */}
          {[1, 2, 3, 4, 5].map((i) => (
            <circle
              key={`arc-${i}`}
              cx="250"
              cy="250"
              r={50 + i * 20}
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Escaños */}
          {seatPositions.map((seat, idx) => {
            const isHovered = hoveredParty === seat.party;
            const seatSize = 6;

            return (
              <g
                key={`seat-${idx}`}
                onMouseEnter={() => setHoveredParty(seat.party)}
                onMouseLeave={() => setHoveredParty(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={seatSize}
                  fill={getPartyColor(seat.party)}
                  opacity={isHovered ? 1 : 0.8}
                  className="transition-all"
                />
                {isHovered && (
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={seatSize + 3}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Texto central */}
          <text
            x="250"
            y="280"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#999"
          >
            Congreso de los Diputados
          </text>
          <text
            x="250"
            y="300"
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {totalEscanos} escaños
          </text>
        </svg>
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
