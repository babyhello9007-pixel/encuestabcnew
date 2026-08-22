import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { getPartyColor } from "@/lib/partyConfig";
import { normalizeProvinceName } from "@/lib/provinceNameNormalizer";

interface Province {
  name: string;
  votes?: { [key: string]: number };
  totalVotes?: number;
  winnerParty?: string;
  age?: number;
  ideology?: number;
}

interface SpainMapRealisticProps {
  provincesData: { [key: string]: Province };
  onProvinceSelect: (province: string | null) => void;
  selectedProvince: string | null;
  selectorMode?: boolean;
  mapLevel?: "province" | "ccaa";
}

type Coordinate = [number, number];
type TopologyArc = Coordinate[];
type PolygonArcs = number[][];
type MultiPolygonArcs = number[][][];

interface TopoJSON {
  type: string;
  bbox: [number, number, number, number];
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: TopologyArc[];
  objects: {
    provinces: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: PolygonArcs | MultiPolygonArcs;
        id: string;
        properties: { name: string };
      }>;
    };
    autonomous_regions?: {
      geometries: Array<{
        type: string;
        arcs: PolygonArcs | MultiPolygonArcs;
        id: string;
        properties: { name: string };
      }>;
    };
  };
}

type MapTheme = "night" | "satellite" | "cyberpunk";

// Decodificación TopoJSON
function decodeArcs(arcs: TopologyArc[], transform: { scale: [number, number]; translate: [number, number] }): TopologyArc[] {
  const { scale, translate } = transform;
  return arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]: Coordinate) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
}

function geoToSvg(lon: number, lat: number, bbox: number[], width: number, height: number): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return [x, y];
}

function normalizeGeoName(name: string, mapLevel: "province" | "ccaa") {
  if (mapLevel === "province") return normalizeProvinceName(name) || name;
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/^(comunidad|region|principado|comunidad foral) de\s+/, "")
    .replace(/^pais vasco$/, "euskadi");
  const aliases: Record<string, string> = {
    "principado de asturias": "asturias", "asturias": "asturias", "illes balears": "islas baleares",
    "comunitat valenciana": "comunidad valenciana", "valencia": "comunidad valenciana",
    "cataluna/catalunya": "cataluna", "pais vasco/euskadi": "pais vasco", "euskadi": "pais vasco",
    "ciudad autonoma de ceuta": "ceuta y melilla", "ciudad autonoma de melilla": "ceuta y melilla",
  };
  return aliases[normalized] || normalized;
}

export function SpainMapRealistic({
  provincesData,
  onProvinceSelect,
  selectedProvince,
  selectorMode = false,
  mapLevel = "province",
}: SpainMapRealisticProps) {
  const [topoData, setTopoData] = useState<TopoJSON | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [theme, setTheme] = useState<MapTheme>("night");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    return () => { isMounted = false; };
  }, []);

  const normalizedDataMap = useMemo(() => {
    const map = new Map<string, { originalKey: string; data: Province }>();
    Object.entries(provincesData).forEach(([key, val]) => {
      map.set(normalizeGeoName(key, mapLevel), { originalKey: key, data: val });
    });
    return map;
  }, [provincesData, mapLevel]);

  const processedGeometries = useMemo(() => {
    if (!topoData) return [];
    const { bbox, transform, objects, arcs } = topoData;
    const decodedArcs = decodeArcs(arcs, transform);

    const buildPath = (arcIndices: PolygonArcs | MultiPolygonArcs): string => {
      const rings: PolygonArcs = Array.isArray(arcIndices[0]?.[0])
        ? (arcIndices as MultiPolygonArcs).flat()
        : (arcIndices as PolygonArcs);

      return rings
        .map((ring) => {
          return ring
            .flatMap((arcIdx: number, pIdx: number) => {
              const arc = decodedArcs[arcIdx >= 0 ? arcIdx : ~arcIdx];
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

    const geometries = mapLevel === "ccaa" ? (objects.autonomous_regions?.geometries || []) : objects.provinces.geometries;
    return geometries.map((geom) => {
      const geoName = geom.properties.name;
      const normalized = normalizeGeoName(geoName, mapLevel);
      const match = normalizedDataMap.get(normalized) || (mapLevel === "ccaa" && ["ceuta", "melilla"].includes(normalized) ? normalizedDataMap.get("ceuta y melilla") : undefined);

      return {
        id: geom.id,
        name: match ? match.originalKey : geoName,
        data: match ? match.data : null,
            pathData: buildPath(geom.arcs as unknown as number[][]),
      };
    });
  }, [topoData, normalizedDataMap, mapLevel]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  if (loading || !topoData) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#080B11] border border-white/10 text-slate-300 backdrop-blur-xl">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
          <div className="absolute w-6 h-6 border-4 border-indigo-500/20 border-b-indigo-400 rounded-full animate-spin [animation-direction:reverse]" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Cargando Mapa Satelital...</p>
      </div>
    );
  }

  const activeProvinceData = selectedProvince ? provincesData[selectedProvince] : null;
  const hoveredObj = processedGeometries.find((g) => g.name === hoveredProvince);

  return (
    <div className={`w-full flex flex-col items-center gap-6 select-none font-sans text-slate-100${selectorMode ? ` nc-geo-selector nc-geo-${mapLevel}` : ""}`}>
      
      {/* Selector de Modos / Temas (Satelital vs Noche) */}
      <div className="flex items-center justify-between w-full max-w-5xl px-2" style={{ display: selectorMode ? "none" : undefined }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Mapa Interactivo de España</span>
        </div>

        {/* Botones de Estilo de Mapa */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setTheme("night")}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              theme === "night"
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌙 Noche
          </button>
          <button
            onClick={() => setTheme("satellite")}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              theme === "satellite"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛰️ Satélite
          </button>
          <button
            onClick={() => setTheme("cyberpunk")}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              theme === "cyberpunk"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Cyber
          </button>
        </div>
      </div>

      {/* Contenedor Principal del Mapa */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl rounded-3xl p-1.5 bg-gradient-to-b from-white/15 via-white/5 to-transparent backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto rounded-[22px] bg-[#05070B] overflow-hidden transition-all duration-500"
          style={{ aspectRatio: "16/11" }}
        >
          <defs>
            {/* Filtros Neón */}
            <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Textura Satelital Real mediante Patrón / Capa */}
            <radialGradient id="satellite-bg" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <radialGradient id="night-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#0B0F19" />
              <stop offset="100%" stopColor="#030508" />
            </radialGradient>
          </defs>

          {/* Fondo Dinámico */}
          <rect
            width={width}
            height={height}
            fill={theme === "satellite" ? "url(#satellite-bg)" : "url(#night-bg)"}
          />

          {/* Textura Visual extra en modo Satélite */}
          {theme === "satellite" && (
            <g opacity="0.15">
              <rect width={width} height={height} fill="#065F46" filter="blur(40px)" />
            </g>
          )}

          {/* Red/Grid Tecnológica en modo Cyber/Noche */}
          {theme !== "satellite" && (
            <g opacity="0.04" stroke="#38BDF8" strokeWidth="1">
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 42} x2={width} y2={i * 42} />
              ))}
              {Array.from({ length: 22 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 42} y1="0" x2={i * 42} y2={height} />
              ))}
            </g>
          )}

          {/* Capa de Provincias con Soporte de Mezcla para Satélite */}
          <g style={{ mixBlendMode: theme === "satellite" ? "screen" : "normal" }}>
            {processedGeometries.map(({ id, name, data, pathData }) => {
              const isSelected = selectedProvince === name;
              const isHovered = hoveredProvince === name;
              const partyColor = selectorMode ? "#334155" : data ? getPartyColor(data.winnerParty || "") || "#64748B" : "#334155";
              const hasVotes = !!data && Number(data.totalVotes || 0) > 0;

              // Opacidades según el modo de mapa elegido
              let opacity = selectorMode ? 0.25 : hasVotes ? 0.55 : 0.15;
              if (isHovered) opacity = 0.85;
              if (isSelected) opacity = 0.95;

              return (
                <path
                  key={id}
                  d={pathData}
                  fill={partyColor}
                  fillOpacity={opacity}
                  stroke={
                    isSelected
                      ? "#FFFFFF"
                      : isHovered
                      ? "#38BDF8"
                      : theme === "satellite"
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.12)"
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.6}
                  filter={isSelected || isHovered ? "url(#glow-effect)" : undefined}
                  className="cursor-pointer transition-all duration-150 ease-out hover:opacity-100"
                  style={{ transition: "fill-opacity 220ms ease, stroke 220ms ease, stroke-width 220ms ease, filter 220ms ease" }}
                  onMouseEnter={() => setHoveredProvince(name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={() => onProvinceSelect(isSelected ? null : name)}
                />
              );
            })}
          </g>

          {/* Leyenda Minimalista Flotante en Cristal */}
          <g transform="translate(20, 595)" style={{ display: selectorMode ? "none" : undefined }}>
            <rect
              x="0"
              y="-15"
              width="380"
              height="38"
              rx="12"
              fill="#0B0F17"
              fillOpacity="0.75"
              stroke="rgba(255, 255, 255, 0.15)"
            />
            {Object.entries(PARTIES_GENERAL).map(([partyId, party], idx) => {
              const xPos = 15 + idx * 85;
              const color = getPartyColor(partyId) || party.color || "#94A3B8";
              return (
                <g key={partyId} transform={`translate(${xPos}, 0)`}>
                  <circle cx="5" cy="4" r="5" fill={color} />
                  <text x="16" y="8" fill="#F1F5F9" fontSize="11" fontWeight="600">
                    {party.name || partyId}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 🌟 TOOLTIP EMERGENTE HTML ULTRA-MEJORADO (Liquid Glass) */}
        {!selectorMode && hoveredObj && hoveredObj.data && (
          <div
            className="pointer-events-none absolute z-50 w-64 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-75 ease-out transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y - 12}px`,
            }}
          >
            {/* Cabecera del Tooltip */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <h4 className="text-sm font-bold text-white tracking-wide">{hoveredObj.name}</h4>
              <span
                className="px-2 py-0.5 text-[10px] font-extrabold rounded-full text-white shadow-sm"
                style={{ backgroundColor: getPartyColor(hoveredObj.data.winnerParty || "") || "#64748B" }}
              >
                {hoveredObj.data.winnerParty}
              </span>
            </div>

            {/* Métricas Principales */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Votos:</span>
                <span className="font-bold text-white">{Number(hoveredObj.data.totalVotes || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Edad Media:</span>
                <span className="font-bold text-sky-400">{Number(hoveredObj.data.age || 0).toFixed(1)} años</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ideología:</span>
                <span className="font-bold text-emerald-400">{Number(hoveredObj.data.ideology || 0).toFixed(1)} / 10</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectorMode && selectedProvince && (
        <div className="w-full max-w-5xl flex items-center justify-between gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span><strong className="text-sky-300">{mapLevel === "ccaa" ? "Comunidad seleccionada" : "Provincia seleccionada"}:</strong> {selectedProvince}</span>
          <button onClick={() => onProvinceSelect(null)} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-100 transition hover:bg-white/10">Cambiar</button>
        </div>
      )}

      {/* 📊 PANEL/MODAL DE DETALLES DE LA PROVINCIA SELECCIONADA */}
      {!selectorMode && selectedProvince && activeProvinceData && (
        <div className="w-full max-w-5xl bg-slate-950/70 backdrop-blur-2xl border border-white/15 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-10 rounded-full"
                style={{ backgroundColor: getPartyColor(activeProvinceData.winnerParty || "") || "#38BDF8" }}
              />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Detalles de Provincia</span>
                <h3 className="text-2xl font-black text-white">{selectedProvince}</h3>
              </div>
            </div>
            <button
              onClick={() => onProvinceSelect(null)}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition backdrop-blur-md"
            >
              Cerrar ✕
            </button>
          </div>

          {/* Grid de Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400 mb-1">Total de Votos</p>
              <p className="text-2xl font-black text-white">{Number(activeProvinceData.totalVotes || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400 mb-1">Edad Media</p>
              <p className="text-2xl font-black text-sky-400">{Number(activeProvinceData.age || 0).toFixed(1)} <span className="text-xs text-slate-400 font-normal">años</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400 mb-1">Ideología Media</p>
              <p className="text-2xl font-black text-emerald-400">{Number(activeProvinceData.ideology || 0).toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-400 mb-1">Victoria Electoral</p>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full ring-2 ring-white/30"
                  style={{ backgroundColor: getPartyColor(activeProvinceData.winnerParty || "") || "#CBD5E1" }}
                />
                <p className="text-xl font-black text-white">{activeProvinceData.winnerParty}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
