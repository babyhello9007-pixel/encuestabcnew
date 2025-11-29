import { useState, useRef } from "react";
import { Share2, X, Facebook, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { generateAdvancedInfographic } from "@/lib/pngExportAdvanced";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";

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

  // Obtener logos directamente de los datos - Misma lógica robusta que Results.tsx
  const getLogoForParty = (partyId: string, partyName?: string) => {
    // Primero intentar búsqueda por ID
    if (activeTab === "general") {
      const party = PARTIES_GENERAL[partyId as keyof typeof PARTIES_GENERAL];
      if (party?.logo) return party.logo;
    } else {
      const party = YOUTH_ASSOCIATIONS[partyId as keyof typeof YOUTH_ASSOCIATIONS];
      if (party?.logo) return party.logo;
    }
    
    // Si no hay logo por ID, buscar por nombre en PARTIES_GENERAL
    if (partyName) {
      for (const [key, partyData] of Object.entries(PARTIES_GENERAL)) {
        if (partyData.name === partyName) {
          return partyData.logo;
        }
      }
    }
    
    // Si no hay logo aún, buscar por nombre en YOUTH_ASSOCIATIONS
    if (partyName) {
      for (const [key, assocData] of Object.entries(YOUTH_ASSOCIATIONS)) {
        if (assocData.name === partyName) {
          return assocData.logo;
        }
      }
    }
    
    return '';
  };

  const generateShareText = (party: PartyStats) => {
    const percentage = party.porcentaje.toFixed(1);
    const type = activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles";
    return `🗳️ Según la Encuesta de Batalla Cultural, ${party.nombre} lidera con ${percentage}% de los votos en ${type}. ¡Participa y haz oír tu voz! #BatallaaCultural`;
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
        className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Share2 className="h-4 w-4" />
        Compartir Resultados
      </Button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl p-8 max-w-2xl w-full border border-[#2D2D2D] max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Compartir Resultados</h3>
            <p className="text-sm text-[#999999] mb-6">Difunde los resultados en tus redes sociales</p>

            {/* Selector de resultado */}
            <div className="mb-6">
              <label className="text-sm text-[#999999] mb-3 block">Selecciona un resultado para compartir:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {stats.map((party) => {
                  const logo = getLogoForParty(party.id, party.nombre);
                  return (
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
                        {logo && (
                          <img 
                            src={logo} 
                            alt={party.nombre} 
                            className="h-5 w-5 object-contain flex-shrink-0" 
                          />
                        )}
                        <span className="truncate">{party.nombre}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Infografía con Liquid Glass */}
            {selectedParty && (
              <div className="mb-6">
                <label className="text-sm text-[#999999] mb-3 block">Vista previa (16:9):</label>
                <div
                  ref={infographyRef}
                  className="relative rounded-2xl p-12 border aspect-video flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(15, 20, 30, 0.9))',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px 0 rgba(196, 30, 58, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Fondo con gradiente decorativo */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C41E3A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
                  </div>

                  {/* Contenido */}
                  <div className="text-center space-y-6 w-full relative z-10">
                    <p className="text-[#CCCCCC] text-lg font-semibold tracking-widest opacity-90">ENCUESTA DE BATALLA CULTURAL</p>
                    
                    {getLogoForParty(selectedParty.id, selectedParty.nombre) && (
                      <div className="flex justify-center">
                        <div
                          className="relative"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px 0 rgba(196, 30, 58, 0.2)',
                          }}
                        >
                          <img 
                            src={getLogoForParty(selectedParty.id, selectedParty.nombre)} 
                            alt={selectedParty.nombre} 
                            className="h-24 w-24 object-contain drop-shadow-lg"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                    )}
                    
                    <p className="text-4xl font-bold text-white drop-shadow-lg">{selectedParty.nombre}</p>
                    
                    <div className="space-y-3">
                      <p className="text-7xl font-bold text-[#C41E3A] drop-shadow-lg" style={{
                        textShadow: '0 0 20px rgba(196, 30, 58, 0.4)',
                      }}>
                        {selectedParty.porcentaje.toFixed(1)}%
                      </p>
                      <p className="text-[#CCCCCC] text-lg opacity-90">
                        {selectedParty.votos.toLocaleString()} votos de {totalVotes.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-6" style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                    }}>
                      <p className="text-[#CCCCCC] text-sm mb-3 opacity-80">
                        {activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles"}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <img src="/favicon.png" alt="BC Logo" className="h-8 w-8 drop-shadow-lg" />
                        <span className="text-[#C41E3A] font-bold text-lg drop-shadow-lg">Batalla Cultural</span>
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
                className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <Download className="h-5 w-5" />
                Descargar Resultado Individual
              </button>
              <button
                onClick={() => generateAdvancedInfographic(stats, activeTab, totalVotes, edadPromedio)}
                className="w-full bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <Image className="h-5 w-5" />
                Descargar Infografía Completa (PNG)
              </button>
              <button
                onClick={shareOnX}
                className="w-full bg-black hover:bg-[#1a1a1a] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <X className="h-5 w-5" />
                Compartir en X
              </button>
              <button
                onClick={shareOnFacebook}
                className="w-full bg-[#1877F2] hover:bg-[#0a66c2] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <Facebook className="h-5 w-5" />
                Compartir en Facebook
              </button>
            </div>

            {/* Texto para copiar */}
            {selectedParty && (
              <div className="rounded-lg p-4 mb-6 border" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(196, 30, 58, 0.2)',
              }}>
                <p className="text-[#999999] text-xs mb-2 font-semibold uppercase tracking-wide">Texto para compartir:</p>
                <p className="text-white text-sm break-words mb-3 leading-relaxed">{generateShareText(selectedParty)}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareText(selectedParty));
                    alert("Texto copiado al portapapeles");
                  }}
                  className="w-full bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white py-2 rounded text-sm transition-all duration-200 hover:shadow-lg font-semibold"
                >
                  Copiar Texto
                </button>
              </div>
            )}

            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-2 rounded-lg transition-all duration-200 hover:shadow-lg font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

