import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { exportLeadersToPDFV4 } from "@/lib/pdfExportLeadersV4";

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

interface LeadersInfographicSimpleProps {
  selectedParty: string | null;
  leaders: LeaderResult[];
}

export function LeadersInfographicSimple({ selectedParty, leaders }: LeadersInfographicSimpleProps) {
  const shareOnX = () => {
    const text = `Resultados de preferencia de líderes en ${selectedParty}: ${leaders
      .slice(0, 3)
      .map((l) => `${l.lider_preferido} (${l.porcentaje}%)`)
      .join(", ")}. Participa en La Encuesta de Batalla Cultural 🇪🇸`;

    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      "https://encuestabc-6q57y6uz.manus.space/"
    )}&hashtags=BatallaaCultural,Encuesta`;

    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      "https://encuestabc-6q57y6uz.manus.space/"
    )}&quote=${encodeURIComponent(
      `Resultados de preferencia de líderes en ${selectedParty} - La Encuesta de Batalla Cultural`
    )}`;

    window.open(url, "_blank");
  };

  if (!selectedParty || leaders.length === 0) {
    return (
      <div className="text-center py-8 text-[#666666]">
        No hay datos disponibles para este partido
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => exportLeadersToPDFV4(selectedParty)}
          className="flex-1 min-w-[120px] bg-[#C41E3A] hover:bg-[#A01830] text-white font-semibold flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
        <Button
          onClick={shareOnX}
          className="flex-1 min-w-[120px] bg-black hover:bg-gray-800 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          X
        </Button>
        <Button
          onClick={shareOnFacebook}
          className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Facebook
        </Button>
      </div>

      {/* Ranking List */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-[#C41E3A] mb-2">
            Ranking de Líderes - {selectedParty}
          </h3>
          <p className="text-sm text-[#666666]">Preferencia de líderes por partido</p>
        </div>

        <div className="space-y-4">
          {leaders.slice(0, 10).map((leader, index) => (
            <div key={`${leader.lider_preferido}-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#C41E3A] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-[#2D2D2D]">{leader.lider_preferido}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#C41E3A]">{leader.porcentaje}%</p>
                  <p className="text-xs text-[#999999]">{leader.total_votos} votos</p>
                </div>
              </div>
              <div className="w-full bg-[#E0D5CC] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#C41E3A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${leader.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E0D5CC] text-center text-xs text-[#999999]">
          <p>Encuesta en tiempo real • Todos los datos son anónimos y públicos</p>
          <p className="mt-2">https://encuestabc-6q57y6uz.manus.space/</p>
        </div>
      </div>
    </div>
  );
}

