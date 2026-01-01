import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PartyStats {
  id: string;
  nombre: string;
  escanos: number;
  porcentaje: number;
  color?: string;
}

interface PactometerInteractiveProps {
  stats: PartyStats[];
  totalSeats?: number;
  requiredForMajority?: number;
}

// Colores mejorados y vibrantes para partidos políticos
const PARTY_COLORS: Record<string, string> = {
  'PP': '#0066FF',           // Azul más vibrante
  'PSOE': '#E81B23',         // Rojo más vibrante
  'VOX': '#2ECC71',          // Verde más vibrante
  'SUMAR': '#9B2D96',        // Púrpura
  'PODEMOS': '#7B3FF2',      // Púrpura más vibrante
  'JUNTS': '#003F9F',        // Azul oscuro
  'ERC': '#FFD700',          // Oro
  'PNV': '#00B050',          // Verde oscuro
  'ALIANZA': '#003D99',      // Azul oscuro
  'BILDU': '#00AA44',        // Verde
  'SAF': '#FF6600',          // Naranja
  'CC': '#FFCC00',           // Amarillo
  'UPN': '#0066FF',          // Azul
  'CIUDADANOS': '#FF9900',   // Naranja
  'PLIB': '#FFD700',         // Oro
  'EB': '#999999',           // Gris
  'BNG': '#003D99',          // Azul oscuro
  'FO': '#CC0000',           // Rojo oscuro
  'CJ': '#0066FF',           // Azul
  'FALANGE': '#FF0000',      // Rojo puro
  'IE': '#CC0000',           // Rojo oscuro
  'COMPROMIS': '#FF9900',    // Naranja
  'DO': '#FFD700',           // Oro
  'AA': '#FF0000',           // Rojo
  'CUP': '#FFC400',          // Amarillo
  'PACMA': '#00AA44',        // Verde
  'PCTE': '#CC0000',         // Rojo
  'UPL': '#0066FF',          // Azul
};

const getPartyColor = (partyId: string): string => {
  return PARTY_COLORS[partyId] || '#999999';
};

export default function PactometerInteractive({ 
  stats, 
  totalSeats = 350, 
  requiredForMajority = 176
}: PactometerInteractiveProps) {
  
  const [selectedParties, setSelectedParties] = useState<string[]>([]);

  // Calcular escaños de la coalición seleccionada
  const selectedCoalitionSeats = useMemo(() => {
    return stats
      .filter(party => selectedParties.includes(party.id))
      .reduce((sum, party) => sum + party.escanos, 0);
  }, [selectedParties, stats]);

  const hasMajority = selectedCoalitionSeats >= requiredForMajority;

  const toggleParty = (partyId: string) => {
    setSelectedParties(prev =>
      prev.includes(partyId)
        ? prev.filter(id => id !== partyId)
        : [...prev, partyId]
    );
  };

  const clearSelection = () => {
    setSelectedParties([]);
  };

  // Filtrar solo partidos con escaños > 0 y ordenar por escaños
  const sortedStats = useMemo(() => {
    return [...stats]
      .filter(party => party.escanos > 0)
      .sort((a, b) => b.escanos - a.escanos);
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pactómetro Interactivo</h3>
        <p className="text-sm text-slate-600">
          Haz clic en los partidos para formar una coalición. Mayoría requerida: <span className="font-bold">{requiredForMajority} escaños</span>
        </p>
      </div>

      {/* Información de la coalición seleccionada */}
      {selectedParties.length > 0 && (
        <Card className={`p-4 border-2 ${hasMajority ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Coalición Seleccionada</h4>
              <p className={`text-lg font-bold ${hasMajority ? 'text-green-700' : 'text-amber-700'}`}>
                {selectedCoalitionSeats} escaños {hasMajority && '✓ ¡MAYORÍA!'}
              </p>
            </div>
            <Button
              onClick={clearSelection}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </Card>
      )}

      {/* Barra de progreso de la coalición */}
      {selectedParties.length > 0 && (
        <div className="space-y-2">
          <div className="relative h-12 bg-slate-200 rounded-lg overflow-hidden border-2 border-slate-300">
            {/* Línea de mayoría */}
            <div
              className="absolute top-0 bottom-0 border-l-4 border-red-600 z-10"
              style={{ left: `${(requiredForMajority / totalSeats) * 100}%` }}
            />
            
            {/* Barra de progreso */}
            <div
              className={`h-full transition-all duration-300 flex items-center justify-center font-bold text-white ${
                hasMajority ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(selectedCoalitionSeats / totalSeats) * 100}%` }}
            >
              {(selectedCoalitionSeats / totalSeats) * 100 > 10 && (
                <span>{selectedCoalitionSeats}</span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>0</span>
            <span className="font-semibold">Mayoría: {requiredForMajority}</span>
            <span>{totalSeats}</span>
          </div>
        </div>
      )}

      {/* Grid de partidos interactivos */}
      {sortedStats.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedStats.map(party => {
          const isSelected = selectedParties.includes(party.id);
          const partyColor = getPartyColor(party.id);

          return (
            <button
              key={party.id}
              onClick={() => toggleParty(party.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center cursor-pointer transform hover:scale-105 ${
                isSelected
                  ? 'border-slate-900 shadow-lg ring-2 ring-offset-2 ring-slate-900'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{
                backgroundColor: isSelected ? partyColor : '#f8f9fa',
              }}
            >
              <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {party.nombre}
              </div>
              <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                {party.escanos} escaños
              </div>
              <div className={`text-xs ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                {party.porcentaje.toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>
      ) : (
        <div className="text-center text-slate-600 py-8">
          <p>No hay partidos con escaños para mostrar</p>
        </div>
      )}

      {/* Tabla de partidos con colores */}
      {sortedStats.length > 0 && (
      <Card className="p-4">
        <h4 className="font-semibold text-slate-900 mb-4">Distribución de Escaños</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedStats.map(party => (
            <div key={party.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getPartyColor(party.id) }}
                />
                <span className="font-semibold text-slate-900 min-w-32">{party.nombre}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(party.escanos / totalSeats) * 100}%`,
                      backgroundColor: getPartyColor(party.id),
                    }}
                  />
                </div>
                <span className="font-bold text-slate-900 text-right w-16">
                  {party.escanos} ({party.porcentaje.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}

      {/* Información de mayoría */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-slate-900 mb-2">ℹ️ Cómo usar</h4>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• Haz clic en los partidos para seleccionarlos y formar una coalición</li>
          <li>• La barra de progreso muestra los escaños totales de tu coalición</li>
          <li>• Necesitas {requiredForMajority} escaños para tener mayoría</li>
          <li>• Los colores representan a cada partido político</li>
        </ul>
      </Card>
    </div>
  );
}
