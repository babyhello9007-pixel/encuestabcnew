import React, { useMemo, useState } from 'react';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from '@/lib/surveyData';

// Estructura adaptada a la tabla public.party_configuration
export interface PartyConfig {
  id?: number;
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active?: boolean;
  party_type?: string;
}

interface CongressHemicycleProps {
  escanos: Record<string, number>;
  totalEscanos?: number;
  provinciaSeleccionada?: string | null;
  votosProvincia?: Record<string, number>;
  escanosProvincia?: Record<string, number>;
  /**
   * Diccionario con la configuración de la base de datos `party_configuration`.
   * Clave: party_key, Valor: PartyConfig o meta resumido.
   */
  partyMeta?: Record<string, PartyConfig | { name: string; color: string; logo?: string; logo_url?: string }>;
}

interface SeatInfo {
  party: string;
  x: number;
  y: number;
  seatNumber: number;
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

  // Cálculo de mayoría absoluta (mitad + 1)
  const majority = Math.floor(totalEscanos / 2) + 1;

  // Resolutores de metadatos con fallback encadenado (DB -> surveyData -> defaults)
  const resolvePartyName = (partyKey: string): string => {
    const meta = partyMeta?.[partyKey];
    if (meta) {
      if ('display_name' in meta && meta.display_name) return meta.display_name;
      if ('name' in meta && meta.name) return meta.name;
    }
    return (
      PARTIES_GENERAL[partyKey as keyof typeof PARTIES_GENERAL]?.name ||
      YOUTH_ASSOCIATIONS[partyKey as keyof typeof YOUTH_ASSOCIATIONS]?.name ||
      partyKey
    );
  };

  const resolvePartyColor = (partyKey: string): string => {
    const meta = partyMeta?.[partyKey];
    if (meta?.color) return meta.color;
    return '#9CA3AF'; // Slate 400 default
  };

  const resolvePartyLogo = (partyKey: string): string | null => {
    const meta = partyMeta?.[partyKey];
    if (!meta) return null;
    if ('logo_url' in meta && meta.logo_url) return meta.logo_url;
    if ('logo' in meta && meta.logo) return meta.logo;
    return null;
  };

  // 1. Array plano de asientos ordenados por representación
  const sortedParties = useMemo(() => {
    return Object.entries(escanos).sort((a, b) => b[1] - a[1]);
  }, [escanos]);

  const allSeats = useMemo(() => {
    const seats: string[] = [];
    sortedParties.forEach(([party, count]) => {
      for (let i = 0; i < count; i++) {
        seats.push(party);
      }
    });
    return seats;
  }, [sortedParties]);

  // 2. Algoritmo de distribución radial en arcos concéntricos para el Hemiciclo
  const seatPositions = useMemo(() => {
    const positions: SeatInfo[] = [];
    if (allSeats.length === 0) return positions;

    const centerX = 620;
    const centerY = 450;
    const minRadius = 130;
    const maxRadius = 380;
    const numRows = totalEscanos <= 100 ? 7 : 12;

    // Calcular capacidad proporcional por fila en base a la longitud del arco
    const rowRadii: number[] = [];
    let totalArcLength = 0;

    for (let r = 0; r < numRows; r++) {
      const radius = minRadius + (r / (numRows - 1)) * (maxRadius - minRadius);
      rowRadii.push(radius);
      totalArcLength += Math.PI * radius;
    }

    // Distribuir el total de escaños en función de la longitud relativa de cada arco
    const rowCounts: number[] = new Array(numRows).fill(0);
    let assignedSeats = 0;

    for (let r = 0; r < numRows; r++) {
      const arcLength = Math.PI * rowRadii[r];
      const count = Math.round((arcLength / totalArcLength) * allSeats.length);
      rowCounts[r] = count;
      assignedSeats += count;
    }

    // Ajustar posibles diferencias por redondeo
    let diff = allSeats.length - assignedSeats;
    let rIdx = numRows - 1;
    while (diff !== 0 && rIdx >= 0) {
      if (diff > 0) {
        rowCounts[rIdx]++;
        diff--;
      } else if (diff < 0 && rowCounts[rIdx] > 0) {
        rowCounts[rIdx]--;
        diff++;
      }
      rIdx = (rIdx - 1 + numRows) % numRows;
    }

    // Asignar coordenadas (x, y) a cada escaño
    let globalSeatIndex = 0;
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const radius = rowRadii[rowIndex];
      const countInRow = rowCounts[rowIndex];

      for (let seatInRow = 0; seatInRow < countInRow; seatInRow++) {
        if (globalSeatIndex >= allSeats.length) break;

        // Distribución uniforme de izquierda (PI) a derecha (0)
        const angleProgress = countInRow > 1 ? seatInRow / (countInRow - 1) : 0.5;
        const angle = Math.PI - angleProgress * Math.PI;

        positions.push({
          party: allSeats[globalSeatIndex],
          x: centerX + radius * Math.cos(angle),
          y: centerY - radius * Math.sin(angle),
          seatNumber: globalSeatIndex + 1,
        });

        globalSeatIndex++;
      }
    }

    return positions;
  }, [allSeats, totalEscanos]);

  // Datos del partido activo en hover para el Tooltip central/flotante
  const hoveredPartyStats = useMemo(() => {
    if (!hoveredParty) return null;
    const count = escanos[hoveredParty] || 0;
    const percentage = ((count / totalEscanos) * 100).toFixed(1);
    return {
      key: hoveredParty,
      name: resolvePartyName(hoveredParty),
      color: resolvePartyColor(hoveredParty),
      logo: resolvePartyLogo(hoveredParty),
      count,
      percentage,
    };
  }, [hoveredParty, escanos, totalEscanos]);

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Panel de provincia seleccionada (si aplica) */}
      {provinciaSeleccionada && votosProvincia && Object.keys(votosProvincia).length > 0 && (
        <div className="p-5 rounded-2xl border bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Provincia: <span className="text-blue-400">{provinciaSeleccionada}</span>
            </h3>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Resultados locales</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(votosProvincia)
              .sort((a, b) => b[1] - a[1])
              .map(([party, votos]) => {
                const logo = resolvePartyLogo(party);
                return (
                  <div
                    key={party}
                    className="p-3 rounded-xl bg-slate-800/60 border-l-4 transition-transform hover:scale-[1.02]"
                    style={{ borderColor: resolvePartyColor(party) }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {logo && <img src={logo} alt="" className="w-4 h-4 object-contain" />}
                      <span className="text-slate-200 text-xs font-semibold truncate">{resolvePartyName(party)}</span>
                    </div>
                    <div className="text-white text-base font-extrabold">{votos.toLocaleString()} <span className="text-xs font-normal text-slate-400">votos</span></div>
                    <div className="text-slate-300 text-xs font-medium mt-0.5">
                      {escanosProvincia?.[party] || 0} {escanosProvincia?.[party] === 1 ? 'escaño' : 'escaños'}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Contenedor principal del Hemiciclo */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Cabecera superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-white text-base">Hemiciclo en Vivo</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400 text-xs">Representación parlamentaria</span>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="text-slate-400">Mayoría absoluta:</span>
            <span className="font-bold text-emerald-400">{majority}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">{totalEscanos} escaños</span>
          </div>
        </div>

        {/* SVG Hemicycle con perspectiva */}
        <div className="relative w-full overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1240 520"
            className="w-full h-auto transition-transform duration-500"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="floorGradient" cx="50%" cy="80%" r="70%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Suelo decorativo del hemiciclo */}
            <ellipse cx="620" cy="450" rx="430" ry="110" fill="url(#floorGradient)" opacity="0.8" />
            <line x1="180" y1="450" x2="1060" y2="450" stroke="#334155" strokeDasharray="4 4" strokeWidth="1.5" />

            {/* Tribuna de Presidencia */}
            <g transform="translate(555, 432)">
              <rect width="130" height="28" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text x="65" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8" letterSpacing="1">
                PRESIDENCIA
              </text>
            </g>

            {/* Renderizado de escaños */}
            {seatPositions.map((seat) => {
              const isHovered = hoveredParty === seat.party;
              const isOtherHovered = hoveredParty !== null && !isHovered;
              const color = resolvePartyColor(seat.party);
              const radius = totalEscanos <= 100 ? 10 : 7.5;

              return (
                <g
                  key={`seat-${seat.seatNumber}`}
                  onMouseEnter={() => setHoveredParty(seat.party)}
                  onMouseLeave={() => setHoveredParty(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={isHovered ? radius + 3 : radius}
                    fill={color}
                    opacity={isOtherHovered ? 0.25 : 1}
                    filter={isHovered ? 'url(#glow)' : undefined}
                    className="transition-all duration-150"
                  />
                  {isHovered && (
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={radius + 5}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  )}
                </g>
              );
            })}

            {/* Tooltip central informativo dentro del SVG */}
            {hoveredPartyStats && (
              <g transform="translate(620, 360)">
                <rect
                  x="-120"
                  y="-40"
                  width="240"
                  height="65"
                  rx="12"
                  fill="#0f172a"
                  stroke={hoveredPartyStats.color}
                  strokeWidth="2"
                  className="shadow-2xl opacity-95"
                />
                <text x="0" y="-18" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                  {hoveredPartyStats.name}
                </text>
                <text x="0" y="8" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="800">
                  {hoveredPartyStats.count} {hoveredPartyStats.count === 1 ? 'escaño' : 'escaños'}
                  <tspan fill="#94a3b8" fontSize="12" fontWeight="normal"> ({hoveredPartyStats.percentage}%)</tspan>
                </text>
                {hoveredPartyStats.count >= majority && (
                  <text x="0" y="20" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                    MAYORÍA ABSOLUTA REACHED
                  </text>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Leyenda inferior informativa */}
        <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Total hemiciclo: <span className="font-bold text-white">{totalEscanos}</span> escaños
          </div>
          <div>
            Partidos representados: <span className="font-bold text-white">{sortedParties.length}</span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas detalladas por partido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedParties.map(([party, count]) => {
          const color = resolvePartyColor(party);
          const name = resolvePartyName(party);
          const logo = resolvePartyLogo(party);
          const percentage = ((count / totalEscanos) * 100).toFixed(1);
          const isMajority = count >= majority;
          const isHovered = hoveredParty === party;

          return (
            <div
              key={party}
              onMouseEnter={() => setHoveredParty(party)}
              onMouseLeave={() => setHoveredParty(null)}
              className={`group relative p-3.5 rounded-2xl bg-slate-900/80 border transition-all duration-200 cursor-pointer overflow-hidden ${
                isHovered
                  ? 'border-slate-400 scale-[1.03] shadow-lg shadow-black/50 bg-slate-800/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Barra indicadora superior del color del partido */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-200"
                style={{ backgroundColor: color }}
              />

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {logo ? (
                    <img
                      src={logo}
                      alt={name}
                      className="w-5 h-5 object-contain flex-shrink-0 rounded"
                      onError={(e) => {
                        // Ocultar si la URL del logo falla
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  )}
                  <span className="text-slate-200 text-xs font-bold truncate group-hover:text-white">
                    {name}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-white text-2xl font-black tracking-tight">{count}</span>
                <span className="text-xs font-semibold text-slate-400">{percentage}%</span>
              </div>

              {/* Barra de progreso de representación */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>

              {/* Badge de mayoría absoluta */}
              {isMajority && (
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mayoría absoluta
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
