import { useState, useRef } from "react";
import { Share2, X, Facebook, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { generateAdvancedInfographic, generateAllLogosInfographic } from "@/lib/pngExportAdvanced";

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}

interface ShareResultsAdvancedProps {
  activeTab: "general" | "youth";
  stats: PartyStats[];
  totalVotes: number;
  edadPromedio?: number | null;
}

export function ShareResultsAdvanced({ activeTab, stats, totalVotes, edadPromedio }: ShareResultsAdvancedProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyStats | null>(stats.length > 0 ? stats[0] : null);
  const infographyRef = useRef<HTMLDivElement>(null);

  const generateShareText = (party: PartyStats) => {
    const percentage = party.porcentaje.toFixed(1);
    const type = activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles";
    return `🗳️ Según la III Encuesta de Batalla Cultural, ${party.nombre} lidera con ${percentage}% de los votos en ${type}. ¡Participa en la encuesta! #BatallasCultural`;
  };

  const downloadInfography = async () => {
    if (!infographyRef.current) return;

    try {
      const canvas = await html2canvas(infographyRef.current, {
        backgroundColor: "#1A1A1A",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Crear un canvas con aspecto 16:9
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;

      // Dimensiones 16:9 en alta resolución (1920x1080)
      finalCanvas.width = 1920;
      finalCanvas.height = 1080;

      // Fondo oscuro
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Centrar y escalar la imagen
      const scale = Math.min(
        finalCanvas.width / canvas.width,
        finalCanvas.height / canvas.height
      );
      const x = (finalCanvas.width - canvas.width * scale) / 2;
      const y = (finalCanvas.height - canvas.height * scale) / 2;
      ctx.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale);

      const link = document.createElement("a");
      link.href = finalCanvas.toDataURL("image/png");
      link.download = `batalla-cultural-${selectedParty?.nombre || "resultado"}-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading infography:", error);
      alert("Error al descargar la infografía");
    }
  };

  const shareOnX = () => {
    if (!selectedParty) return;
    const text = generateShareText(selectedParty);
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
          <div className="bg-[#1A1A1A] rounded-xl p-8 max-w-2xl w-full border border-[#2D2D2D] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Compartir Resultados</h3>

            {/* Selector de resultado */}
            <div className="mb-6">
              <label className="text-sm text-[#999999] mb-3 block">Selecciona un resultado para compartir:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {stats.map((party) => (
                  <button
                    key={party.id}
                    onClick={() => setSelectedParty(party)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-semibold ${
                      selectedParty?.id === party.id
                        ? "border-[#C41E3A] bg-[#C41E3A] bg-opacity-20 text-[#C41E3A]"
                        : "border-[#2D2D2D] bg-[#0F1419] text-[#999999] hover:border-[#C41E3A]"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {party.logo && (
                        <img 
                          src={party.logo} 
                          alt={party.nombre} 
                          className="h-5 w-5 object-contain flex-shrink-0" 
                        />
                      )}
                      <span className="truncate">{party.nombre}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Infografía */}
            {selectedParty && (
              <div className="mb-6">
                <label className="text-sm text-[#999999] mb-3 block">Vista previa (16:9):</label>
                <div
                  ref={infographyRef}
                  className="bg-gradient-to-br from-[#0F1419] to-[#1A1A1A] rounded-lg p-12 border border-[#2D2D2D] aspect-video flex flex-col items-center justify-center"
                >
                  <div className="text-center space-y-6 w-full">
                    <p className="text-[#999999] text-lg font-semibold tracking-widest">ENCUESTA DE BATALLA CULTURAL</p>
                    
                    {selectedParty.logo && (
                      <div className="flex justify-center">
                        <img 
                          src={selectedParty.logo} 
                          alt={selectedParty.nombre} 
                          className="h-24 w-24 object-contain drop-shadow-lg"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                    
                    <p className="text-4xl font-bold text-white">{selectedParty.nombre}</p>
                    
                    <div className="space-y-3">
                      <p className="text-7xl font-bold text-[#C41E3A] drop-shadow-lg">
                        {selectedParty.porcentaje.toFixed(1)}%
                      </p>
                      <p className="text-[#999999] text-lg">
                        {selectedParty.votos.toLocaleString()} votos de {totalVotes.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#2D2D2D]">
                      <p className="text-[#999999] text-sm mb-3">
                        {activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles"}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
                        <span className="text-[#C41E3A] font-bold text-lg">Batalla Cultural</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-3 mb-6">
              <button
                onClick={downloadInfography}
                className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="h-5 w-5" />
                Descargar Resultado Individual
              </button>
              <button
                onClick={() => generateAdvancedInfographic(stats, activeTab, totalVotes, edadPromedio)}
                className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Image className="h-5 w-5" />
                Descargar Infografía Completa (PNG)
              </button>
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
            {selectedParty && (
              <div className="bg-[#0F1419] rounded-lg p-4 mb-6 border border-[#2D2D2D]">
                <p className="text-[#999999] text-xs mb-2">Texto para compartir:</p>
                <p className="text-white text-sm break-words mb-3">{generateShareText(selectedParty)}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareText(selectedParty));
                    alert("Texto copiado al portapapeles");
                  }}
                  className="w-full bg-[#C41E3A] hover:bg-[#A01830] text-white py-2 rounded text-sm transition"
                >
                  Copiar Texto
                </button>
              </div>
            )}

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

