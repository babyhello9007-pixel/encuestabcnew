import { useState, useRef } from "react";
import { Share2, X, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { generateAdvancedInfographic } from "@/lib/pngExportAdvanced";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "@/lib/surveyData";
import ImageLoader from "./ImageLoader";

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

export function ShareResultsAdvanced({
  activeTab,
  stats,
  totalVotes,
  edadPromedio,
}: ShareResultsAdvancedProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyStats | null>(
    stats.length > 0 ? stats[0] : null
  );
  const [infographyMode, setInfographyMode] = useState<"individual" | "complete">("individual");
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

    return "";
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
      const finalCanvas = document.createElement("canvas");
      const ctx = finalCanvas.getContext("2d");
      if (!ctx) return;

      // Dimensiones 16:9 en alta resolución (1920x1080)
      finalCanvas.width = 1920;
      finalCanvas.height = 1080;

      // Fondo oscuro
      ctx.fillStyle = "#1A1A1A";
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
      link.download = `batalla-cultural-${selectedParty?.nombre || "resultado"}-${new Date()
        .toISOString()
        .split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading infography:", error);
      alert("Error al descargar la infografía");
    }
  };

  const shareOnX = async () => {
    if (!selectedParty || !infographyRef.current) return;
    try {
      const canvas = await html2canvas(infographyRef.current, {
        backgroundColor: "#1A1A1A",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);

          const text = generateShareText(selectedParty);
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(window.location.href)}`;

          alert("Imagen copiada al portapapeles. Abre X y pega la imagen en el tweet.");
          window.open(url, "_blank", "width=550,height=420");
        } catch (err) {
          console.error("Error al copiar imagen:", err);
          const text = generateShareText(selectedParty);
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(window.location.href)}`;
          window.open(url, "_blank", "width=550,height=420");
        }
      });
    } catch (error) {
      console.error("Error en shareOnX:", error);
      alert("Error al preparar la imagen. Intenta nuevamente.");
    }
  };

  const shareOnBluesky = async () => {
    if (!selectedParty || !infographyRef.current) return;
    try {
      const canvas = await html2canvas(infographyRef.current, {
        backgroundColor: "#1A1A1A",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);

          const text = generateShareText(selectedParty);
          const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(
            text + "\n\n" + window.location.href
          )}`;

          alert("Imagen copiada al portapapeles. Abre Bluesky y pega la imagen en el post.");
          window.open(url, "_blank", "width=550,height=420");
        } catch (err) {
          console.error("Error al copiar imagen:", err);
          const text = generateShareText(selectedParty);
          const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(
            text + "\n\n" + window.location.href
          )}`;
          window.open(url, "_blank", "width=550,height=420");
        }
      });
    } catch (error) {
      console.error("Error en shareOnBluesky:", error);
      alert("Error al preparar la imagen. Intenta nuevamente.");
    }
  };

  const shareOnDiscord = () => {
    if (!selectedParty) return;
    const text = generateShareText(selectedParty);
    navigator.clipboard.writeText(text);
    alert("Texto copiado al portapapeles. Descarga la infografia y pégala en Discord.");
  };

  const topParties = stats.slice(0, 10);

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
            <h3 className="text-2xl font-bold text-white mb-2">
              Compartir Resultados
            </h3>
            <p className="text-sm text-[#999999] mb-6">
              Difunde los resultados en tus redes sociales
            </p>

            {/* Selector de Modo */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setInfographyMode("individual")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  infographyMode === "individual"
                    ? "bg-[#C41E3A] text-white"
                    : "bg-[#2D2D2D] text-[#999999] hover:bg-[#3D3D3D]"
                }`}
              >
                Modo Individual
              </button>
              <button
                onClick={() => setInfographyMode("complete")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  infographyMode === "complete"
                    ? "bg-[#C41E3A] text-white"
                    : "bg-[#2D2D2D] text-[#999999] hover:bg-[#3D3D3D]"
                }`}
              >
                Modo Completo
              </button>
            </div>

            {/* Selector de resultado (solo en modo individual) */}
            {infographyMode === "individual" && (
              <div className="mb-6">
                <label className="text-sm text-[#999999] mb-3 block">
                  Selecciona un resultado para compartir:
                </label>
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
                            <ImageLoader
                              src={logo}
                              alt={party.nombre}
                              size={20}
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
            )}

            {/* Infografía Individual */}
            {infographyMode === "individual" && selectedParty && (
              <div className="mb-6">
                <label className="text-sm text-[#999999] mb-3 block">
                  Vista previa (16:9):
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

                    {getLogoForParty(selectedParty.id, selectedParty.nombre) && (
                      <div className="flex justify-center">
                        <div
                          className="relative"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "16px",
                            padding: "16px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 8px 32px 0 rgba(196, 30, 58, 0.2)",
                          }}
                        >
                          <ImageLoader
                            src={getLogoForParty(
                              selectedParty.id,
                              selectedParty.nombre
                            )}
                            alt={selectedParty.nombre}
                            size={96}
                            className="h-24 w-24 object-contain drop-shadow-lg"
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-4xl font-bold text-white drop-shadow-lg">
                      {selectedParty.nombre}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p
                          className="text-7xl font-bold text-[#C41E3A] drop-shadow-lg"
                          style={{
                            textShadow: "0 0 20px rgba(196, 30, 58, 0.4)",
                          }}
                        >
                          {selectedParty.porcentaje.toFixed(1)}%
                        </p>
                        <p className="text-[#CCCCCC] text-lg opacity-90">
                          {selectedParty.votos.toLocaleString()} votos de{" "}
                          {totalVotes.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#2D2D2D]">
                        <p className="text-[#C41E3A] text-4xl font-bold drop-shadow-lg">
                          {selectedParty.escanos}
                        </p>
                        <p className="text-[#999999] text-sm">
                          escaños {activeTab === "general" ? "(de 350)" : "(de 50)"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="pt-6"
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <p className="text-[#CCCCCC] text-sm mb-3 opacity-80">
                        {activeTab === "general"
                          ? "Elecciones Generales"
                          : "Asociaciones Juveniles"}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src="/favicon.png"
                          alt="BC Logo"
                          className="h-8 w-8 drop-shadow-lg"
                        />
                        <span className="text-[#C41E3A] font-bold text-lg drop-shadow-lg">
                          Batalla Cultural
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Infografía Completa */}
            {infographyMode === "complete" && (
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
                        Top 10{" "}
                        {activeTab === "general"
                          ? "Partidos"
                          : "Asociaciones"}
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
                                borderLeft: "3px solid #C41E3A",
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
              {infographyMode === "individual" && (
                <button
                  onClick={() =>
                    generateAdvancedInfographic(
                      stats,
                      activeTab,
                      totalVotes,
                      edadPromedio
                    )
                  }
                  className="w-full bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
                >
                  <Image className="h-5 w-5" />
                  Descargar Infografía Completa (PNG)
                </button>
              )}
              <button
                onClick={shareOnX}
                className="w-full bg-black hover:bg-[#1a1a1a] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
                title="Compartir infografia en X. La imagen se acompanara automaticamente."
              >
                <X className="h-5 w-5" />
                Compartir en X (con imagen)
              </button>
              <button
                onClick={shareOnBluesky}
                className="w-full bg-[#1185FE] hover:bg-[#0d6fd6] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
                title="Compartir infografia en Bluesky. La imagen se acompanara automaticamente."
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Compartir en Bluesky (con imagen)
              </button>
              <button
                onClick={shareOnDiscord}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
                title="Copiar texto para Discord. Podras adjuntar la imagen manualmente."
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

            {/* Texto para copiar */}
            {selectedParty && infographyMode === "individual" && (
              <div
                className="rounded-lg p-4 mb-6 border"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderColor: "rgba(196, 30, 58, 0.2)",
                }}
              >
                <p className="text-[#999999] text-xs mb-2 font-semibold uppercase tracking-wide">
                  Texto para compartir:
                </p>
                <p className="text-white text-sm break-words mb-3 leading-relaxed">
                  {generateShareText(selectedParty)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      generateShareText(selectedParty)
                    );
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
