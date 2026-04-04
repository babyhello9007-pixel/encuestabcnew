import React from 'react';
import PartyLogo from '@/components/PartyLogo';

interface ProvincePopupProps {
  provinceName: string;
  votos: Record<string, number>;
  escanos?: Record<string, number>;
  edadPromedio?: number;
  ideologiaPromedio?: number;
  partyMeta?: Record<string, { color?: string }>;
}

export const ProvincePopup: React.FC<ProvincePopupProps> = ({
  provinceName,
  votos,
  escanos = {},
  edadPromedio,
  ideologiaPromedio,
  partyMeta = {},
}) => {
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  const getColorForParty = (partyId: string) => partyMeta[partyId]?.color || '#9CA3AF';

  // Ordenar partidos por votos (descendente)
  const votosOrdenados = Object.entries(votos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 partidos

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
      {/* Título */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-500">
        {provinceName}
      </h3>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600 text-xs font-semibold">TOTAL VOTOS</p>
          <p className="text-lg font-bold text-gray-900">{totalVotos}</p>
        </div>
        {edadPromedio !== undefined && (
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600 text-xs font-semibold">EDAD MEDIA</p>
            <p className="text-lg font-bold text-gray-900">{edadPromedio.toFixed(1)}</p>
          </div>
        )}
        {ideologiaPromedio !== undefined && (
          <div className="bg-gray-50 p-2 rounded col-span-2">
            <p className="text-gray-600 text-xs font-semibold">POSICIÓN IDEOLÓGICA</p>
            <p className="text-lg font-bold text-gray-900">{ideologiaPromedio.toFixed(1)}/10</p>
          </div>
        )}
      </div>

      {/* Resultados por partido */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase">RESULTADOS POR PARTIDO</p>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {votosOrdenados.map(([partido, votos]) => {
            const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0';
            const color = getColorForParty(partido);
            const escanosPartido = escanos[partido] || 0;

            return (
              <div key={partido} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                {/* Logo del partido */}
                <div className="flex-shrink-0 w-8 h-8">
                  <PartyLogo
                    partyName={partido}
                    size={32}
                  />
                </div>

                {/* Información del partido */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{partido}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${porcentaje}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-10 text-right">
                      {porcentaje}%
                    </span>
                  </div>
                </div>

                {/* Votos y Escaños */}
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                  <p className="text-xs font-bold text-gray-900">{votos} votos</p>
                  {escanosPartido > 0 && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {escanosPartido} esc.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Haz clic en el mapa para ver más detalles
        </p>
      </div>
    </div>
  );
};
