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
        backgroundColor: "#FFFFFF",
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

      // Fondo blanco
      ctx.fillStyle = "#FFFFFF";
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
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#FFFFFF",
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
          <div className="bg-white rounded-xl p-8 max-w-6xl w-full border border-[#E0E0E0] max-h-[95vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2">
              Compartir Resultados
            </h3>
            <p className="text-sm text-[#666666] mb-6">
              Difunde los resultados en tus redes sociales
            </p>

            {/* Selector de Modo */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setInfographyMode("individual")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  infographyMode === "individual"
                    ? "bg-[#C41E3A] text-white"
                    : "bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]"
                }`}
              >
                Resultado Individual
              </button>
              <button
                onClick={() => setInfographyMode("complete")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  infographyMode === "complete"
                    ? "bg-[#C41E3A] text-white"
                    : "bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]"
                }`}
              >
                Top 10
              </button>
            </div>

            {/* Selector de resultado (solo en modo individual) */}
            {infographyMode === "individual" && (
              <div className="mb-6">
                <label className="text-sm text-[#666666] mb-3 block font-medium">
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
                            ? "border-[#C41E3A] bg-[#FFF5F7] text-[#C41E3A]"
                            : "border-[#E0E0E0] bg-white text-[#666666] hover:border-[#C41E3A]"
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

            {/* Infografía Individual - MINIMALISTA */}
            {infographyMode === "individual" && selectedParty && (
              <div className="mb-6">
                <label className="text-sm text-[#666666] mb-3 block font-medium">
                  Vista previa:
                </label>
                <div
                  ref={infographyRef}
                  className="relative rounded-xl p-20 border flex flex-col items-center justify-center overflow-hidden bg-white border-[#E0E0E0] w-full"
                  style={{
                    minHeight: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around'
                  }}
                >
                  {/* Contenido minimalista */}
                  <div className="text-center space-y-10 w-full flex flex-col items-center">
                    {/* Logo del partido */}
                    {getLogoForParty(selectedParty.id, selectedParty.nombre) && (
                      <div className="flex justify-center">
                        <ImageLoader
                          src={getLogoForParty(
                            selectedParty.id,
                            selectedParty.nombre
                          )}
                          alt={selectedParty.nombre}
                          size={140}
                          className="h-40 w-40 object-contain"
                        />
                      </div>
                    )}

                    {/* Nombre del partido - Tipografía grande y clara */}
                    <p className="text-6xl font-bold text-[#1D1D1F] leading-tight">
                      {selectedParty.nombre}
                    </p>

                    {/* Porcentaje - Destacado */}
                    <div className="space-y-3">
                      <p className="text-9xl font-bold text-[#C41E3A] leading-none">
                        {selectedParty.porcentaje.toFixed(1)}%
                      </p>
                      <p className="text-xl text-[#666666] font-medium">
                        {selectedParty.votos.toLocaleString()} votos
                      </p>
                    </div>

                    {/* Escaños - Visualización clara y destacada */}
                    <div className="pt-6">
                      <div className="inline-block px-12 py-6 border-3 border-[#C41E3A] rounded-xl bg-[#FFF5F7]">
                        <p className="text-7xl font-bold text-[#C41E3A] leading-none">
                          {selectedParty.escanos}
                        </p>
                        <p className="text-base text-[#666666] mt-3 font-semibold tracking-wide">
                          ESCAÑOS {activeTab === "general" ? "(de 350)" : "(de 50)"}
                        </p>
                      </div>
                    </div>

                    {/* Footer minimalista */}
                    <div className="pt-8 border-t border-[#E0E0E0] w-full">
                      <p className="text-base text-[#999999] mb-3 font-semibold tracking-wide">
                        {activeTab === "general"
                          ? "ELECCIONES GENERALES"
                          : "ASOCIACIONES JUVENILES"}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src="/favicon.png"
                          alt="BC Logo"
                          className="h-7 w-7"
                        />
                        <span className="text-[#C41E3A] font-bold text-lg">
                          Batalla Cultural
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Infografía Completa - MINIMALISTA */}
            {infographyMode === "complete" && (
              <div className="mb-6">
                <label className="text-sm text-[#666666] mb-3 block font-medium">
                  Infografía Top 10:
                </label>
                <div
                  ref={infographyRef}
                  className="relative rounded-xl p-12 border flex flex-col items-center justify-center overflow-hidden bg-white border-[#E0E0E0] w-full"
                  style={{
                    minHeight: '500px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Contenido minimalista */}
                  <div className="text-center space-y-6 w-full flex flex-col">
                    {/* Header */}
                    <div className="pb-6 border-b border-[#E0E0E0]">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <img
                          src="/favicon.png"
                          alt="BC Logo"
                          className="h-9 w-9"
                        />
                        <span className="text-[#C41E3A] font-bold text-xl">
                          Batalla Cultural
                        </span>
                      </div>
                      <p className="text-[#666666] text-base font-semibold">
                        {activeTab === "general"
                          ? "Elecciones Generales"
                          : "Asociaciones Juveniles"}
                      </p>
                    </div>

                    {/* Top 10 Partidos/Asociaciones */}
                    <div className="w-full flex-1">
                      <p className="text-[#999999] text-sm mb-5 font-bold uppercase tracking-wider">
                        Top 10{" "}
                        {activeTab === "general"
                          ? "Partidos"
                          : "Asociaciones"}
                      </p>
                      <div className="space-y-3">
                        {topParties.map((party, index) => {
                          const logo = getLogoForParty(party.id, party.nombre);
                          return (
                            <div
                              key={party.id}
                              className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#F9F9F9]"
                            >
                              <span className="text-[#999999] font-bold w-6 text-base">
                                {index + 1}.
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

                              <span className="text-[#1D1D1F] font-semibold flex-1 text-left truncate text-base">
                                {party.nombre}
                              </span>

                              <span className="text-[#C41E3A] font-bold text-base">
                                {party.porcentaje.toFixed(1)}%
                              </span>

                              <span className="text-[#666666] text-sm font-semibold min-w-fit">
                                {party.escanos} esc.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-[#E0E0E0]">
                      <p className="text-[#999999] text-sm">
                        {activeTab === "general"
                          ? "350 escaños (umbral 3%)"
                          : "50 escaños (umbral 7%)"}
                      </p>
                      {edadPromedio && (
                        <p className="text-[#999999] text-sm mt-1">
                          Edad promedio: {edadPromedio.toFixed(1)} años
                        </p>
                      )}
                      <p className="text-[#C41E3A] text-sm mt-2 font-semibold">
                        #BatallaaCultural
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
                className="w-full bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#1D1D1F] py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold border border-[#E0E0E0]"
              >
                <Download className="h-5 w-5" />
                Descargar Infografía
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
                  Descargar Completa
                </button>
              )}
              <button
                onClick={shareOnX}
                className="w-full bg-black hover:bg-[#1D1D1F] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                <X className="h-5 w-5" />
                Compartir en X
              </button>
              <button
                onClick={shareOnBluesky}
                className="w-full bg-[#1185FE] hover:bg-[#0A66DC] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                Compartir en Bluesky
              </button>
              <button
                onClick={shareOnDiscord}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold"
              >
                Compartir en Discord
              </button>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full text-[#666666] hover:text-[#1D1D1F] py-2 font-medium transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
