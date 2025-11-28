import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadersInfographic } from "@/components/LeadersInfographic";
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

interface ShareLeadersModalProps {
  leadersByParty: PartyLeaders;
  selectedParty: string | null;
}

export function ShareLeadersModal({ leadersByParty, selectedParty }: ShareLeadersModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white text-sm flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartir Resultados de Líderes</DialogTitle>
          </DialogHeader>
          <LeadersInfographic leadersByParty={leadersByParty} selectedParty={selectedParty} />
        </DialogContent>
      </Dialog>
    </>
  );
}

