import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadersInfographicSimple } from "@/components/LeadersInfographicSimple";
import { Share2 } from "lucide-react";

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

interface PartyLeaders {
  [key: string]: LeaderResult[];
}

interface ShareLeadersModalSimpleProps {
  leadersByParty: PartyLeaders;
  selectedParty: string | null;
}

export function ShareLeadersModalSimple({ leadersByParty, selectedParty }: ShareLeadersModalSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLeaders = selectedParty ? leadersByParty[selectedParty] || [] : [];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
      >
        <Share2 className="h-4 w-4" />
        Compartir Resultados
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartir Resultados de Líderes</DialogTitle>
          </DialogHeader>
          <LeadersInfographicSimple selectedParty={selectedParty} leaders={selectedLeaders} />
        </DialogContent>
      </Dialog>
    </>
  );
}

