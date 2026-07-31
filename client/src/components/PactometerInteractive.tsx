import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Share2, BookmarkPlus } from 'lucide-react';
import CoalitionSummaryCard from './CoalitionSummaryCard';

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

export default function PactometerInteractive({ 
  stats, 
  totalSeats = 350, 
  requiredForMajority = 176
}: PactometerInteractiveProps) {
  
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [showSummaryCard, setShowSummaryCard] = useState(true);

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

  const handleSaveCoalition = (name: string) => {
    // Guardar coalición en localStorage
    const savedCoalitions = JSON.parse(localStorage.getItem('savedCoalitions') || '[]');
    const newCoalition = {
      id: Date.now().toString(),
      name,
      parties: selectedParties,
      seats: selectedCoalitionSeats,
      timestamp: new Date().toISOString(),
    };
    savedCoalitions.push(newCoalition);
    localStorage.setItem('savedCoalitions', JSON.stringify(savedCoalitions));
    alert(`Coalición "${name}" guardada exitosamente`);
  };

  const handleShareCoalition = () => {
    const partyNames = stats
      .filter(p => selectedParties.includes(p.id))
      .map(p => p.nombre)
      .join(', ');
    const text = `He formado una coalición con ${partyNames} que suma ${selectedCoalitionSeats} escaños. ¡Prueba el Pactómetro Interactivo en Batalla Cultural!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Obtener partidos seleccionados con sus datos
  const selectedPartiesData = useMemo(() => {
    return stats.filter(party => selectedParties.includes(party.id));
  }, [selectedParties, stats]);

  // Filtrar solo partidos con escaños > 0 y ordenar por escaños
  const sortedStats = useMemo(() => {
    return [...stats]
      .filter(party => party.escanos > 0)
      .sort((a, b) => b.escanos - a.escanos);
  }, [stats]);

  const getPartyColor = (party: PartyStats): string => party.color || "#9CA3AF";

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative w-full max-w-full overflow-hidden">
      {/* Contenido principal a la izquierda */}
      <div className="flex-1 space-y-6">
        {/* Título */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Pactómetro Interactivo</h3>
          <p className="text-sm text-slate-600">
            Haz clic en los partidos para formar una coalición. Mayoría requerida: <span className="font-bold">{requiredForMajority} escaños</span>
          </p>
        </div>

        {/* --- MEJORA AÑADIDA: BARRA VISUAL DE MAYORÍA (HEMICICLO CONTINUO) --- */}
        <Card className="p-4 bg-slate-900 text-white shadow-xl relative overflow-hidden border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Progreso de la Coalición</span>
            <span className="text-xs font-mono font-bold text-slate-300">{selectedCoalitionSeats} / {totalSeats} Escaños</span>
          </div>
          <div className="relative w-full h-8 bg-slate-800 rounded-lg overflow-hidden flex border border-slate-700">
            {/* Marcador de línea de mayoría */}
            <div 
              className="absolute top-0 bottom-0 z-20 border-r-2 border-dashed border-yellow-400 flex flex-col justify-between items-center pointer-events-none"
              style={{ left: `${(requiredForMajority / totalSeats) * 100}%` }}
            >
              <div className="bg-yellow-400 text-slate-950 font-black text-[9px] px-1 rounded-b shadow">
                {requiredForMajority}
              </div>
            </div>
            {/* Segmentos por partido en la coalición */}
            {selectedPartiesData.map(party => (
              <div
                key={`bar-${party.id}`}
                className="h-full transition-all duration-500 relative group"
                style={{ 
                  width: `${(party.escanos / totalSeats) * 100}%`,
                  backgroundColor: getPartyColor(party)
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] py-1 px-2 rounded shadow whitespace-nowrap z-30 transition-opacity">
                  {party.nombre}: {party.escanos}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-slate-400">0 escaños</span>
            <span className={`font-semibold ${hasMajority ? 'text-green-400' : 'text-amber-400'}`}>
              {hasMajority ? '✓ Mayoría alcanzada' : `Faltan ${Math.max(0, requiredForMajority - selectedCoalitionSeats)} escaños`}
            </span>
            <span className="text-slate-400">{totalSeats} escaños</span>
          </div>
        </Card>

        {/* Información de la coalición seleccionada - Solo en vista compacta */}
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

        {/* Grid de partidos interactivos */}
        {sortedStats.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedStats.map(party => {
            const isSelected = selectedParties.includes(party.id);
            const partyColor = getPartyColor(party);

            return (
              <button
                key={party.id}
                onClick={() => toggleParty(party.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ease-out text-center cursor-pointer transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                  isSelected
                    ? 'border-slate-900 shadow-lg ring-2 ring-offset-2 ring-slate-900 animate-pulse'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  backgroundColor: isSelected ? partyColor : '#f8f9fa',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* --- MEJORA AÑADIDA: BADGE DE CHECK VISUAL CUANDO ESTÁ SELECCIONADO --- */}
                {isSelected && (
                  <span className="absolute top-1 right-1 bg-white/20 rounded-full p-0.5 backdrop-blur-xs">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className={`font-bold text-sm mb-1 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {party.nombre}
                </div>
                <div className={`text-xs font-semibold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {party.escanos} escaños
                </div>
                <div className={`text-xs transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-500'}`}>
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
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Distribución de Escaños</span>
            <span className="text-xs text-slate-500 font-normal">Haz clic en la fila para seleccionar</span>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {sortedStats.map(party => (
              <div 
                key={party.id} 
                onClick={() => toggleParty(party.id)}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  selectedParties.includes(party.id) ? 'bg-slate-100 ring-1 ring-slate-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getPartyColor(party) }}
                  />
                  <span className="font-semibold text-slate-900 min-w-32">{party.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(party.escanos / totalSeats) * 100}%`,
                        backgroundColor: getPartyColor(party),
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
            <li>• La tarjeta flotante muestra el resumen en tiempo real de tu coalición</li>
            <li>• Necesitas {requiredForMajority} escaños para tener mayoría</li>
            <li>• Los colores representan a cada partido político</li>
            <li>• Puedes guardar y compartir tus coaliciones favoritas</li>
          </ul>
        </Card>
      </div>

      {/* Tarjeta de resumen anclada a la derecha - ocupa toda la altura */}
      <div className="w-full xl:w-96 max-w-full flex-shrink-0 xl:sticky xl:top-0 xl:h-screen flex flex-col">
        <CoalitionSummaryCard
          selectedParties={selectedPartiesData}
          totalSeats={totalSeats}
          requiredForMajority={requiredForMajority}
          onSaveCoalition={handleSaveCoalition}
          onShareCoalition={handleShareCoalition}
          isVisible={showSummaryCard && selectedParties.length > 0}
          fullHeight={true}
        />
      </div>
    </div>
  );
}
