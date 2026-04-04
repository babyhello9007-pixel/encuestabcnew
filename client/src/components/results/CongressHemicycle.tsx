import React, { useMemo, useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from '@/lib/surveyData';

interface CongressHemicycleProps {
  escanos: Record<string, number>;
  totalEscanos?: number;
  provinciaSeleccionada?: string | null;
  votosProvincia?: Record<string, number>;
  escanosProvincia?: Record<string, number>;
  partyMeta?: Record<string, { name: string; color: string; logo: string }>;
}

interface SeatInfo {
  party: string;
  x: number;
  y: number;
  totalSeats: number;
  percentage: number;
}

export const CongressHemicycle: React.FC<CongressHemicycleProps> = ({
  escanos,
  totalEscanos = 350,
  provinciaSeleccionada,
  votosProvincia,
  escanosProvincia,
  partyMeta,
}) => {
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);

  const majority = totalEscanos === 100 ? 51 : 176;

  const resolvePartyName = (party: string) => {
    return (
      partyMeta?.[party]?.name ||
      PARTIES_GENERAL[party as keyof typeof PARTIES_GENERAL]?.name ||
      YOUTH_ASSOCIATIONS[party as keyof typeof YOUTH_ASSOCIATIONS]?.name ||
      party
    );
  };

  const resolvePartyColor = (party: string) => {
    return partyMeta?.[party]?.color || getPartyColor(party);
  };

  const allSeats: Array<{ party: string; totalSeats: number }> = [];
  Object.entries(escanos)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      for (let i = 0; i < count; i++) allSeats.push({ party, totalSeats: count });
    });

  const seatPositions = useMemo(() => {
    const positions: SeatInfo[] = [];
    const centerX = 620;
    const centerY = 430;
    const minRadius = 40;
    const maxRadius = 390;
    const numRows = totalEscanos === 100 ? 8 : 13;

    const totalSeatsToDistribute = allSeats.length;
    const baseSeatsPerRow = Math.floor(totalSeatsToDistribute / numRows);
    const extraSeats = totalSeatsToDistribute % numRows;

    let seatIndex = 0;

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const radiusProgress = rowIndex / (numRows - 1);
      const radius = minRadius + (maxRadius - minRadius) * radiusProgress;
      const seatsInRow = baseSeatsPerRow + (rowIndex >= numRows - extraSeats ? 1 : 0);

      for (let i = 0; i < seatsInRow && seatIndex < allSeats.length; i++) {
        const angleProgress = i / Math.max(1, seatsInRow - 1);
        const angle = Math.PI - Math.PI * angleProgress;

        const seat = allSeats[seatIndex];
        positions.push({
          party: seat.party,
          x: centerX + radius * Math.cos(angle),
          y: centerY - radius * Math.sin(angle),
          totalSeats: seat.totalSeats,
          percentage: Number(((seat.totalSeats / totalEscanos) * 100).toFixed(1)),
        });

        seatIndex++;
      }
    }

    return positions;
  }, [totalEscanos, allSeats]);

  const sortedParties = Object.entries(escanos).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full space-y-4">
      {provinciaSeleccionada && votosProvincia && Object.keys(votosProvincia).length > 0 && (
        <div className="p-4 rounded-xl border bg-slate-900 border-slate-700">
          <h3 className="text-white font-bold mb-3">Provincia: {provinciaSeleccionada}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(votosProvincia)
              .sort((a, b) => b[1] - a[1])
              .map(([party, votos]) => (
                <div key={party} className="p-3 rounded bg-slate-800 border-l-4" style={{ borderColor: resolvePartyColor(party) }}>
                  <div className="text-slate-200 text-sm font-semibold">{resolvePartyName(party)}</div>
                  <div className="text-white text-lg font-bold">{votos} votos</div>
                  <div className="text-slate-300 text-sm">{escanosProvincia?.[party] || 0} escaños</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-700 bg-gradient-to-b from-slate-950 to-slate-900 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-slate-300">
          <span className="font-semibold text-white">Mayoría:</span>
          <span>{majority} / {totalEscanos} escaños</span>
        </div>

        <svg width="100%" height="auto" viewBox="0 0 1240 540" className="w-full" preserveAspectRatio="xMidYMid meet">
          <line x1="220" y1="430" x2="1020" y2="430" stroke="#475569" strokeDasharray="5 5" opacity="0.35" />

          {seatPositions.map((seat, idx) => {
            const isHovered = hoveredParty === seat.party;
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
                  r={totalEscanos === 100 ? 8.5 : 7.5}
                  fill={resolvePartyColor(seat.party)}
                  opacity={isHovered ? 1 : 0.82}
                />
                {isHovered && (
                  <circle cx={seat.x} cy={seat.y} r={totalEscanos === 100 ? 12 : 11} fill="none" stroke="#fff" strokeWidth="2" />
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-slate-300">
            Total: <span className="font-semibold text-white">{totalEscanos}</span> escaños
          </div>
          {hoveredParty && (
            <div className="text-slate-200">
              {resolvePartyName(hoveredParty)} · <span className="font-semibold text-white">{escanos[hoveredParty] || 0}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedParties.map(([party, count]) => {
          const reachedMajority = count >= majority;
          return (
            <div
              key={party}
              className="p-3 rounded-lg bg-slate-900 border transition-colors"
              style={{ borderColor: `${resolvePartyColor(party)}66` }}
              onMouseEnter={() => setHoveredParty(party)}
              onMouseLeave={() => setHoveredParty(null)}
            >
              <div className="text-slate-300 text-sm font-medium">{resolvePartyName(party)}</div>
              <div className="text-white text-2xl font-bold">{count}</div>
              <div className="text-xs" style={{ color: resolvePartyColor(party) }}>{((count / totalEscanos) * 100).toFixed(1)}%</div>
              {reachedMajority && <div className="text-[11px] text-emerald-400 mt-1">Mayoría absoluta</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
