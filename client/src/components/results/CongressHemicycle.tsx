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
 * Distribución política real: Izquierda (PSOE), Centro (VOX), Derecha (PP)
 */
export const CongressHemicycle: React.FC<CongressHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
  provinciaSeleccionada,
  votosProvincia,
  escanosProvincia,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);

  // Clasificación política de partidos: izquierda, centro, derecha
  const getPartyPosition = (party: string): 'left' | 'center' | 'right' => {
    const leftParties = ['PSOE', 'PODEMOS', 'SUMAR', 'Izquierda Española', 'ERC', 'BILDU', 'Bloque Nacionalista Galego'];
    const rightParties = ['PP', 'Ciudadanos', 'UPN'];
    const centerParties = ['VOX', 'Se Acabó La Fiesta', 'P-Lib'];
    const catalanParties = ['Aliança Catalana', 'JUNTS'];
    const otherParties = ['PNV', 'Coalición Canaria', 'Escaños en Blanco', 'Frente Obrero', 'Caminando Juntos', 'Falange Española de las JONS', 'Soberanía y Trabajo.', 'Otros'];

    if (leftParties.includes(party)) return 'left';
    if (rightParties.includes(party)) return 'right';
    if (centerParties.includes(party)) return 'center';
    if (catalanParties.includes(party)) return 'right'; // Nacionalistas a la derecha
    if (otherParties.includes(party)) return 'center'; // Otros al centro

    return 'center'; // Default
  };

  // Crear array de escaños ordenados por posición política y votos
  const seatArray: Array<{ party: string; index: number; position: 'left' | 'center' | 'right' }> = [];
  let seatIndex = 0;

  // Agrupar por posición política
  const leftParties: Array<[string, number]> = [];
  const centerParties: Array<[string, number]> = [];
  const rightParties: Array<[string, number]> = [];

  Object.entries(escanos).forEach(([party, count]) => {
    const pos = getPartyPosition(party);
    if (pos === 'left') leftParties.push([party, count]);
    else if (pos === 'center') centerParties.push([party, count]);
    else rightParties.push([party, count]);
  });

  // Ordenar cada grupo por votos (descendente)
  leftParties.sort((a, b) => b[1] - a[1]);
  centerParties.sort((a, b) => b[1] - a[1]);
  rightParties.sort((a, b) => b[1] - a[1]);

  // Crear array de escaños: izquierda, centro, derecha
  for (const [party, count] of leftParties) {
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++, position: 'left' });
    }
  }
  for (const [party, count] of centerParties) {
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++, position: 'center' });
    }
  }
  for (const [party, count] of rightParties) {
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++, position: 'right' });
    }
  }

  // Distribución en 12 filas semicirculares
  const rows = 12;
  const seatsPerRow = Math.ceil(totalEscanos / rows);

  const hemicycleRows: Array<Array<{ party: string; index: number; position: 'left' | 'center' | 'right' }>> = [];
  for (let i = 0; i < rows; i++) {
    const start = i * seatsPerRow;
    const end = Math.min(start + seatsPerRow, seatArray.length);
    hemicycleRows.push(seatArray.slice(start, end));
  }

  // Calcular posiciones de escaños en semicírculo REAL
  const getSeatPositions = () => {
    const positions: Array<{ x: number; y: number; party: string; index: number }> = [];
    const centerX = 400;
    const centerY = 450;
    const startRadius = 80;
    const radiusStep = 28;

    hemicycleRows.forEach((row, rowIndex) => {
      const radius = startRadius + rowIndex * radiusStep;
      const seatsInRow = row.length;

      row.forEach((seat, seatIdx) => {
        // Distribuir en SEMICÍRCULO (0 a π radianes)
        // Izquierda: π a π/2, Centro: π/2 a 0, Derecha: 0 a -π/2
        let angle: number;

        if (seat.position === 'left') {
          // Lado izquierdo: π a π/2
          angle = Math.PI - (Math.PI / 2) * (seatIdx / (seatsInRow - 1 || 1));
        } else if (seat.position === 'right') {
          // Lado derecho: 0 a -π/2
          angle = -(Math.PI / 2) * (seatIdx / (seatsInRow - 1 || 1));
        } else {
          // Centro: π/2 a 0
          angle = (Math.PI / 2) - (Math.PI / 2) * (seatIdx / (seatsInRow - 1 || 1));
        }

        // Convertir a coordenadas cartesianas
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);

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
      <div className="p-4 bg-gray-900 rounded-lg flex justify-center items-center overflow-x-auto">
        <svg
          width="900"
          height="500"
          viewBox="0 0 800 500"
          className="min-w-full"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Fondo del hemiciclo - semicírculo */}
          <path
            d="M 50 450 A 350 350 0 0 1 750 450"
            fill="#0a0a0a"
            stroke="#444"
            strokeWidth="2"
          />

          {/* Líneas de referencia (arcos semicirculares) */}
          {[1, 2, 3, 4, 5].map((i) => (
            <path
              key={`arc-${i}`}
              d={`M ${400 - (80 + i * 28)} 450 A ${80 + i * 28} ${80 + i * 28} 0 0 1 ${400 + (80 + i * 28)} 450`}
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Escaños */}
          {seatPositions.map((seat, idx) => {
            const isHovered = hoveredParty === seat.party;
            const seatSize = 8;

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
            x="100"
            y="430"
            textAnchor="middle"
            fontSize="12"
            fill="#999"
            fontWeight="bold"
          >
            IZQUIERDA
          </text>
          <text
            x="400"
            y="430"
            textAnchor="middle"
            fontSize="12"
            fill="#999"
            fontWeight="bold"
          >
            CENTRO
          </text>
          <text
            x="700"
            y="430"
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
            y="470"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#999"
          >
            Congreso de los Diputados
          </text>
          <text
            x="400"
            y="490"
            textAnchor="middle"
            fontSize="14"
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
