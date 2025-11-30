import { useState, useEffect } from "react";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { getPartyColor } from "@/lib/partyConfig";
import { normalizeProvinceName } from "@/lib/provinceNameNormalizer";
import { getProvinceGeoJsonId } from "@/lib/provinceGeoJsonMapper";

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
  onProvinceSelect: (province: string) => void;
  selectedProvince: string | null;
}

interface TopoJSON {
  type: string;
  bbox: number[];
  transform: {
    scale: number[];
    translate: number[];
  };
  objects: {
    provinces: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][][];
        id: string;
        properties: {
          name: string;
        };
      }>;
    };
  };
}

// Función para decodificar arcos de TopoJSON
function decodeArcs(arcs: number[][], transform: any): number[][][] {
  const scale = transform.scale;
  const translate = transform.translate;
  const decodedArcs: number[][][] = [];

  arcs.forEach((arc) => {
    const points: number[][] = [];
    let x = 0,
      y = 0;

    arc.forEach((point) => {
      x += point[0];
      y += point[1];
      points.push([
        x * scale[0] + translate[0],
        y * scale[1] + translate[1],
      ]);
    });

    decodedArcs.push(points);
  });

  return decodedArcs;
}

// Función para convertir coordenadas geográficas a coordenadas SVG
function geoToSvg(
  lon: number,
  lat: number,
  bbox: number[],
  width: number,
  height: number
): [number, number] {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar el archivo TopoJSON
    fetch("/data/provinces.json")
      .then((res) => res.json())
      .then((data) => {
        setTopoData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando TopoJSON:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !topoData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-[#555555]">Cargando mapa...</p>
      </div>
    );
  }

  const bbox = topoData.bbox;
  const width = 900;
  const height = 650;

  // Decodificar todos los arcos
  const allArcs = topoData.objects.provinces.geometries.flatMap(
    (geom) => geom.arcs
  );
  const decodedArcs = decodeArcs(allArcs, topoData.transform);

  // Crear un mapa de arcos decodificados por índice
  const arcMap: { [key: number]: number[][] } = {};
  let arcIndex = 0;
  topoData.objects.provinces.geometries.forEach((geom) => {
    geom.arcs.forEach((arcIndices) => {
      arcIndices.forEach((arcIdx) => {
        if (!arcMap[arcIdx]) {
          arcMap[arcIdx] = decodedArcs[arcIndex];
          arcIndex++;
        }
      });
    });
  });

  // Función para construir el path SVG a partir de los arcos
  function buildPath(arcIndices: number[][]): string {
    let pathData = "";

    arcIndices.forEach((ring, ringIndex) => {
      if (ringIndex > 0) {
        // Nuevo anillo (para MultiPolygon)
        pathData += " ";
      }

      ring.forEach((arcIdx, pointIndex) => {
        const arc = arcMap[Math.abs(arcIdx)];
        if (!arc) return;

        const points = arcIdx < 0 ? [...arc].reverse() : arc;

        points.forEach((point, idx) => {
          const [svgX, svgY] = geoToSvg(point[0], point[1], bbox, width, height);

          if (pointIndex === 0 && idx === 0) {
            pathData += `M${svgX},${svgY}`;
          } else {
            pathData += `L${svgX},${svgY}`;
          }
        });
      });

      pathData += "Z";
    });

    return pathData;
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-4xl border border-[#D5D5D7] rounded-2xl bg-[#F5F5F7]"
        style={{ aspectRatio: "16/11" }}
      >
        {/* Fondo del mapa */}
        <rect width={width} height={height} fill="#F5F5F7" />

        {/* Provincias como polígonos reales */}
        {topoData.objects.provinces.geometries.map((geometry) => {
          const provinceName = geometry.properties.name;
          
          // Normalizar nombre y buscar en los datos
          const normalizedName = normalizeProvinceName(provinceName);
          let matchingProvince: string | null = null;

          // Buscar provincia coincidente en los datos
          for (const [key] of Object.entries(provincesData)) {
            if (normalizeProvinceName(key) === normalizedName) {
              matchingProvince = key;
              break;
            }
          }

          const data = matchingProvince
            ? provincesData[matchingProvince]
            : null;
          const winnerColor = data
            ? getPartyColor(data.winnerParty) || "#CCCCCC"
            : "#CCCCCC";
          const isSelected = selectedProvince === matchingProvince;
          const isHovered = hoveredProvince === matchingProvince;

          const pathData = buildPath(geometry.arcs);

          return (
            <g key={geometry.id}>
              {/* Polígono de provincia */}
              <path
                d={pathData}
                fill={winnerColor}
                opacity={data && data.totalVotes > 0 ? 1 : 0.2}
                stroke={
                  isSelected
                    ? "#1D1D1F"
                    : isHovered
                      ? "#C41E3A"
                      : "#D5D5D7"
                }
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                className="cursor-pointer transition-all hover:opacity-90"
                onMouseEnter={() =>
                  matchingProvince && setHoveredProvince(matchingProvince)
                }
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() =>
                  matchingProvince && onProvinceSelect(matchingProvince)
                }
              />

              {/* Tooltip */}
              {isHovered && data && (
                <g>
                  <rect
                    x="10"
                    y="10"
                    width="180"
                    height="80"
                    rx="8"
                    fill="white"
                    stroke="#D5D5D7"
                    strokeWidth="1"
                  />
                  <text
                    x="100"
                    y="30"
                    textAnchor="middle"
                    className="text-sm font-semibold fill-[#1D1D1F]"
                  >
                    {matchingProvince}
                  </text>
                  <text
                    x="100"
                    y="50"
                    textAnchor="middle"
                    className="text-xs fill-[#555555]"
                  >
                    {data.totalVotes} votos
                  </text>
                  <text
                    x="100"
                    y="65"
                    textAnchor="middle"
                    className="text-xs fill-[#555555]"
                  >
                    Edad: {data.age.toFixed(1)}
                  </text>
                  <text
                    x="100"
                    y="80"
                    textAnchor="middle"
                    className="text-xs fill-[#555555]"
                  >
                    {data.winnerParty}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Leyenda */}
        <g transform="translate(20, 600)">
          <text x="0" y="0" className="text-xs font-semibold fill-[#1D1D1F]">
            Leyenda:
          </text>
          <rect x="70" y="-10" width="10" height="10" fill="#0066CC" />
          <text x="85" y="0" className="text-xs fill-[#555555]">
            PP
          </text>
          <rect x="120" y="-10" width="10" height="10" fill="#E81828" />
          <text x="135" y="0" className="text-xs fill-[#555555]">
            PSOE
          </text>
          <rect x="180" y="-10" width="10" height="10" fill="#24AA3D" />
          <text x="195" y="0" className="text-xs fill-[#555555]">
            VOX
          </text>
          <rect x="240" y="-10" width="10" height="10" fill="#CCCCCC" opacity="0.2" />
          <text x="255" y="0" className="text-xs fill-[#555555]">
            Sin datos
          </text>
        </g>
      </svg>

      {/* Información de provincia seleccionada */}
      {selectedProvince && provincesData[selectedProvince] && (
        <div className="w-full max-w-4xl frosted-glass p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-semibold text-[#1D1D1F]">
            {selectedProvince}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[#555555] mb-1">Total Votos</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">
                {provincesData[selectedProvince].totalVotes}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#555555] mb-1">Edad Media</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">
                {provincesData[selectedProvince].age.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#555555] mb-1">Ideología Media</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">
                {provincesData[selectedProvince].ideology.toFixed(1)}/10
              </p>
            </div>
            <div>
              <p className="text-xs text-[#555555] mb-1">Partido Ganador</p>
              <p className="text-lg font-bold text-[#C41E3A]">
                {provincesData[selectedProvince].winnerParty}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
