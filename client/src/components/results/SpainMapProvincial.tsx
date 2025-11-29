import React, { useState } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';
import { getEscanosPorProvincia, calcularEscanosProvincia } from '@/lib/dhondtByProvince';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapProvincialProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
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

  // Función para calcular escaños por provincia usando Ley d'Hondt correcta
  const calcularEscanosPorProvinciaCorrecta = (provincia: string, votos: Record<string, number>): Record<string, number> => {
    return calcularEscanosProvincia(provincia, votos);
  };

  const handleProvinceClick = (province: string) => {
    const data = getProvinceData(province);
    const votos = votosPorProvincia[province] || {};
    const escanos = calcularEscanosPorProvinciaCorrecta(province, votos);
    setSelectedProvince(province);
    onProvinceClick?.(province, data, votos, escanos);
  };

  // Obtener todas las provincias del sistema electoral
  const todasLasProvincias = Object.keys(getEscanosPorProvincia());
  
  // Crear lista de todas las provincias con sus datos (incluyendo las sin datos)
  const provinciasConDatos = todasLasProvincias.map((province) => ({
    province,
    data: getProvinceData(province),
    tieneData: Object.keys(votosPorProvincia).includes(province),
  }));

  return (
    <div className="w-full space-y-4">
      {/* Llamada a la accion */}
      <div className="p-4 bg-gradient-to-r from-red-900 to-red-800 rounded-lg border border-red-600">
        <p className="text-white text-sm mb-2">
          <strong>Tu provincia no aparece?</strong> Ayudanos respondiendo la encuesta.
        </p>
        <a
          href="https://encuestabc-6q57y6uz.manus.space/nano-encuesta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-white text-red-900 font-semibold rounded hover:bg-gray-100 transition-colors text-sm"
        >
          Responder Encuesta
        </a>
      </div>

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
        {/* Leyenda para provincias sin datos */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-600">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4B5563' }} />
          <span className="text-xs text-gray-300">Sin datos</span>
        </div>
      </div>

      {/* Mapa de provincias en forma de grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 bg-gray-900 rounded-lg">
        {provinciasConDatos.map(({ province, data, tieneData }) => (
          <button
            key={province}
            onClick={() => tieneData && handleProvinceClick(province)}
            className={`p-3 rounded-lg text-center text-xs font-semibold transition-all transform ${
              tieneData ? 'hover:scale-110 cursor-pointer' : 'cursor-help opacity-40'
            } ${
              selectedProvince === province ? 'ring-2 ring-white' : ''
            }`}
            style={{
              backgroundColor: tieneData ? getPartyColor(data.ganador) : '#4B5563',
              opacity: selectedProvince === province ? 1 : (tieneData ? 0.8 : 0.4),
            }}
            title={tieneData ? `${province}: ${data.ganador} (${data.porcentajeGanador.toFixed(1)}%)` : `${province}: Sin datos - Responde la encuesta`}
          >
            <div className="text-white truncate">{province}</div>
            <div className="text-gray-200 text-xs mt-1">
              {tieneData ? (data.ganador || 'N/A') : '?'}
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
                const escanosPart = calcularEscanosPorProvinciaCorrecta(selectedProvince, votosPorProvincia[selectedProvince] || {})[partido] || 0;
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
                      <span className="text-gray-400 ml-2">({porcentaje.toFixed(1)}%) - {escanosPart} escaños</span>
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
