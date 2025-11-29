import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface VerifySeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provincia: string;
  votosProvincia: Record<string, number>;
  escanosProvincia: Record<string, number>;
  escanosPorPartido: Record<string, number>;
}

/**
 * Modal para verificar si los escaños calculados son correctos
 */
export const VerifySeatsModal: React.FC<VerifySeatsModalProps> = ({
  isOpen,
  onClose,
  provincia,
  votosProvincia,
  escanosProvincia,
  escanosPorPartido,
}) => {
  const totalVotos = Object.values(votosProvincia).reduce((a, b) => a + b, 0);
  const totalEscanos = Object.values(escanosProvincia).reduce((a, b) => a + b, 0);
  const escanosTotales = Object.values(escanosPorPartido).reduce((a, b) => a + b, 0);

  // Verificar si todos los escaños coinciden
  const todosCorrectos = Object.entries(escanosProvincia).every(
    ([partido, escanos]) => escanos === (escanosPorPartido[partido] || 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verificación de Escaños - {provincia}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Votos</p>
                <p className="text-2xl font-bold text-gray-800">{totalVotos}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Escaños Provincia</p>
                <p className="text-2xl font-bold text-gray-800">{totalEscanos}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Estado</p>
                <p className={`text-2xl font-bold ${todosCorrectos ? 'text-green-600' : 'text-red-600'}`}>
                  {todosCorrectos ? '✓ Correcto' : '✗ Error'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de comparación */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Partido</th>
                  <th className="px-4 py-2 text-right">Votos</th>
                  <th className="px-4 py-2 text-right">%</th>
                  <th className="px-4 py-2 text-right">Escaños Calculados</th>
                  <th className="px-4 py-2 text-right">Escaños Esperados</th>
                  <th className="px-4 py-2 text-center">Verificación</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(votosProvincia)
                  .sort((a, b) => b[1] - a[1])
                  .map(([partido, votos]) => {
                    const escanosCal = escanosPorPartido[partido] || 0;
                    const escanosEsp = escanosProvincia[partido] || 0;
                    const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(2) : '0.00';
                    const esCorrecta = escanosCal === escanosEsp;
                    const partyName = PARTIES_GENERAL[partido as keyof typeof PARTIES_GENERAL]?.name || partido;

                    return (
                      <tr key={partido} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: getPartyColor(partido) }}
                            />
                            <span className="font-semibold">{partyName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">{votos}</td>
                        <td className="px-4 py-2 text-right">{porcentaje}%</td>
                        <td className="px-4 py-2 text-right font-bold">{escanosCal}</td>
                        <td className="px-4 py-2 text-right font-bold">{escanosEsp}</td>
                        <td className="px-4 py-2 text-center">
                          {esCorrecta ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Información de verificación */}
          <div className={`p-4 rounded-lg ${todosCorrectos ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <p className={`text-sm font-semibold ${todosCorrectos ? 'text-green-800' : 'text-red-800'}`}>
              {todosCorrectos
                ? '✓ La distribución de escaños es correcta según la Ley d\'Hondt.'
                : '✗ Hay discrepancias en la distribución de escaños. Revisa los cálculos.'}
            </p>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="default">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
