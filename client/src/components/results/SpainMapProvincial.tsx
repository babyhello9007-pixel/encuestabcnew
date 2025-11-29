import React, { useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapProvincialProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  onProvinceClick?: (province: string, data: ProvinceData) => void;
}

/**
 * Mapa interactivo de España mostrando provincias coloreadas por partido ganador
 */
export const SpainMapProvincial: React.FC<SpainMapProvincialProps> = ({
  votosPorProvincia,
  onProvinceClick,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Calcular el partido ganador por provincia
  const getProvinceData = (province: string): ProvinceData => {
    const votos = votosPorProvincia[province] || {};
    const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
    
    let ganador = '';
    let maxVotos = 0;
    
    for (const [partido, votoCount] of Object.entries(votos)) {
      if (votoCount > maxVotos) {
        maxVotos = votoCount;
        ganador = partido;
      }
    }

    return {
      name: province,
      votos,
      ganador,
      porcentajeGanador: totalVotos > 0 ? (maxVotos / totalVotos) * 100 : 0,
    };
  };

  const handleProvinceClick = (province: string) => {
    const data = getProvinceData(province);
    setSelectedProvince(province);
    onProvinceClick?.(province, data);
  };

  // Crear lista de provincias con sus datos
  const provinciasConDatos = Object.keys(votosPorProvincia).map((province) => ({
    province,
    data: getProvinceData(province),
  }));

  return (
    <div className="w-full space-y-4">
      {/* Leyenda de partidos */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-900 rounded-lg">
        {Object.entries(PARTIES_GENERAL).map(([key, party]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getPartyColor(key) }}
            />
            <span className="text-xs text-gray-300">{party.name}</span>
          </div>
        ))}
      </div>

      {/* Mapa de provincias en forma de grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 bg-gray-900 rounded-lg">
        {provinciasConDatos.map(({ province, data }) => (
          <button
            key={province}
            onClick={() => handleProvinceClick(province)}
            className={`p-3 rounded-lg text-center text-xs font-semibold transition-all transform hover:scale-110 cursor-pointer ${
              selectedProvince === province ? 'ring-2 ring-white' : ''
            }`}
            style={{
              backgroundColor: getPartyColor(data.ganador),
              opacity: selectedProvince === province ? 1 : 0.8,
            }}
            title={`${province}: ${data.ganador} (${data.porcentajeGanador.toFixed(1)}%)`}
          >
            <div className="text-white truncate">{province}</div>
            <div className="text-gray-200 text-xs mt-1">
              {data.ganador || 'N/A'}
            </div>
          </button>
        ))}
      </div>

      {/* Información de la provincia seleccionada */}
      {selectedProvince && (
        <div className="p-4 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-3">{selectedProvince}</h3>
          <div className="space-y-2">
            {Object.entries(
              votosPorProvincia[selectedProvince] || {}
            )
              .sort(([, a], [, b]) => b - a)
              .map(([partido, votos]) => {
                const total = Object.values(
                  votosPorProvincia[selectedProvince] || {}
                ).reduce((a, b) => a + b, 0);
                const porcentaje = total > 0 ? (votos / total) * 100 : 0;
                const partyName = PARTIES_GENERAL[partido as keyof typeof PARTIES_GENERAL]?.name || partido;

                return (
                  <div key={partido} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getPartyColor(partido) }}
                      />
                      <span className="text-gray-300">{partyName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{votos}</span>
                      <span className="text-gray-400 ml-2">({porcentaje.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
