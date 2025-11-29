import { useState, useRef } from "react";
import { Share2, Download, Image, X } from "lucide-react";
import html2canvas from "html2canvas";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";
import ImageLoader from "./ImageLoader";

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo?: string;
}

interface ShareInfographicCompleteProps {
  activeTab: "general" | "youth";
  stats: PartyStats[];
  totalVotes: number;
  edadPromedio?: number | null;
}

export function ShareInfographicComplete({
  activeTab,
  stats,
  totalVotes,
  edadPromedio,
}: ShareInfographicCompleteProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const infographyRef = useRef<HTMLDivElement>(null);

  // Obtener logo de forma robusta - Misma lógica que Results.tsx
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

    return "";
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
      const finalCanvas = document.createElement("canvas");
      const ctx = finalCanvas.getContext("2d");
      if (!ctx) return;

      finalCanvas.width = 1920;
      finalCanvas.height = 1080;

      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      const scale = Math.min(
        finalCanvas.width / canvas.width,
        finalCanvas.height / canvas.height
      );
      const x = (finalCanvas.width - canvas.width * scale) / 2;
      const y = (finalCanvas.height - canvas.height * scale) / 2;
      ctx.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale);

      const link = document.createElement("a");
      link.href = finalCanvas.toDataURL("image/png");
      link.download = `batalla-cultural-resultados-${new Date()
        .toISOString()
        .split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading infography:", error);
      alert("Error al descargar la infografía");
    }
  };

  const shareOnX = () => {
    const text = `🗳️ Resultados de la Encuesta de Batalla Cultural: ${stats
      .slice(0, 3)
      .map((p) => `${p.nombre} ${p.porcentaje.toFixed(1)}%`)
      .join(" | ")} ¡Participa y haz oír tu voz! #BatallaaCultural`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareOnBluesky = () => {
    const text = `🗳️ Resultados de la Encuesta de Batalla Cultural: ${stats
      .slice(0, 3)
      .map((p) => `${p.nombre} ${p.porcentaje.toFixed(1)}%`)
      .join(" | ")} ¡Participa y haz oír tu voz! #BatallaaCultural`;
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(
      text + "\n\n" + window.location.href
    )}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareOnDiscord = () => {
    const text = `🗳️ Resultados de la Encuesta de Batalla Cultural:\n${stats
      .slice(0, 5)
      .map((p) => `• ${p.nombre}: ${p.porcentaje.toFixed(1)}% (${p.votos} votos)`)
      .join("\n")}\n\n¡Participa y haz oír tu voz! #BatallaaCultural\n${window.location.href}`;
    
    // Copiar al portapapeles para Discord
    navigator.clipboard.writeText(text);
    alert(
      "Texto copiado al portapapeles. Pégalo en tu servidor de Discord."
    );
  };

  const topParties = stats.slice(0, 10);

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Share2 className="h-4 w-4" />
        Compartir Resultados
      </button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl p-8 max-w-4xl w-full border border-[#2D2D2D] max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-2">
              Compartir Resultados
            </h3>
            <p className="text-sm text-[#999999] mb-6">
              Difunde los resultados en tus redes sociales
            </p>

            {/* Infografía Completa */}
            <div className="mb-6">
              <label className="text-sm text-[#999999] mb-3 block">
                Infografía Completa (16:9):
              </label>
              <div
                ref={infographyRef}
                className="relative rounded-2xl p-12 border aspect-video flex flex-col items-center justify-center overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(15, 20, 30, 0.9))",
                  backdropFilter: "blur(20px)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "0 8px 32px 0 rgba(196, 30, 58, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Fondo con gradiente decorativo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#C41E3A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
                </div>

                {/* Contenido */}
                <div className="text-center space-y-6 w-full relative z-10">
                  <p className="text-[#CCCCCC] text-lg font-semibold tracking-widest opacity-90">
                    ENCUESTA DE BATALLA CULTURAL
                  </p>

                  {/* Header con logo BC */}
                  <div className="flex items-center justify-center gap-3 pb-4 border-b border-[#2D2D2D]">
                    <img
                      src="/favicon.png"
                      alt="BC Logo"
                      className="h-10 w-10 drop-shadow-lg"
                    />
                    <span className="text-[#C41E3A] font-bold text-xl drop-shadow-lg">
                      Batalla Cultural
                    </span>
                  </div>

                  {/* Top 10 Partidos/Asociaciones */}
                  <div className="w-full">
                    <p className="text-[#999999] text-sm mb-4 font-semibold uppercase">
                      Top 10 {activeTab === "general" ? "Partidos" : "Asociaciones"}
                    </p>
                    <div className="space-y-2">
                      {topParties.map((party, index) => {
                        const logo = getLogoForParty(party.id, party.nombre);
                        return (
                          <div
                            key={party.id}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              borderLeft: `3px solid #C41E3A`,
                            }}
                          >
                            <span className="text-[#999999] font-bold w-6">
                              {index + 1}
                            </span>

                            {logo && (
                              <div className="flex-shrink-0">
                                <ImageLoader
                                  src={logo}
                                  alt={party.nombre}
                                  size={24}
                                  className="h-6 w-6 object-contain"
                                />
                              </div>
                            )}

                            <span className="text-white font-semibold flex-1 text-left truncate">
                              {party.nombre}
                            </span>

                            <span className="text-[#C41E3A] font-bold">
                              {party.porcentaje.toFixed(1)}%
                            </span>

                            <span className="text-[#999999] text-sm">
                              {party.escanos} escaños
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="pt-4"
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <p className="text-[#CCCCCC] text-xs opacity-80">
                      {activeTab === "general"
                        ? "Elecciones Generales - 350 escaños (umbral 3%)"
                        : "Asociaciones Juveniles - 50 escaños (umbral 7%)"}
                    </p>
                    {edadPromedio && (
                      <p className="text-[#999999] text-xs mt-1">
                        Edad promedio: {edadPromedio.toFixed(1)} años
                      </p>
                    )}
                    <p className="text-[#C41E3A] text-xs mt-2 font-semibold">
                      #BatallaaCultural - ¡Participa y haz oír tu voz!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <button
                onClick={downloadInfography}
                className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <Download className="h-5 w-5" />
                Descargar PNG
              </button>

              <button
                onClick={shareOnX}
                className="bg-black hover:bg-[#1a1a1a] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <X className="h-5 w-5" />
                Compartir en X
              </button>

              <button
                onClick={shareOnBluesky}
                className="bg-[#1185FE] hover:bg-[#0d6fd6] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Compartir en Bluesky
              </button>

              <button
                onClick={shareOnDiscord}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.3671a19.8062 19.8062 0 00-4.885-1.515.0741.0741 0 00-.0785.0371c-.211.3671-.444.8447-.607 1.2226a18.268 18.268 0 00-5.487 0c-.163-.3933-.399-.8555-.607-1.2226a.077.077 0 00-.0785-.037 19.7355 19.7355 0 00-4.885 1.515.0699.0699 0 00-.0321.0277C1.75 8.068 1.088 11.731 2.3720 15.2381a.083.083 0 00.0313.0554 19.902 19.902 0 005.9365 3.0294.0852.0852 0 00.0941-.0597c.4009-.993.757-2.037 1.044-3.117a.081.081 0 00-.0453-.1121 13.047 13.047 0 01-1.872-.892.083.083 0 01-.0084-.1384c.126-.094.252-.194.372-.287a.08.08 0 01.0842-.0102c3.928 1.793 8.18 1.793 12.062 0a.083.083 0 01.0842.0102c.12.093.246.193.372.287a.083.083 0 01-.0083.1384c-.6.35-1.243.645-1.873.892a.083.083 0 00-.0453.1121c.287 1.08.644 2.124 1.044 3.117a.083.083 0 00.0941.0597 19.89 19.89 0 005.9365-3.0294.083.083 0 00.0314-.0554c1.326-3.566.659-7.16-.998-10.376a.06.06 0 00-.0321-.0277zM8.02 12.6945c-.919 0-1.674-.847-1.674-1.887 0-1.04.738-1.887 1.674-1.887.937 0 1.687.847 1.674 1.887 0 1.04-.737 1.887-1.674 1.887zm7.975 0c-.919 0-1.674-.847-1.674-1.887 0-1.04.738-1.887 1.674-1.887.937 0 1.687.847 1.674 1.887 0 1.04-.737 1.887-1.674 1.887z" />
                </svg>
                Compartir en Discord
              </button>
            </div>

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
