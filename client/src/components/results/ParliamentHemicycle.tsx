import React, { useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface ParliamentHemicycleProps {
  escanos: Record<string, number>;
  totalEscanos?: number;
}

/**
 * Visualización de hemiciclo parlamentario con 350 escaños distribuidos por partido
 */
export const ParliamentHemicycle: React.FC<ParliamentHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);

  // Crear array de escaños con información del partido
  const seatArray: Array<{ party: string; index: number }> = [];
  let seatIndex = 0;

  for (const [party, count] of Object.entries(escanos).sort((a, b) => b[1] - a[1])) {
    for (let i = 0; i < count; i++) {
      seatArray.push({ party, index: seatIndex++ });
    }
  }

  // Completar con escaños vacíos si es necesario
  while (seatIndex < totalEscanos) {
    seatArray.push({ party: 'EMPTY', index: seatIndex++ });
  }

  // Distribuir escaños en forma de hemiciclo (semicírculo)
  // Usamos una distribución en arcos concéntricos
  const rows = 10; // Número de filas del hemiciclo
  const seatsPerRow = Math.ceil(totalEscanos / rows);

  // Agrupar escaños por filas
  const hemicycleRows: Array<Array<{ party: string; index: number }>> = [];
  for (let i = 0; i < rows; i++) {
    const start = i * seatsPerRow;
    const end = Math.min(start + seatsPerRow, seatArray.length);
    hemicycleRows.push(seatArray.slice(start, end));
  }

  return (
    <div className="w-full space-y-4">
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

      {/* Hemiciclo */}
      <div className="p-6 bg-gray-900 rounded-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          {hemicycleRows.map((row, rowIndex) => {
            // Calcular el ángulo para distribuir en semicírculo
            const angle = (rowIndex / (rows - 1)) * Math.PI; // 0 a π radianes
            const radius = 100 + rowIndex * 20; // Radio aumenta con cada fila
            const maxWidth = Math.sin(angle) * radius * 2;

            return (
              <div
                key={rowIndex}
                className="flex justify-center gap-1"
                style={{
                  width: `${Math.min(maxWidth, 100)}%`,
                  maxWidth: '100%',
                }}
              >
                {row.map((seat) => (
                  <button
                    key={seat.index}
                    onMouseEnter={() => seat.party !== 'EMPTY' && setHoveredParty(seat.party)}
                    onMouseLeave={() => setHoveredParty(null)}
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all transform ${
                      hoveredParty === seat.party ? 'scale-150 ring-2 ring-white' : ''
                    } ${seat.party === 'EMPTY' ? 'opacity-30' : 'hover:scale-125 cursor-pointer'}`}
                    style={{
                      backgroundColor:
                        seat.party === 'EMPTY'
                          ? '#444444'
                          : getPartyColor(seat.party),
                    }}
                    title={
                      seat.party === 'EMPTY'
                        ? 'Escaño vacío'
                        : `${PARTIES_GENERAL[seat.party as keyof typeof PARTIES_GENERAL]?.name || seat.party} (Escaño ${seat.index + 1})`
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-3 bg-gray-800 rounded text-center">
          <p className="text-gray-400 text-sm">
            Total: <span className="text-white font-semibold">{totalEscanos}</span> escaños
          </p>
          {hoveredParty && hoveredParty !== 'EMPTY' && (
            <p className="text-white mt-2">
              {PARTIES_GENERAL[hoveredParty as keyof typeof PARTIES_GENERAL]?.name || hoveredParty}:{' '}
              <span className="font-semibold">{escanos[hoveredParty] || 0}</span> escaños
            </p>
          )}
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
                className="p-3 rounded bg-gray-800 border-l-4"
                style={{ borderColor: getPartyColor(party) }}
              >
                <div className="text-gray-300 text-sm">
                  {PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name || party}
                </div>
                <div className="text-white text-lg font-bold">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
