import { useState, useRef } from "react";
import { Share2, X, Download, Image, MessageCircle, Send, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { generateAdvancedInfographic } from "@/lib/pngExportAdvanced";
import ImageLoader from "./ImageLoader";
import { ColorTheme, getThemeColors, getThemeList } from "@/lib/colorThemes";

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

interface ShareResultsAdvancedProps {
  activeTab: "general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo" | "el-analisis" | "encuestadoras-externas" | "preguntas-varias";
  stats: PartyStats[];
  totalVotes: number;
  edadPromedio?: number | null;
  partyMeta?: Record<string, { logo?: string; color?: string }>;
}

export function ShareResultsAdvanced({
  activeTab,
  stats,
  totalVotes,
  edadPromedio,
  partyMeta = {},
}: ShareResultsAdvancedProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyStats | null>(
    stats.length > 0 ? stats[0] : null
  );
  const [infographyMode, setInfographyMode] = useState<"individual" | "complete">("individual");
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>("light");
  const infographyRef = useRef<HTMLDivElement>(null);

  const theme = getThemeColors(selectedTheme);

  // Obtener logos directamente de los datos - Misma lógica robusta que Results.tsx
  const getLogoForParty = (partyId: string, partyName?: string) => {
    const fromStats = stats.find((s) => s.id === partyId || s.nombre === partyName);
    return fromStats?.logo || partyMeta[partyId]?.logo || "";
  };

  const generateShareText = (party: PartyStats) => {
    const percentage = party.porcentaje.toFixed(1);
    const type = activeTab === "general" ? "Elecciones Generales" : "Asociaciones Juveniles";
    return `🗳️ Según la Encuesta de Batalla Cultural, ${party.nombre} lidera con ${percentage}% de los votos en ${type}. ¡Participa y haz oír tu voz! #BatallaaCultural`;
  };

  const downloadInfography = async () => {
    if (!infographyRef.current) return;

    try {
      // Clonar el elemento para obtener sus dimensiones reales
      const element = infographyRef.current;
      const rect = element.getBoundingClientRect();
      const scrollHeight = element.scrollHeight;
      const scrollWidth = element.scrollWidth;
      
      const canvas = await html2canvas(element, {
        backgroundColor: theme.background,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: Math.max(scrollWidth, 1200),
        windowHeight: Math.max(scrollHeight, 800),
        width: scrollWidth,
        height: scrollHeight,
        ignoreElements: (el) => {
          // No ignorar ningún elemento
          return false;
        },
      });

      // Descargar la captura exacta de la preview
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      const filename = infographyMode === "individual"
        ? `batalla-cultural-${selectedParty?.nombre || "resultado"}-${new Date().toISOString().split("T")[0]}.png`
        : `batalla-cultural-top10-${new Date().toISOString().split("T")[0]}.png`;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error("Error downloading infography:", error);
      alert("Error al descargar la infografía");
    }
  };

  const shareOnX = async () => {
    if (!selectedParty || !infographyRef.current) return;
    try {
      const element = infographyRef.current;
      const scrollHeight = element.scrollHeight;
      const scrollWidth = element.scrollWidth;
      
      const canvas = await html2canvas(element, {
        backgroundColor: theme.background,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: Math.max(scrollWidth, 1200),
        windowHeight: Math.max(scrollHeight, 800),
        width: scrollWidth,
        height: scrollHeight,
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
      const element = infographyRef.current;
      const scrollHeight = element.scrollHeight;
      const scrollWidth = element.scrollWidth;
      
      const canvas = await html2canvas(element, {
        backgroundColor: theme.background,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: Math.max(scrollWidth, 1200),
        windowHeight: Math.max(scrollHeight, 800),
        width: scrollWidth,
        height: scrollHeight,
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

  const shareOnWhatsApp = async () => {
    if (!selectedParty) return;
    try {
      const text = generateShareText(selectedParty);
      const url = `https://wa.me/?text=${encodeURIComponent(
        text + "\n" + window.location.href
      )}`;
      window.open(url, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("Error en shareOnWhatsApp:", error);
      alert("Error al compartir en WhatsApp");
    }
  };

  const shareOnTelegram = async () => {
    if (!selectedParty) return;
    try {
      const text = generateShareText(selectedParty);
      const url = `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("Error en shareOnTelegram:", error);
      alert("Error al compartir en Telegram");
    }
  };

  const shareOnLinkedIn = async () => {
    if (!selectedParty) return;
    try {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`;
      window.open(url, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("Error en shareOnLinkedIn:", error);
      alert("Error al compartir en LinkedIn");
    }
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

            {/* Selector de Tema de Colores */}
            <div className="mb-6">
              <label className="text-xs sm:text-sm text-[#666666] mb-3 block font-medium">
                Selecciona el esquema de colores:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {getThemeList().map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setSelectedTheme(themeOption.id)}
                    className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedTheme === themeOption.id
                        ? "border-[#C41E3A] bg-[#FFF5F7]"
                        : "border-[#E0E0E0] bg-white hover:border-[#C41E3A]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: getThemeColors(themeOption.id).background }}
                      />
                      <div className="text-left hidden sm:block">
                        <p className="font-semibold text-xs sm:text-base text-[#1D1D1F]">{themeOption.name}</p>
                        <p className="text-xs text-[#999999]">{themeOption.description}</p>
                      </div>
                      <p className="font-semibold text-xs sm:hidden text-[#1D1D1F] text-center">{themeOption.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de resultado (solo en modo individual) */}
            {infographyMode === "individual" && (
              <div className="mb-6">
                <label className="text-xs sm:text-sm text-[#666666] mb-3 block font-medium">
                  Selecciona un resultado para compartir:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {stats.map((party) => {
                    const logo = getLogoForParty(party.id, party.nombre);
                    return (
                      <button
                        key={party.id}
                        onClick={() => setSelectedParty(party)}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition text-xs sm:text-sm font-semibold ${
                          selectedParty?.id === party.id
                            ? "border-[#C41E3A] bg-[#FFF5F7] text-[#C41E3A]"
                            : "border-[#E0E0E0] bg-white text-[#666666] hover:border-[#C41E3A]"
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 justify-center">
                          {logo && (
                            <ImageLoader
                              src={logo}
                              alt={party.nombre}
                              size={16}
                              className="h-4 w-4 sm:h-5 sm:w-5 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="truncate text-xs">{party.nombre}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Infografía Individual - CON TEMA DINÁMICO */}
            {infographyMode === "individual" && selectedParty && (
              <div className="mb-6">
                <label className="text-sm text-[#666666] mb-3 block font-medium">
                  Vista previa:
                </label>
                <div
                  ref={infographyRef}
                  className="relative rounded-xl p-20 border flex flex-col items-center justify-center w-full"
                  style={{
                    minHeight: '700px',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    overflow: 'visible',
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
                    <p
                      className="text-6xl font-bold leading-tight"
                      style={{ color: theme.text }}
                    >
                      {selectedParty.nombre}
                    </p>

                    {/* Porcentaje - Destacado */}
                    <div className="space-y-3">
                      <p
                        className="text-9xl font-bold leading-none"
                        style={{ color: theme.accent }}
                      >
                        {selectedParty.porcentaje.toFixed(1)}%
                      </p>
                      <p
                        className="text-xl font-medium"
                        style={{ color: theme.textSecondary }}
                      >
                        {selectedParty.votos.toLocaleString()} votos
                      </p>
                    </div>

                    {/* Escaños - Visualización clara y destacada */}
                    <div className="pt-6">
                      <div
                        className="inline-block px-12 py-6 border-3 rounded-xl"
                        style={{
                          borderColor: theme.accent,
                          backgroundColor: theme.accent,
                        }}
                      >
                        <p
                          className="text-7xl font-bold leading-none"
                          style={{ color: '#FFFFFF' }}
                        >
                          {selectedParty.escanos}
                        </p>
                        <p
                          className="text-base mt-3 font-semibold tracking-wide"
                          style={{ color: '#FFFFFF' }}
                        >
                          ESCAÑOS {activeTab === "general" ? "(de 350)" : "(de 50)"}
                        </p>
                      </div>
                    </div>

                    {/* Footer minimalista */}
                    <div
                      className="pt-8 border-t w-full"
                      style={{ borderColor: theme.border }}
                    >
                      <p
                        className="text-base mb-3 font-semibold tracking-wide"
                        style={{ color: theme.textSecondary }}
                      >
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
                        <span
                          className="font-bold text-lg"
                          style={{ color: theme.accent }}
                        >
                          Batalla Cultural
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Infografía Completa - CON TEMA DINÁMICO */}
            {infographyMode === "complete" && (
              <div className="mb-6">
                <label className="text-sm text-[#666666] mb-3 block font-medium">
                  Infografía Top 10:
                </label>
                <div
                  ref={infographyRef}
                  className="relative rounded-xl p-12 border flex flex-col items-center justify-center w-full"
                  style={{
                    minHeight: '600px',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    overflow: 'visible',
                  }}
                >
                  {/* Contenido minimalista */}
                  <div className="text-center space-y-6 w-full flex flex-col">
                    {/* Header */}
                    <div
                      className="pb-6 border-b"
                      style={{ borderColor: theme.border }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <img
                          src="/favicon.png"
                          alt="BC Logo"
                          className="h-9 w-9"
                        />
                        <span
                          className="font-bold text-xl"
                          style={{ color: theme.accent }}
                        >
                          Batalla Cultural
                        </span>
                      </div>
                      <p
                        className="text-base font-semibold"
                        style={{ color: theme.textSecondary }}
                      >
                        {activeTab === "general"
                          ? "Elecciones Generales"
                          : "Asociaciones Juveniles"}
                      </p>
                    </div>

                    {/* Top 10 Partidos/Asociaciones */}
                    <div className="w-full flex-1">
                      <p
                        className="text-sm mb-5 font-bold uppercase tracking-wider"
                        style={{ color: theme.textSecondary }}
                      >
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
                              className="flex items-center gap-4 px-4 py-3 rounded-lg"
                              style={{ backgroundColor: theme.cardBg }}
                            >
                              <span
                                className="font-bold w-6 text-base"
                                style={{ color: theme.textSecondary }}
                              >
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

                              <span
                                className="font-semibold flex-1 text-left truncate text-base"
                                style={{ color: theme.text }}
                              >
                                {party.nombre}
                              </span>

                              <span
                                className="font-bold text-base"
                                style={{ color: theme.accent }}
                              >
                                {party.porcentaje.toFixed(1)}%
                              </span>

                              <span
                                className="text-sm font-semibold min-w-fit"
                                style={{ color: theme.textSecondary }}
                              >
                                {party.escanos} esc.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="pt-6 border-t"
                      style={{ borderColor: theme.border }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: theme.textSecondary }}
                      >
                        {activeTab === "general"
                          ? "350 escaños (umbral 3%)"
                          : "50 escaños (umbral 7%)"}
                      </p>
                      {edadPromedio && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: theme.textSecondary }}
                        >
                          Edad promedio: {edadPromedio.toFixed(1)} años
                        </p>
                      )}
                      <p
                        className="text-sm mt-2 font-semibold"
                        style={{ color: theme.accent }}
                      >
                        #BatallaaCultural
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-2 sm:space-y-3 mb-6">
              <button
                onClick={downloadInfography}
                className="w-full bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#1D1D1F] py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base border border-[#E0E0E0]"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Descargar Infografía</span>
                <span className="sm:hidden">Descargar</span>
              </button>
              {infographyMode === "individual" && (
                <button
                  onClick={() =>
                    generateAdvancedInfographic(
                      stats.map((party) => ({
                        ...party,
                        logo: party.logo || partyMeta[party.id]?.logo || "",
                        color: party.color || partyMeta[party.id]?.color,
                      })),
                      activeTab === "youth" ? "youth" : "general",
                      totalVotes,
                      edadPromedio
                    )
                  }
                  className="w-full bg-gradient-to-r from-[#C41E3A] to-[#A01830] hover:from-[#A01830] hover:to-[#8B1428] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
                >
                  <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Descargar Completa</span>
                  <span className="sm:hidden">Completa</span>
                </button>
              )}
              <button
                onClick={shareOnX}
                className="w-full bg-black hover:bg-[#1D1D1F] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Compartir en X</span>
                <span className="sm:hidden">X</span>
              </button>
              <button
                onClick={shareOnBluesky}
                className="w-full bg-[#1185FE] hover:bg-[#0A66DC] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Compartir en Bluesky</span>
                <span className="sm:hidden">Bluesky</span>
              </button>
              <button
                onClick={shareOnDiscord}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <span className="hidden sm:inline">Compartir en Discord</span>
                <span className="sm:hidden">Discord</span>
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Compartir en WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
              <button
                onClick={shareOnTelegram}
                className="w-full bg-[#0088cc] hover:bg-[#0077B5] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Compartir en Telegram</span>
                <span className="sm:hidden">Telegram</span>
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="w-full bg-[#0A66C2] hover:bg-[#084B94] text-white py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg font-semibold text-xs sm:text-base"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Compartir en LinkedIn</span>
                <span className="sm:hidden">LinkedIn</span>
              </button>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full text-[#666666] hover:text-[#1D1D1F] py-2 font-medium text-xs sm:text-base transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
