import { useState } from "react";
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
        <h3 className="text-lg font-semibold text-[#2D2D2D]">Selecciona tu partido político</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {Object.entries(PARTIES_GENERAL).map(([key, party]) => (
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
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedParty === key && !showCustomPartyInput
                  ? "border-[#C41E3A] bg-[#C41E3A] bg-opacity-10 text-[#C41E3A]"
                  : "border-[#E0D5CC] bg-white text-[#2D2D2D] hover:border-[#C41E3A]"
              }`}
            >
              {party.name}
            </button>
          ))}
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
            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
              showCustomPartyInput
                ? "border-[#C41E3A] bg-[#C41E3A] bg-opacity-10 text-[#C41E3A]"
                : "border-[#E0D5CC] bg-white text-[#2D2D2D] hover:border-[#C41E3A]"
            }`}
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
              className="w-full p-3 border-2 border-[#E0D5CC] rounded-lg focus:border-[#C41E3A] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Leader Selection */}
      {(selectedParty || (showCustomPartyInput && customParty.trim())) && (
        <div className="space-y-3 p-6 bg-gradient-to-br from-[#F5F1E8] to-[#EEEEEE] rounded-xl">
          <h3 className="text-lg font-semibold text-[#2D2D2D]">
            ¿Quién quieres que sea el líder de {showCustomPartyInput && customParty.trim() ? customParty : (selectedParty ? PARTIES_GENERAL[selectedParty]?.name : "tu partido")}?
          </h3>

          <div className="space-y-2">
            {leaderOptions.map((leader) => (
              <button
                key={leader.name}
                onClick={() => handleSelectLeader(leader.name)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                  selectedLeader === leader.name
                    ? "border-[#C41E3A] bg-[#C41E3A] bg-opacity-10 text-[#C41E3A]"
                    : "border-[#E0D5CC] bg-white text-[#2D2D2D] hover:border-[#C41E3A]"
                }`}
              >
                {leader.name}
              </button>
            ))}

            {/* Custom Leader Option */}
            <button
              onClick={handleCustomLeader}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                showCustomInput
                  ? "border-[#C41E3A] bg-[#C41E3A] bg-opacity-10 text-[#C41E3A]"
                  : "border-[#E0D5CC] bg-white text-[#2D2D2D] hover:border-[#C41E3A]"
              }`}
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
                  className="w-full p-3 border-2 border-[#E0D5CC] rounded-lg focus:border-[#C41E3A] focus:outline-none"
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
            className="w-full mt-4 bg-[#C41E3A] hover:bg-[#A01830] text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Confirmar Selección"}
          </Button>
        </div>
      )}
    </div>
  );
}

