import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { getPartyColor } from "@/lib/partyConfig";
import { normalizeProvinceName } from "@/lib/provinceNameNormalizer";

interface Province {
  name: string;
  votes: { [key: string]: number };
  totalVotes: number;
  winnerParty: string;
  age: number;
  ideology: number;
}

interface SpainMapRealisticProps {
  provincesData: { [key: string]: Province };
  onProvinceSelect: (province: string | null) => void;
  selectedProvince: string | null;
}

interface TopoJSON {
  type: string;
  bbox: number[];
  transform: { scale: number[]; translate: number[] };
  objects: {
    provinces: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][][];
        id: string;
        properties: { name: string };
      }>;
    };
  };
}

// Auxiliar: Decodificar arcos TopoJSON
function decodeArcs(arcs: number[][], transform: { scale: number[]; translate: number[] }): number[][][] {
  const { scale, translate } = transform;
  return arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
}

// Auxiliar: Proyección Geo -> SVG
function geoToSvg(lon: number, lat: number, bbox: number[], width: number, height: number): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return [x, y];
}

export function SpainMapRealistic({
  provincesData,
  onProvinceSelect,
  selectedProvince,
}: SpainMapRealisticProps) {
  const [topoData, setTopoData] = useState<TopoJSON | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 900;
  const height = 650;

  useEffect(() => {
    let isMounted = true;
    fetch("/data/provinces.json")
      .then((res) => res.json())
      .then((data: TopoJSON) => {
        if (isMounted) {
          setTopoData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error cargando TopoJSON:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Optimización: Mapa de normalización de datos O(1)
  const normalizedDataMap = useMemo(() => {
    const map = new Map<string, { originalKey: string; data: Province }>();
    Object.entries(provincesData).forEach(([key, val]) => {
      map.set(normalizeProvinceName(key), { originalKey: key, data: val });
    });
    return map;
  }, [provincesData]);

  // 2. Optimización: Procesar geometrías y paths en `useMemo`
  const processedGeometries = useMemo(() => {
    if (!topoData) return [];

    const { bbox, transform, objects } = topoData;
    const allArcs = objects.provinces.geometries.flatMap((g) => g.arcs);
    const decodedArcs = decodeArcs(allArcs, transform);

    const arcMap: { [key: number]: number[][] } = {};
    let arcIdxCounter = 0;

    objects.provinces.geometries.forEach((geom) => {
      geom.arcs.forEach((ring) => {
        ring.forEach((arcIdx) => {
          if (!arcMap[arcIdx]) {
            arcMap[arcIdx] = decodedArcs[arcIdxCounter++];
          }
        });
      });
    });

    const buildPath = (arcIndices: number[][]): string => {
      return arcIndices
        .map((ring) => {
          return ring
            .flatMap((arcIdx, pIdx) => {
              const arc = arcMap[Math.abs(arcIdx)];
              if (!arc) return [];
              const points = arcIdx < 0 ? [...arc].reverse() : arc;
              return points.map((p, i) => {
                const [sx, sy] = geoToSvg(p[0], p[1], bbox, width, height);
                return `${pIdx === 0 && i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
              });
            })
            .join(" ");
        })
        .join(" ") + "Z";
    };

    return objects.provinces.geometries.map((geom) => {
      const geoName = geom.properties.name;
      const normalized = normalizeProvinceName(geoName);
      const match = normalizedDataMap.get(normalized);

      return {
        id: geom.id,
        name: match ? match.originalKey : geoName,
        data: match ? match.data : null,
        pathData: buildPath(geom.arcs),
      };
    });
  }, [topoData, normalizedDataMap]);

  // Gestor del movimiento del ratón para el Tooltip dinámico
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  }, []);

  if (loading || !topoData) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#0B0F17] border border-white/10 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Cargando mapa interactivo...</p>
      </div>
    );
  }

  const activeProvinceData = selectedProvince ? provincesData[selectedProvince] : null;
  const hoveredProvinceObj = processedGeometries.find((g) => g.name === hoveredProvince);

  return (
    <div className="w-full flex flex-col items-center gap-6 select-none font-sans">
      {/* Contenedor Principal del Mapa estilo Liquid Dark */}
      <div className="relative w-full max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          className="w-full h-auto rounded-[22px] bg-[#0A0D14] overflow-hidden"
          style={{ aspectRatio: "16/11" }}
        >
          <defs>
            {/* Filtro de Resplandor Neón Glass */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Degradado de fondo para efecto nocturno profundo */}
            <radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#131B2E" />
              <stop offset="100%" stopColor="#080B11" />
            </radialGradient>
          </defs>

          {/* Fondo */}
          <rect width={width} height={height} fill="url(#bg-gradient)" />

          {/* Malla decorativa de fondo estilo Synthwave / Tech */}
          <g opacity="0.03" stroke="#FFFFFF" strokeWidth="1">
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 45} x2={width} y2={i * 45} />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 45} y1="0" x2={i * 45} y2={height} />
            ))}
          </g>

          {/* Renderizado de Provincias */}
          <g>
            {processedGeometries.map(({ id, name, data, pathData }) => {
              const isSelected = selectedProvince === name;
              const isHovered = hoveredProvince === name;
              const partyColor = data ? getPartyColor(data.winnerParty) || "#475569" : "#334155";
              const hasVotes = data && data.totalVotes > 0;

              return (
                <path
                  key={id}
                  d={pathData}
                  fill={partyColor}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : hasVotes ? 0.6 : 0.15}
                  stroke={isSelected ? "#FFFFFF" : isHovered ? "#38BDF8" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.6}
                  filter={isSelected || isHovered ? "url(#neon-glow)" : undefined}
                  className="cursor-pointer transition-all duration-200 ease-out hover:stroke-sky-400"
                  onMouseEnter={() => setHoveredProvince(name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={() => onProvinceSelect(isSelected ? null : name)}
                />
              );
            })}
          </g>

          {/* Tooltip Flotante Neomórfico que sigue al ratón */}
          {hoveredProvinceObj && hoveredProvinceObj.data && (
            <g
              transform={`translate(${Math.min(mousePos.x + 15, width - 210)}, ${Math.max(
                mousePos.y - 110,
                15
              )})`}
              className="pointer-events-none transition-transform duration-75 ease-out"
            >
              <rect
                width="190"
                height="95"
                rx="14"
                fill="#0F172A"
                fillOpacity="0.85"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                className="backdrop-blur-md shadow-2xl"
              />
              <text x="14" y="24" fill="#FFFFFF" fontSize="13" fontWeight="700">
                {hoveredProvinceObj.name}
              </text>

              <circle
                cx="165"
                cy="20"
                r="6"
                fill={getPartyColor(hoveredProvinceObj.data.winnerParty) || "#94A3B8"}
              />

              <text x="14" y="44" fill="#94A3B8" fontSize="11">
                Ganador:{" "}
                <tspan fill="#F8FAFC" fontWeight="600">
                  {hoveredProvinceObj.data.winnerParty}
                </tspan>
              </text>
              <text x="14" y="60" fill="#94A3B8" fontSize="11">
                Votos:{" "}
                <tspan fill="#F8FAFC" fontWeight="600">
                  {hoveredProvinceObj.data.totalVotes.toLocaleString()}
                </tspan>
              </text>
              <text x="14" y="76" fill="#94A3B8" fontSize="11">
                Edad media:{" "}
                <tspan fill="#F8FAFC" fontWeight="600">
                  {hoveredProvinceObj.data.age.toFixed(1)} años
                </tspan>
              </text>
            </g>
          )}

          {/* Leyenda Integrada en el Mapa (Glass Bar) */}
          <g transform="translate(25, 595)">
            <rect
              x="0"
              y="-18"
              width="360"
              height="36"
              rx="12"
              fill="#0F172A"
              fillOpacity="0.6"
              stroke="rgba(255, 255, 255, 0.1)"
              className="backdrop-blur-md"
            />
            {PARTIES_GENERAL.map((party, idx) => {
              const xPos = 15 + idx * 80;
              const color = getPartyColor(party.id) || party.color || "#94A3B8";
              return (
                <g key={party.id} transform={`translate(${xPos}, 0)`}>
                  <rect x="0" y="-5" width="10" height="10" rx="3" fill={color} />
                  <text x="15" y="4" fill="#E2E8F0" fontSize="11" fontWeight="500">
                    {party.name || party.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Panel de Detalle - Tarjeta Estilo Liquid Glass */}
      {selectedProvince && activeProvinceData && (
        <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Provincia Seleccionada
              </span>
              <h3 className="text-2xl font-extrabold text-white">{selectedProvince}</h3>
            </div>
            <button
              onClick={() => onProvinceSelect(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
            >
              Cerrar detalles ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 mb-1">Total Votos</p>
              <p className="text-2xl font-bold text-white">
                {activeProvinceData.totalVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 mb-1">Edad Media</p>
              <p className="text-2xl font-bold text-sky-300">
                {activeProvinceData.age.toFixed(1)}{" "}
                <span className="text-xs font-normal text-slate-400">años</span>
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 mb-1">Ideología Media</p>
              <p className="text-2xl font-bold text-emerald-400">
                {activeProvinceData.ideology.toFixed(1)}
                <span className="text-xs font-normal text-slate-400">/10</span>
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-center">
              <p className="text-xs text-slate-400 mb-1">Partido Ganador</p>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                  style={{
                    backgroundColor: getPartyColor(activeProvinceData.winnerParty) || "#CBD5E1",
                  }}
                />
                <p className="text-lg font-bold text-white">
                  {activeProvinceData.winnerParty}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
