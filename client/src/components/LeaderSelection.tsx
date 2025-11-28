import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PARTIES_GENERAL } from "@/lib/surveyData";
import { getLeaderOptions } from "@/lib/leadersData";

interface LeaderSelectionProps {
  onLeaderSelected: (party: string, leader: string, isCustom: boolean) => void;
  loading?: boolean;
}

export function LeaderSelection({ onLeaderSelected, loading = false }: LeaderSelectionProps) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [customParty, setCustomParty] = useState("");
  const [showCustomPartyInput, setShowCustomPartyInput] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [customLeader, setCustomLeader] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const leaderOptions = selectedParty && !showCustomPartyInput ? getLeaderOptions(selectedParty) : [];

  const handleSelectLeader = (leader: string) => {
    setSelectedLeader(leader);
    setShowCustomInput(false);
    setCustomLeader("");
  };

  const handleCustomLeader = () => {
    setShowCustomInput(true);
    setSelectedLeader(null);
  };

  const handleSubmit = () => {
    const partyName = showCustomPartyInput ? customParty.trim() : selectedParty;
    if (!partyName) {
      alert("Por favor selecciona o escribe un partido");
      return;
    }

    if (showCustomInput) {
      if (!customLeader.trim()) {
        alert("Por favor escribe el nombre del líder");
        return;
      }
      onLeaderSelected(partyName, customLeader.trim(), true);
    } else if (selectedLeader) {
      onLeaderSelected(partyName, selectedLeader, false);
    } else {
      alert("Por favor selecciona un líder");
      return;
    }
  };

  return (
    <div className="space-y-6">
      {/* Party Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Selecciona tu partido político</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {Object.entries(PARTIES_GENERAL).map(([key, party]) => {
            const isSelected = selectedParty === key && !showCustomPartyInput;
            const partyColor = party.color || '#666666';
            
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedParty(key);
                  setShowCustomPartyInput(false);
                  setCustomParty("");
                  setSelectedLeader(null);
                  setShowCustomInput(false);
                  setCustomLeader("");
                }}
                style={{
                  borderColor: isSelected ? partyColor : '#d1d5db',
                  backgroundColor: isSelected ? `${partyColor}15` : '#ffffff',
                  color: isSelected ? partyColor : '#374151',
                  borderWidth: '2px',
                  boxShadow: isSelected ? `0 4px 12px ${partyColor}40` : 'none',
                }}
                className="p-3 rounded-lg transition-all text-sm font-medium hover:shadow-md"
              >
                {party.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              setShowCustomPartyInput(!showCustomPartyInput);
              if (!showCustomPartyInput) {
                setSelectedParty(null);
                setCustomParty("");
                setSelectedLeader(null);
                setShowCustomInput(false);
                setCustomLeader("");
              }
            }}
            style={{
              borderColor: showCustomPartyInput ? '#9333ea' : '#d1d5db',
              backgroundColor: showCustomPartyInput ? '#9333ea15' : '#ffffff',
              color: showCustomPartyInput ? '#9333ea' : '#374151',
              borderWidth: '2px',
              boxShadow: showCustomPartyInput ? '0 4px 12px #9333ea40' : 'none',
            }}
            className="p-3 rounded-lg transition-all text-sm font-medium hover:shadow-md"
          >
            + Otro
          </button>
        </div>

        {/* Custom Party Input */}
        {showCustomPartyInput && (
          <div className="mt-3">
            <Input
              type="text"
              placeholder="Escribe el nombre de tu partido político"
              value={customParty}
              onChange={(e) => setCustomParty(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-20"
            />
          </div>
        )}
      </div>

      {/* Leader Selection */}
      {(selectedParty || (showCustomPartyInput && customParty.trim())) && (
        <div className="space-y-3 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900">
            ¿Quién quieres que sea el líder de {showCustomPartyInput && customParty.trim() ? customParty : (selectedParty ? PARTIES_GENERAL[selectedParty]?.name : "tu partido")}?
          </h3>

          <div className="space-y-2">
            {leaderOptions.map((leader) => {
              const isSelected = selectedLeader === leader.name;
              const partyColor = selectedParty ? PARTIES_GENERAL[selectedParty]?.color : '#666666';
              
              return (
                <button
                  key={leader.name}
                  onClick={() => handleSelectLeader(leader.name)}
                  style={{
                    borderColor: isSelected ? partyColor : '#d1d5db',
                    backgroundColor: isSelected ? `${partyColor}15` : '#ffffff',
                    color: isSelected ? partyColor : '#374151',
                    borderWidth: '2px',
                    boxShadow: isSelected ? `0 2px 8px ${partyColor}30` : 'none',
                  }}
                  className="w-full p-4 rounded-lg transition-all text-left font-medium hover:shadow-md"
                >
                  {leader.name}
                </button>
              );
            })}

            {/* Custom Leader Option */}
            <button
              onClick={handleCustomLeader}
              style={{
                borderColor: showCustomInput ? '#9333ea' : '#d1d5db',
                backgroundColor: showCustomInput ? '#9333ea15' : '#ffffff',
                color: showCustomInput ? '#9333ea' : '#374151',
                borderWidth: '2px',
                boxShadow: showCustomInput ? '0 2px 8px #9333ea30' : 'none',
              }}
              className="w-full p-4 rounded-lg transition-all text-left font-medium hover:shadow-md"
            >
              Otro (especifica nombre)
            </button>

            {/* Custom Input */}
            {showCustomInput && (
              <div className="mt-3">
                <Input
                  type="text"
                  placeholder="Escribe el nombre del líder que prefieres"
                  value={customLeader}
                  onChange={(e) => setCustomLeader(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-20"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || (!selectedParty && (!showCustomPartyInput || !customParty.trim())) || (!selectedLeader && !showCustomInput)}
            style={{
              backgroundColor: selectedParty ? PARTIES_GENERAL[selectedParty]?.color : '#9333ea',
              opacity: loading || (!selectedParty && (!showCustomPartyInput || !customParty.trim())) || (!selectedLeader && !showCustomInput) ? 0.5 : 1,
            }}
            className="w-full mt-4 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Confirmar Selección"}
          </Button>
        </div>
      )}
    </div>
  );
}
