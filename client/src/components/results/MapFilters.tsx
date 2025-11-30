import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  allParties: string[];
}

export interface FilterState {
  ageRange: [number, number];
  ideologyRange: [number, number];
  selectedParties: string[];
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  onFilterChange,
  allParties,
}) => {
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [ideologyRange, setIdeologyRange] = useState<[number, number]>([1, 10]);
  const [selectedParties, setSelectedParties] = useState<string[]>(allParties);
  const [expandedSection, setExpandedSection] = useState<string | null>('age');

  const handleAgeChange = (type: 'min' | 'max', value: number) => {
    const newRange: [number, number] = type === 'min' 
      ? [value, ageRange[1]] 
      : [ageRange[0], value];
    setAgeRange(newRange);
    onFilterChange({
      ageRange: newRange,
      ideologyRange,
      selectedParties,
    });
  };

  const handleIdeologyChange = (type: 'min' | 'max', value: number) => {
    const newRange: [number, number] = type === 'min'
      ? [value, ideologyRange[1]]
      : [ideologyRange[0], value];
    setIdeologyRange(newRange);
    onFilterChange({
      ageRange,
      ideologyRange: newRange,
      selectedParties,
    });
  };

  const handlePartyToggle = (party: string) => {
    const newParties = selectedParties.includes(party)
      ? selectedParties.filter(p => p !== party)
      : [...selectedParties, party];
    setSelectedParties(newParties);
    onFilterChange({
      ageRange,
      ideologyRange,
      selectedParties: newParties,
    });
  };

  const handleSelectAll = () => {
    setSelectedParties(allParties);
    onFilterChange({
      ageRange,
      ideologyRange,
      selectedParties: allParties,
    });
  };

  const handleDeselectAll = () => {
    setSelectedParties([]);
    onFilterChange({
      ageRange,
      ideologyRange,
      selectedParties: [],
    });
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">Filtros Dinámicos</h3>
        <p className="text-xs text-gray-600 mt-1">Segmenta los resultados por edad, ideología y partido</p>
      </div>

      {/* Filtros */}
      <div className="divide-y divide-gray-200">
        {/* Rango de Edad */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'age' ? null : 'age')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="text-sm font-semibold text-gray-900">Rango de Edad</span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${
                expandedSection === 'age' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'age' && (
            <div className="px-4 py-4 bg-gray-50 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Mínimo: {ageRange[0]} años
                </label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={ageRange[0]}
                  onChange={(e) => handleAgeChange('min', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Máximo: {ageRange[1]} años
                </label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={ageRange[1]}
                  onChange={(e) => handleAgeChange('max', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                Mostrando resultados de {ageRange[0]} a {ageRange[1]} años
              </p>
            </div>
          )}
        </div>

        {/* Posición Ideológica */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'ideology' ? null : 'ideology')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="text-sm font-semibold text-gray-900">Posición Ideológica</span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${
                expandedSection === 'ideology' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'ideology' && (
            <div className="px-4 py-4 bg-gray-50 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Mínimo: {ideologyRange[0]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ideologyRange[0]}
                  onChange={(e) => handleIdeologyChange('min', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Máximo: {ideologyRange[1]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ideologyRange[1]}
                  onChange={(e) => handleIdeologyChange('max', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                <p className="font-semibold mb-1">Escala:</p>
                <p>1 = Izquierda | 5 = Centro | 10 = Derecha</p>
                <p className="mt-1">Mostrando: {ideologyRange[0]} a {ideologyRange[1]}</p>
              </div>
            </div>
          )}
        </div>

        {/* Partidos Políticos */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'parties' ? null : 'parties')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="text-sm font-semibold text-gray-900">
              Partidos ({selectedParties.length}/{allParties.length})
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${
                expandedSection === 'parties' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'parties' && (
            <div className="px-4 py-4 bg-gray-50 space-y-3">
              {/* Botones de selección rápida */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Todos
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
                >
                  Ninguno
                </button>
              </div>

              {/* Lista de partidos */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {allParties.map((party) => (
                  <label
                    key={party}
                    className="flex items-center gap-2 p-2 rounded hover:bg-white transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParties.includes(party)}
                      onChange={() => handlePartyToggle(party)}
                      className="w-4 h-4 rounded border-gray-300 text-red-500 cursor-pointer accent-red-500"
                    />
                    <span className="text-sm text-gray-900 flex-1">{party}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con info de filtros activos */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Filtros activos:</span> Edad {ageRange[0]}-{ageRange[1]} años,
          Ideología {ideologyRange[0]}-{ideologyRange[1]}, {selectedParties.length} partido(s)
        </p>
      </div>
    </div>
  );
};
