import { useState } from "react";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { getPartyColor } from "@/lib/partyConfig";

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

// Coordenadas aproximadas del centroide de cada provincia para el mapa
const provinceCoordinates: { [key: string]: { x: number; y: number } } = {
  "Álava": { x: 520, y: 200 },
  "Albacete": { x: 650, y: 380 },
  "Alicante": { x: 720, y: 420 },
  "Almería": { x: 750, y: 480 },
  "Ávila": { x: 580, y: 300 },
  "Badajoz": { x: 420, y: 380 },
  "Baleares": { x: 800, y: 380 },
  "Barcelona": { x: 780, y: 150 },
  "Burgos": { x: 580, y: 200 },
  "Cáceres": { x: 450, y: 340 },
  "Cádiz": { x: 350, y: 520 },
  "Castellón": { x: 750, y: 300 },
  "Ciudad Real": { x: 580, y: 380 },
  "Córdoba": { x: 500, y: 420 },
  "Cuenca": { x: 650, y: 320 },
  "Girona": { x: 800, y: 120 },
  "Granada": { x: 650, y: 480 },
  "Guadalajara": { x: 620, y: 300 },
  "Guipúzcoa": { x: 500, y: 160 },
  "Huelva": { x: 380, y: 480 },
  "Huesca": { x: 650, y: 150 },
  "Jaén": { x: 600, y: 440 },
  "La Coruña": { x: 300, y: 100 },
  "La Rioja": { x: 600, y: 180 },
  "Las Palmas": { x: 200, y: 550 },
  "León": { x: 480, y: 180 },
  "Lleida": { x: 700, y: 140 },
  "Lugo": { x: 320, y: 80 },
  "Madrid": { x: 620, y: 320 },
  "Málaga": { x: 550, y: 500 },
  "Murcia": { x: 700, y: 420 },
  "Navarra": { x: 580, y: 160 },
  "Ourense": { x: 350, y: 120 },
  "Palencia": { x: 540, y: 220 },
  "Palma de Mallorca": { x: 780, y: 380 },
  "Pontevedra": { x: 320, y: 140 },
  "Salamanca": { x: 500, y: 280 },
  "Santa Cruz de Tenerife": { x: 180, y: 600 },
  "Segovia": { x: 600, y: 280 },
  "Sevilla": { x: 450, y: 460 },
  "Soria": { x: 620, y: 220 },
  "Tarragona": { x: 760, y: 180 },
  "Teruel": { x: 680, y: 240 },
  "Toledo": { x: 600, y: 360 },
  "Valencia": { x: 720, y: 360 },
  "Valladolid": { x: 540, y: 240 },
  "Vizcaya": { x: 500, y: 180 },
  "Zamora": { x: 480, y: 240 },
  "Zaragoza": { x: 680, y: 200 },
  "Ceuta": { x: 380, y: 520 },
  "Melilla": { x: 800, y: 520 },
};

export function SpainMapRealistic({ provincesData, onProvinceSelect, selectedProvince }: SpainMapRealisticProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <svg
        viewBox="0 0 900 650"
        className="w-full max-w-4xl border border-[#D5D5D7] rounded-2xl bg-[#F5F5F7]"
        style={{ aspectRatio: "16/11" }}
      >
        {/* Fondo del mapa */}
        <rect width="900" height="650" fill="#F5F5F7" />

        {/* Provincias como círculos (representación simplificada) */}
        {Object.entries(provincesData).map(([province, data]) => {
          const coords = provinceCoordinates[province];
          if (!coords) return null;

          const winnerColor = getPartyColor(data.winnerParty) || "#CCCCCC";
          const isSelected = selectedProvince === province;
          const isHovered = hoveredProvince === province;

          return (
            <g key={province}>
              {/* Círculo de provincia */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isHovered || isSelected ? 28 : 22}
                fill={winnerColor}
                opacity={data.totalVotes > 0 ? 1 : 0.3}
                stroke={isSelected ? "#1D1D1F" : isHovered ? "#C41E3A" : "white"}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredProvince(province)}
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() => onProvinceSelect(province)}
              />

              {/* Etiqueta de provincia */}
              {(isHovered || isSelected) && (
                <text
                  x={coords.x}
                  y={coords.y + 40}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-[#1D1D1F] pointer-events-none"
                >
                  {province.substring(0, 3).toUpperCase()}
                </text>
              )}

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={coords.x - 60}
                    y={coords.y - 70}
                    width="120"
                    height="60"
                    rx="8"
                    fill="white"
                    stroke="#D5D5D7"
                    strokeWidth="1"
                  />
                  <text
                    x={coords.x}
                    y={coords.y - 50}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-[#1D1D1F]"
                  >
                    {province}
                  </text>
                  <text
                    x={coords.x}
                    y={coords.y - 35}
                    textAnchor="middle"
                    className="text-xs fill-[#555555]"
                  >
                    {data.totalVotes} votos
                  </text>
                  <text
                    x={coords.x}
                    y={coords.y - 20}
                    textAnchor="middle"
                    className="text-xs fill-[#555555]"
                  >
                    Edad: {data.age.toFixed(1)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Leyenda */}
        <g transform="translate(20, 580)">
          <text x="0" y="0" className="text-sm font-semibold fill-[#1D1D1F]">
            Leyenda:
          </text>
          <circle cx="80" cy="-8" r="6" fill="#0066CC" />
          <text x="92" y="0" className="text-xs fill-[#555555]">
            PP
          </text>
          <circle cx="130" cy="-8" r="6" fill="#E81828" />
          <text x="142" y="0" className="text-xs fill-[#555555]">
            PSOE
          </text>
          <circle cx="190" cy="-8" r="6" fill="#24AA3D" />
          <text x="202" y="0" className="text-xs fill-[#555555]">
            VOX
          </text>
          <circle cx="250" cy="-8" r="6" fill="#CCCCCC" opacity="0.3" />
          <text x="262" y="0" className="text-xs fill-[#555555]">
            Sin datos
          </text>
        </g>
      </svg>

      {/* Información de provincia seleccionada */}
      {selectedProvince && provincesData[selectedProvince] && (
        <div className="w-full max-w-4xl frosted-glass p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-semibold text-[#1D1D1F]">{selectedProvince}</h3>
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
