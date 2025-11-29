import { useRef } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Share2, Image } from "lucide-react";
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
  const infographicRef = useRef<HTMLDivElement>(null);

  const downloadInfographic = async () => {
    if (!infographicRef.current) return;

    try {
      const canvas = await html2canvas(infographicRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `infografia-lideres-${selectedParty}-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading infographic:", err);
    }
  };

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
          onClick={downloadInfographic}
          className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Image className="h-4 w-4" />
          PNG
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

      {/* Ranking List - Infographic Container con Liquid Glass */}
      <div
        ref={infographicRef}
        className="relative p-8 rounded-2xl border overflow-hidden space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 245, 0.95))',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(196, 30, 58, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(196, 30, 58, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C41E3A] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-3"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#C41E3A] mb-2 drop-shadow-sm">
              Ranking de Líderes - {selectedParty}
            </h3>
            <p className="text-sm text-[#666666]">Preferencia de líderes por partido</p>
          </div>

          <div className="space-y-4">
            {leaders.slice(0, 10).map((leader, index) => (
              <div key={`${leader.lider_preferido}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#A01830] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <p className="font-semibold text-[#2D2D2D]">{leader.lider_preferido}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#C41E3A]">{leader.porcentaje}%</p>
                    <p className="text-xs text-[#999999]">{leader.total_votos} votos</p>
                  </div>
                </div>
                <div className="w-full bg-[#E0D5CC] rounded-full h-2 overflow-hidden shadow-sm">
                  <div
                    className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] h-full rounded-full transition-all duration-500"
                    style={{ width: `${leader.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4" style={{
            borderTop: '1px solid rgba(196, 30, 58, 0.15)',
          }}>
            <div className="text-center text-xs text-[#666666]">
              <p className="font-semibold mb-1">Encuesta de Batalla Cultural</p>
              <p>Encuesta en tiempo real • Todos los datos son anónimos y públicos</p>
              <p className="mt-2 text-[#C41E3A] font-semibold">https://encuestabc-6q57y6uz.manus.space/</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
