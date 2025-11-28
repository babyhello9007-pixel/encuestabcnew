import { useRef } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

interface PartyLeaders {
  [key: string]: LeaderResult[];
}

interface LeadersInfographicProps {
  leadersByParty: PartyLeaders;
  selectedParty: string | null;
}

export function LeadersInfographic({ leadersByParty, selectedParty }: LeadersInfographicProps) {
  const infographicRef = useRef<HTMLDivElement>(null);

  const selectedLeaders = selectedParty ? leadersByParty[selectedParty] : [];

  const downloadInfographic = async () => {
    if (!infographicRef.current) return;

    try {
      const canvas = await html2canvas(infographicRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `lideres-${selectedParty}-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading infographic:", err);
    }
  };

  const shareOnX = () => {
    const text = `Resultados de preferencia de líderes en ${selectedParty}: ${selectedLeaders
      .slice(0, 3)
      .map((l) => `${l.lider_preferido} (${l.porcentaje}%)`)
      .join(", ")}. Participa en La Encuesta de Batalla Cultural 🇪🇸`;

    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      window.location.href
    )}&hashtags=BatallaaCultural,Encuesta`;

    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}&quote=${encodeURIComponent(
      `Resultados de preferencia de líderes en ${selectedParty} - La Encuesta de Batalla Cultural`
    )}`;

    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Infographic Container */}
      <div
        ref={infographicRef}
        className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-8 rounded-2xl border-2 border-[#C41E3A]"
      >
        <div className="text-center space-y-6 text-white">
          {/* Header */}
          <div>
            <h3 className="text-3xl font-bold text-[#C41E3A] mb-2">La Encuesta de Batalla Cultural</h3>
            <p className="text-lg text-gray-300">¿Quién quieres que sea el líder de tu partido?</p>
          </div>

          {/* Party Title */}
          <div className="text-2xl font-bold text-[#C41E3A]">{selectedParty}</div>

          {/* Leaders Ranking */}
          <div className="space-y-4">
            {selectedLeaders.slice(0, 5).map((leader, index) => (
              <div key={`${leader.lider_preferido}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">
                      {index + 1}. {leader.lider_preferido}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-[#C41E3A]">{leader.porcentaje}%</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] h-full rounded-full"
                    style={{ width: `${leader.porcentaje}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{leader.total_votos} votos</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-600 text-sm text-gray-400">
            <p>Encuesta en tiempo real • Todos los datos son anónimos y públicos</p>
            <p className="text-xs mt-2">www.batallaacultural.es</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            onClick={downloadInfographic}
            className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white font-semibold flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Infografía
          </Button>
          <Button
            onClick={shareOnX}
            className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartir en X
          </Button>
        </div>
        <Button
          onClick={shareOnFacebook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Compartir en Facebook
        </Button>
      </div>
    </div>
  );
}

