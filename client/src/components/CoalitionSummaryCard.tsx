import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Save, Share2 } from 'lucide-react';

interface PartyStats {
  id: string;
  nombre: string;
  escanos: number;
  porcentaje: number;
  color?: string;
}

interface CoalitionSummaryCardProps {
  selectedParties: PartyStats[];
  totalSeats?: number;
  requiredForMajority?: number;
  onSaveCoalition?: (name: string) => void;
  onShareCoalition?: () => void;
  isVisible?: boolean;
  fullHeight?: boolean;
}

// Colores de partidos
const PARTY_COLORS: Record<string, string> = {
  'PP': '#0066FF',
  'PSOE': '#E81B23',
  'VOX': '#2ECC71',
  'SUMAR': '#9B2D96',
  'PODEMOS': '#7B3FF2',
  'JUNTS': '#003F9F',
  'ERC': '#FFD700',
  'PNV': '#00B050',
  'ALIANZA': '#003D99',
  'BILDU': '#00AA44',
  'SAF': '#FF6600',
  'CC': '#FFCC00',
  'UPN': '#0066FF',
  'CIUDADANOS': '#FF9900',
  'PLIB': '#FFD700',
  'EB': '#999999',
  'BNG': '#003D99',
  'FO': '#CC0000',
  'CJ': '#0066FF',
  'FALANGE': '#FF0000',
  'IE': '#CC0000',
  'COMPROMIS': '#FF9900',
  'DO': '#FFD700',
  'AA': '#FF0000',
  'CUP': '#FFC400',
  'PACMA': '#00AA44',
  'PCTE': '#CC0000',
  'UPL': '#0066FF',
};

const getPartyColor = (partyId: string): string => {
  return PARTY_COLORS[partyId] || '#999999';
};

export default function CoalitionSummaryCard({
  selectedParties,
  totalSeats = 350,
  requiredForMajority = 176,
  onSaveCoalition,
  onShareCoalition,
  isVisible = true,
}: CoalitionSummaryCardProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [coalitionName, setCoalitionName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (selectedParties.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedParties]);

  if (!isVisible || selectedParties.length === 0) {
    return null;
  }

  const totalSeatsSelected = selectedParties.reduce((sum, party) => sum + party.escanos, 0);
  const hasMajority = totalSeatsSelected >= requiredForMajority;
  const percentageOfTotal = (totalSeatsSelected / totalSeats) * 100;

  const handleSaveCoalition = () => {
    if (coalitionName.trim() && onSaveCoalition) {
      onSaveCoalition(coalitionName);
      setCoalitionName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-300 transform ${
      isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
    }`}>
      <Card className={`flex-1 shadow-2xl border-2 flex flex-col overflow-hidden ${
        hasMajority ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
      }`}>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Encabezado */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Coalición Seleccionada</h3>
              <p className={`text-sm font-semibold ${hasMajority ? 'text-green-700' : 'text-amber-700'}`}>
                {hasMajority ? '✓ ¡MAYORÍA ALCANZADA!' : 'Sin mayoría'}
              </p>
            </div>
          </div>

          {/* Información de escaños */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-semibold">Escaños totales:</span>
              <span className={`text-2xl font-bold ${hasMajority ? 'text-green-700' : 'text-amber-700'}`}>
                {totalSeatsSelected}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              Mayoría requerida: {requiredForMajority} escaños
            </div>

            {/* Barra de progreso */}
            <div className="relative h-8 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
              {/* Línea de mayoría */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                style={{ left: `${(requiredForMajority / totalSeats) * 100}%` }}
              />
              
              {/* Barra de progreso */}
              <div
                className={`h-full transition-all duration-500 flex items-center justify-center font-bold text-white text-sm ${
                  hasMajority ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                }`}
                style={{ width: `${percentageOfTotal}%` }}
              >
                {percentageOfTotal > 15 && (
                  <span>{percentageOfTotal.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Partidos seleccionados */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Partidos en la coalición:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedParties.map(party => (
                <div
                  key={party.id}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold transition-transform hover:scale-105"
                  style={{ backgroundColor: getPartyColor(party.id) }}
                >
                  {party.nombre}
                  <span className="font-bold">{party.escanos}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button
              onClick={onShareCoalition}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Diálogo para guardar coalición */}
          {showSaveDialog && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                placeholder="Nombre de la coalición"
                value={coalitionName}
                onChange={(e) => setCoalitionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveCoalition()}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCoalition}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  size="sm"
                >
                  Guardar
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setCoalitionName('');
                  }}
                  variant="outline"
                  className="flex-1 text-sm"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
