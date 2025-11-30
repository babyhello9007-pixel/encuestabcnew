import { useState } from "react";
import { Share2, X, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareResultsProps {
  activeTab: "general" | "youth";
  topParty: string;
  topPartyVotes: number;
  totalVotes: number;
}

export function ShareResults({ activeTab, topParty, topPartyVotes, totalVotes }: ShareResultsProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const generateShareText = () => {
    const percentage = ((topPartyVotes / totalVotes) * 100).toFixed(1);
    const type = activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles";
    return `🗳️ Según la La Encuesta de Batalla Cultural, ${topParty} lidera con ${percentage}% de los votos en ${type}. ¡Participa en la encuesta! #BatallasCultural`;
  };

  const shareOnX = () => {
    const text = generateShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  return (
    <>
      <Button
        onClick={() => setShowShareModal(true)}
        className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-6 py-2 rounded-lg flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Compartir Resultados
      </Button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl p-8 max-w-md w-full border border-[#2D2D2D]">
            <h3 className="text-xl font-bold text-white mb-6">Compartir Resultados</h3>

            {/* Infografía */}
            <div className="bg-gradient-to-br from-[#0F1419] to-[#1A1A1A] rounded-lg p-6 mb-6 border border-[#2D2D2D]">
              <div className="text-center space-y-3">
                <p className="text-[#999999] text-sm">ENCUESTA DE BATALLA CULTURAL</p>
                <p className="text-2xl font-bold text-[#C41E3A]">{topParty}</p>
                <p className="text-4xl font-bold text-white">
                  {((topPartyVotes / totalVotes) * 100).toFixed(1)}%
                </p>
                <p className="text-[#999999] text-sm">
                  {activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <img src="/favicon.png" alt="BC Logo" className="h-6 w-6" />
                  <span className="text-[#C41E3A] font-semibold">Batalla Cultural</span>
                </div>
              </div>
            </div>

            {/* Botones de compartir */}
            <div className="space-y-3 mb-6">
              <button
                onClick={shareOnX}
                className="w-full bg-black hover:bg-[#1a1a1a] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <X className="h-5 w-5" />
                Compartir en X
              </button>
              <button
                onClick={shareOnFacebook}
                className="w-full bg-[#1877F2] hover:bg-[#0a66c2] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Facebook className="h-5 w-5" />
                Compartir en Facebook
              </button>
            </div>

            {/* Texto para copiar */}
            <div className="bg-[#0F1419] rounded-lg p-4 mb-6 border border-[#2D2D2D]">
              <p className="text-[#999999] text-xs mb-2">Texto para compartir:</p>
              <p className="text-white text-sm break-words">{generateShareText()}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateShareText());
                  alert("Texto copiado al portapapeles");
                }}
                className="mt-3 w-full bg-[#C41E3A] hover:bg-[#A01830] text-white py-2 rounded text-sm transition"
              >
                Copiar Texto
              </button>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-2 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

