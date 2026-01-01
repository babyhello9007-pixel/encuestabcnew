import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Copy, Check } from 'lucide-react';
import { SavedCoalition } from '@/hooks/useSavedCoalitions';

interface SavedCoalitionsPanelProps {
  coalitions: SavedCoalition[];
  onDelete: (id: string) => void;
  onLoad: (coalition: SavedCoalition) => void;
  onRename: (id: string, newName: string) => void;
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

export default function SavedCoalitionsPanel({
  coalitions,
  onDelete,
  onLoad,
  onRename,
}: SavedCoalitionsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRename = (id: string, newName: string) => {
    if (newName.trim()) {
      onRename(id, newName);
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCopy = (coalition: SavedCoalition) => {
    const text = `${coalition.name}: ${coalition.parties.join(', ')} (${coalition.totalSeats} escaños)`;
    navigator.clipboard.writeText(text);
    setCopiedId(coalition.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (coalitions.length === 0) {
    return (
      <Card className="p-6 text-center bg-slate-50">
        <p className="text-slate-600 text-sm">
          Aún no has guardado ninguna coalición. ¡Crea una y guárdala para comparar después!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Coaliciones Guardadas ({coalitions.length})</h3>
      {coalitions.map(coalition => (
        <Card key={coalition.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            {/* Nombre y fecha */}
            <div className="flex items-start justify-between">
              {editingId === coalition.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(coalition.id, editingName);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleRename(coalition.id, editingName)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{coalition.name}</h4>
                  <p className="text-xs text-slate-500">{formatDate(coalition.createdAt)}</p>
                </div>
              )}
            </div>

            {/* Información de escaños */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">{coalition.totalSeats}</span>
                <span className="text-slate-600"> escaños</span>
              </div>
              <div className="text-xs text-slate-600">
                {coalition.parties.length} partido{coalition.parties.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Partidos */}
            <div className="flex flex-wrap gap-2">
              {coalition.parties.map(party => (
                <div
                  key={party}
                  className="inline-flex items-center px-2 py-1 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: getPartyColor(party) }}
                >
                  {party}
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onLoad(coalition)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                size="sm"
              >
                Cargar
              </Button>
              <Button
                onClick={() => {
                  setEditingId(coalition.id);
                  setEditingName(coalition.name);
                }}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleCopy(coalition)}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                {copiedId === coalition.id ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => onDelete(coalition.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
