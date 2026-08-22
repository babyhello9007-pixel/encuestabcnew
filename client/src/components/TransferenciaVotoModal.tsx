import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  X,
  Search,
  Download,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Shuffle,
  BarChart3,
  GitCommit,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

// --- Interfaces ---
interface TransferenciaVotoDataRaw {
  partido_anterior?: string;
  origen_partido?: string;
  partido_nuevo?: string;
  destino_partido?: string;
  total_transferencias?: number;
  votos_transferidos?: number;
  porcentaje?: number;
}

interface TransferenciaVotoData {
  origen_partido: string;
  destino_partido: string;
  votos_transferidos: number;
  porcentaje: number;
}

interface PartyConfig {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active?: boolean;
}

interface TransferenciaVotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyColors?: Record<string, string>;
}

type ModeFilter = "ALL" | "FIDELITY" | "LEAKAGE";

const FALLBACK_COLORS: Record<string, string> = {
  PP: "#1e40af",
  PSOE: "#ef4444",
  VOX: "#16a34a",
  SUMAR: "#ec4899",
  PODEMOS: "#8b5cf6",
  ERC: "#f59e0b",
  JUNTS: "#06b6d4",
  PNV: "#059669",
  BILDU: "#10b981",
  D21: "#f97316",
  OTROS: "#6b7280",
};

const ITEMS_PER_PAGE = 10;

// Normaliza el nombre de un partido de forma consistente en toda la app
function normalizeParty(name?: string | null): string {
  return (name || "OTROS").trim().toUpperCase();
}

// Escapa un valor para uso seguro dentro de un campo CSV entrecomillado
function csvEscape(value: string | number): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el logotipo para la exportación."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function loadCanvasImage(source: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

/** Convierte las imágenes externas del SVG en data URL para que Canvas no las omita al exportar. */
async function inlineSvgLogos(svgElement: SVGSVGElement): Promise<SVGSVGElement> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  await Promise.all(Array.from(clone.querySelectorAll("image")).map(async (imageNode) => {
    const source = imageNode.getAttribute("href") || imageNode.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (!source || source.startsWith("data:")) return;

    try {
      const response = await fetch(source, { cache: "force-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dataUrl = await blobToDataUrl(await response.blob());
      imageNode.setAttribute("href", dataUrl);
      imageNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);
    } catch {
      // Una imagen externa sin CORS invalida Canvas y hace fallar toda la descarga.
      // Se retira solo si no se puede convertir a data URL de forma segura.
      imageNode.remove();
    }
  }));

  return clone;
}

export function TransferenciaVotoModal({
  isOpen,
  onClose,
  partyColors = {},
}: TransferenciaVotoModalProps) {
  const [transferData, setTransferData] = useState<TransferenciaVotoData[]>([]);
  const [partyConfigs, setPartyConfigs] = useState<Record<string, PartyConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedOrigen, setSelectedOrigen] = useState<string>("GLOBAL");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const sankeyRef = useRef<SVGSVGElement | null>(null);
  const hasFetchedRef = useRef(false);
  const dialogTitleId = "transferencia-voto-titulo";

  // Debounce del buscador para no re-filtrar en cada pulsación
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Carga de datos: se cachea mientras el componente permanezca montado,
  // y se cancela de forma segura si el modal se cierra antes de terminar.
  useEffect(() => {
    if (!isOpen || hasFetchedRef.current) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [{ data: partyData, error: partyErr }, { data, error: dataErr }] =
          await Promise.all([
            supabase
              .from("party_configuration")
              .select("party_key, display_name, color, logo_url, is_active")
              .eq("is_active", true),
            supabase.from("transferencia_votos_view").select("*"),
          ]);

        if (cancelled) return;

        if (!partyErr && partyData) {
          const configMap: Record<string, PartyConfig> = {};
          partyData.forEach((p) => {
            if (p.party_key) configMap[normalizeParty(p.party_key)] = p;
            if (p.display_name) configMap[normalizeParty(p.display_name)] = p;
          });
          setPartyConfigs(configMap);
        }

        if (dataErr) throw dataErr;

        const formattedData: TransferenciaVotoData[] = (data || []).map(
          (item: TransferenciaVotoDataRaw) => {
            const votos = Number(
              item.votos_transferidos ?? item.total_transferencias ?? 0
            );
            const pct = Number(item.porcentaje ?? 0);
            return {
              origen_partido: normalizeParty(item.origen_partido || item.partido_anterior),
              destino_partido: normalizeParty(item.destino_partido || item.partido_nuevo),
              // Se descartan valores negativos o no numéricos, que no deberían
              // poder darse en datos de votos pero podrían romper el layout.
              votos_transferidos: Number.isFinite(votos) ? Math.max(votos, 0) : 0,
              porcentaje: Number.isFinite(pct) ? Math.max(pct, 0) : 0,
            };
          }
        );

        setTransferData(formattedData);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Error fetching transfer data:", err);
        if (!cancelled) {
          setError(
            "No se han podido cargar los datos de transferencia de voto. Comprueba tu conexión e inténtalo de nuevo."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Bloquea el scroll del body y permite cerrar con Escape mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrigen, modeFilter, searchTerm]);

  const handleRetry = useCallback(() => {
    hasFetchedRef.current = false;
    setError(null);
    // Fuerza un nuevo intento reutilizando el efecto de carga
    setLoading(true);
    (async () => {
      hasFetchedRef.current = false;
    })();
  }, []);

  const getPartyColor = useCallback(
    (partyName: string): string => {
      if (!partyName) return "#818cf8";
      const key = normalizeParty(partyName);
      if (partyConfigs[key]?.color) return partyConfigs[key].color;
      if (partyColors[key]) return partyColors[key];
      if (partyColors[partyName]) return partyColors[partyName];
      return FALLBACK_COLORS[key] || "#818cf8";
    },
    [partyConfigs, partyColors]
  );

  const getPartyLogo = useCallback(
    (partyName: string): string | null => {
      if (!partyName) return null;
      const key = normalizeParty(partyName);
      return partyConfigs[key]?.logo_url || null;
    },
    [partyConfigs]
  );

  const getPartyDisplayName = useCallback(
    (partyName: string): string => {
      if (!partyName) return "";
      const key = normalizeParty(partyName);
      return partyConfigs[key]?.display_name || key;
    },
    [partyConfigs]
  );

  const metrics = useMemo(() => {
    if (transferData.length === 0)
      return { totalVotos: 0, movilidadPct: 0, topFidelidad: null, topFuga: null };

    let totalVotosGlobal = 0;
    let totalMovilizados = 0;

    const fidelidadByParty: Record<string, { party: string; pct: number; votos: number }> = {};
    const fugaByParty: Record<string, { origen: string; destino: string; pct: number; votos: number }> = {};
    const totalPorOrigen: Record<string, number> = {};

    transferData.forEach((d) => {
      totalPorOrigen[d.origen_partido] = (totalPorOrigen[d.origen_partido] || 0) + d.votos_transferidos;
      totalVotosGlobal += d.votos_transferidos;
      if (d.origen_partido !== d.destino_partido) {
        totalMovilizados += d.votos_transferidos;
      }
    });

    transferData.forEach((d) => {
      const isFidelidad = d.origen_partido === d.destino_partido;
      const pct = (d.votos_transferidos / (totalPorOrigen[d.origen_partido] || 1)) * 100;

      if (isFidelidad) {
        fidelidadByParty[d.origen_partido] = { party: d.origen_partido, pct, votos: d.votos_transferidos };
      } else {
        if (!fugaByParty[d.origen_partido] || fugaByParty[d.origen_partido].votos < d.votos_transferidos) {
          fugaByParty[d.origen_partido] = { origen: d.origen_partido, destino: d.destino_partido, pct, votos: d.votos_transferidos };
        }
      }
    });

    return {
      totalVotos: totalVotosGlobal,
      movilidadPct: totalVotosGlobal > 0 ? (totalMovilizados / totalVotosGlobal) * 100 : 0,
      topFidelidad: Object.values(fidelidadByParty).sort((a, b) => b.pct - a.pct)[0] || null,
      topFuga: Object.values(fugaByParty).sort((a, b) => b.votos - a.votos)[0] || null,
    };
  }, [transferData]);

  const filteredData = useMemo(() => {
    return transferData.filter((item) => {
      if (selectedOrigen !== "GLOBAL" && item.origen_partido !== selectedOrigen) return false;

      const isFidelidad = item.origen_partido === item.destino_partido;
      if (modeFilter === "FIDELITY" && !isFidelidad) return false;
      if (modeFilter === "LEAKAGE" && isFidelidad) return false;

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchOrigen = item.origen_partido.toLowerCase().includes(term) ||
          getPartyDisplayName(item.origen_partido).toLowerCase().includes(term);
        const matchDestino = item.destino_partido.toLowerCase().includes(term) ||
          getPartyDisplayName(item.destino_partido).toLowerCase().includes(term);
        if (!matchOrigen && !matchDestino) return false;
      }

      return true;
    });
  }, [transferData, selectedOrigen, modeFilter, searchTerm, getPartyDisplayName]);

  const totalPages = Math.max(Math.ceil(filteredData.length / ITEMS_PER_PAGE), 1);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const partidosOrigen = useMemo(() => {
    return Array.from(new Set(transferData.map((d) => d.origen_partido))).sort((a, b) =>
      getPartyDisplayName(a).localeCompare(getPartyDisplayName(b))
    );
  }, [transferData, getPartyDisplayName]);

  const maxPorcentaje = useMemo(() => {
    if (filteredData.length === 0) return 100;
    const max = Math.max(...filteredData.map((d) => d.porcentaje));
    return max > 0 ? max : 100;
  }, [filteredData]);

  const hasActiveFilters = selectedOrigen !== "GLOBAL" || modeFilter !== "ALL" || searchTerm.trim() !== "";

  const resetFilters = useCallback(() => {
    setSelectedOrigen("GLOBAL");
    setModeFilter("ALL");
    setSearchInput("");
    setSearchTerm("");
  }, []);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Origen Partido", "Destino Partido", "Votos Transferidos", "Porcentaje (%)"];
    const rows = filteredData.map((d) => [
      csvEscape(getPartyDisplayName(d.origen_partido)),
      csvEscape(getPartyDisplayName(d.destino_partido)),
      d.votos_transferidos,
      d.porcentaje.toFixed(2),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `transferencia_voto_${selectedOrigen}_${modeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPNG = async () => {
    if (!sankeyRef.current || isExporting) return;
    setExportError(null);
    setIsExporting(true);

    let blobURL: string | null = null;
    try {
      const svgElement = sankeyRef.current;
      const exportSvg = await inlineSvgLogos(svgElement);
      const svgString = new XMLSerializer().serializeToString(exportSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      blobURL = URL.createObjectURL(svgBlob);
      const svgUrl = blobURL;

      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onerror = () => reject(new Error("El diagrama SVG no se pudo convertir en imagen."));
        image.onload = async () => {
          try {
        const canvas = document.createElement("canvas");
        const scale = 2;
        const viewBox = svgElement.viewBox.baseVal;
        const width = viewBox?.width || svgElement.clientWidth || 950;
        const height = viewBox?.height || svgElement.clientHeight || 400;
        const headerHeight = 88;

        canvas.width = width * scale;
        canvas.height = (height + headerHeight) * scale;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("No se pudo crear el lienzo de exportación.");

        context.scale(scale, scale);
        context.fillStyle = "#0c0c14";
        context.fillRect(0, 0, width, height + headerHeight);
        const headerGradient = context.createLinearGradient(0, 0, width, 0);
        headerGradient.addColorStop(0, "#16162a");
        headerGradient.addColorStop(1, "#161b31");
        context.fillStyle = headerGradient;
        context.fillRect(0, 0, width, headerHeight);
        context.fillStyle = "#f8fafc";
        context.font = "700 22px Arial, sans-serif";
        context.fillText("Transferencia y Matriz de Voto", 28, 36);
        context.fillStyle = "#a5b4fc";
        context.font = "600 12px Arial, sans-serif";
        context.fillText("Batalla Cultural · Diagrama Sankey", 28, 58);
        const watermark = await loadCanvasImage(new URL("/favicon.png", window.location.origin).href);
        context.save();
        context.globalAlpha = 0.9;
        context.beginPath();
        context.arc(width - 58, 30, 18, 0, Math.PI * 2);
        context.clip();
        if (watermark) {
          context.drawImage(watermark, width - 76, 12, 36, 36);
        } else {
          context.fillStyle = "#e8465a";
          context.fillRect(width - 76, 12, 36, 36);
          context.fillStyle = "#ffffff";
          context.font = "800 14px Arial, sans-serif";
          context.textAlign = "center";
          context.fillText("BC", width - 58, 35);
          context.textAlign = "left";
        }
        context.restore();
        context.textAlign = "right";
        context.fillStyle = "#cbd5e1";
        context.font = "500 12px Arial, sans-serif";
        context.fillText(`Batalla Cultural · ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`, width - 88, 48);
        context.textAlign = "left";
        context.fillStyle = "rgba(255,255,255,.12)";
        context.fillRect(28, headerHeight - 1, width - 56, 1);
        context.drawImage(image, 0, headerHeight, width, height);

        const pngBlob = await new Promise<Blob>((resolveBlob, rejectBlob) => {
          canvas.toBlob((result) => result ? resolveBlob(result) : rejectBlob(new Error("No se pudo convertir el gráfico a PNG.")), "image/png");
        });
        const pngURL = URL.createObjectURL(pngBlob);
          const downloadLink = document.createElement("a");
          downloadLink.href = pngURL;
          downloadLink.download = `grafica_transferencia_${selectedOrigen}_${modeFilter}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        window.setTimeout(() => URL.revokeObjectURL(pngURL), 1_000);
        resolve();
          } catch (exportErr) {
            reject(exportErr);
          }
        };
        image.src = svgUrl;
      });
    } catch (exportErr) {
      console.error("Error exporting PNG:", exportErr);
      setExportError("No se pudo generar la imagen PNG. Inténtalo de nuevo.");
    } finally {
      if (blobURL) URL.revokeObjectURL(blobURL);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(9, 9, 14, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        style={{
          background: "rgba(17,17,24,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 24,
          maxWidth: 1150,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: "absolute",
            top: 20, right: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
            color: "#94a3b8",
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        {/* Cabecera */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ background: "rgba(129, 140, 248, 0.15)", padding: 8, borderRadius: 10, color: "#818cf8" }}>
                <GitCommit size={22} />
              </div>
              <h2 id={dialogTitleId} style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Transferencia y Matriz de Voto
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Análisis visual inter-partidista de fuga, fidelidad e intercambio de electores.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", gap: 10, marginRight: 40 }}>
              <button
                onClick={handleExportPNG}
                disabled={filteredData.length === 0 || isExporting}
                aria-label="Descargar gráfico como PNG"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(129, 140, 248, 0.15)",
                  border: "1px solid rgba(129, 140, 248, 0.3)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "#818cf8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: filteredData.length === 0 || isExporting ? "not-allowed" : "pointer",
                  opacity: filteredData.length === 0 || isExporting ? 0.5 : 1,
                }}
              >
                <ImageIcon size={16} /> {isExporting ? "Generando PNG…" : "Descargar PNG"}
              </button>

              <button
                onClick={handleExportCSV}
                disabled={filteredData.length === 0}
                aria-label="Exportar datos como CSV"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "#f8fafc",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
                  opacity: filteredData.length === 0 ? 0.5 : 1,
                }}
              >
                <Download size={16} /> Exportar CSV
              </button>
            </div>
            {exportError && (
              <span role="alert" style={{ fontSize: 11, color: "#f87171", marginRight: 40 }}>
                {exportError}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          {loading ? (
            <div
              role="status"
              aria-busy="true"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 12 }}
            >
              <Loader2 className="animate-spin" size={36} style={{ color: "#818cf8" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Cargando matriz de transferencias...</span>
            </div>
          ) : error ? (
            <div
              role="alert"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 14, textAlign: "center" }}
            >
              <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: 14, borderRadius: 999 }}>
                <AlertTriangle size={28} />
              </div>
              <span style={{ fontSize: 14, color: "#f8fafc", fontWeight: 600, maxWidth: 420 }}>{error}</span>
              <button
                onClick={handleRetry}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(129, 140, 248, 0.15)", border: "1px solid rgba(129, 140, 248, 0.3)",
                  borderRadius: 10, padding: "8px 16px", color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <RotateCcw size={14} /> Reintentar
              </button>
            </div>
          ) : transferData.length > 0 ? (
            <>
              {/* Tarjetas KPI */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: 10, borderRadius: 12 }}><ShieldCheck size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Mayor Fidelidad</div>
                    {metrics.topFidelidad ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <PartyBadge party={metrics.topFidelidad.party} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>{metrics.topFidelidad.pct.toFixed(1)}%</span>
                      </div>
                    ) : <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>}
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: 10, borderRadius: 12 }}><TrendingUp size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Mayor Transvase</div>
                    {metrics.topFuga ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <PartyBadge party={metrics.topFuga.origen} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                        <ArrowRight size={12} style={{ color: "#94a3b8" }} />
                        <PartyBadge party={metrics.topFuga.destino} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} />
                      </div>
                    ) : <span style={{ fontSize: 13, color: "#64748b" }}>N/D</span>}
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: 10, borderRadius: 12 }}><Shuffle size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Movilidad Electorado</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#c084fc", marginTop: 2 }}>
                      {metrics.movilidadPct.toFixed(1)}% <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>cambió de voto</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div role="group" aria-label="Filtrar por partido de origen" style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Origen:</span>
                  <button
                    onClick={() => setSelectedOrigen("GLOBAL")}
                    aria-pressed={selectedOrigen === "GLOBAL"}
                    style={{
                      background: selectedOrigen === "GLOBAL" ? "#818cf8" : "rgba(255,255,255,0.05)",
                      color: selectedOrigen === "GLOBAL" ? "#fff" : "#94a3b8",
                      border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    🌐 Matriz Global
                  </button>
                  {partidosOrigen.map((partido) => (
                    <button
                      key={partido}
                      onClick={() => setSelectedOrigen(partido)}
                      aria-pressed={selectedOrigen === partido}
                      style={{
                        background: selectedOrigen === partido ? getPartyColor(partido) : "rgba(255,255,255,0.05)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                      }}
                    >
                      {getPartyDisplayName(partido)}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div role="group" aria-label="Filtrar por tipo de movimiento" style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={() => setModeFilter("ALL")} aria-pressed={modeFilter === "ALL"} style={{ background: modeFilter === "ALL" ? "rgba(255,255,255,0.12)" : "transparent", color: modeFilter === "ALL" ? "#fff" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Todos</button>
                    <button onClick={() => setModeFilter("FIDELITY")} aria-pressed={modeFilter === "FIDELITY"} style={{ background: modeFilter === "FIDELITY" ? "rgba(34, 197, 94, 0.2)" : "transparent", color: modeFilter === "FIDELITY" ? "#4ade80" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🛡️ Fidelidad</button>
                    <button onClick={() => setModeFilter("LEAKAGE")} aria-pressed={modeFilter === "LEAKAGE"} style={{ background: modeFilter === "LEAKAGE" ? "rgba(239, 68, 68, 0.2)" : "transparent", color: modeFilter === "LEAKAGE" ? "#f87171" : "#94a3b8", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>💸 Transvase</button>
                  </div>

                  <div style={{ position: "relative", minWidth: 220 }}>
                    <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <label htmlFor="party-search" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                      Buscar partido
                    </label>
                    <input
                      id="party-search"
                      type="text"
                      placeholder="Buscar partido..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px 6px 32px", fontSize: 12, color: "#f8fafc", outline: "none", width: "100%"
                      }}
                    />
                  </div>
                </div>
              </div>

              {filteredData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16, marginBottom: 20 }}>
                  <p style={{ margin: "0 0 12px 0" }}>Ningún movimiento de voto coincide con los filtros seleccionados.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(129, 140, 248, 0.15)", border: "1px solid rgba(129, 140, 248, 0.3)",
                        borderRadius: 10, padding: "6px 14px", color: "#818cf8", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      <RotateCcw size={13} /> Restablecer filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Diagrama de Flujo (Sankey Recalculado) */}
                  <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={16} style={{ color: "#818cf8" }} /> Diagrama Sankey
                      </h3>
                      <button
                        onClick={handleExportPNG}
                        disabled={isExporting}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          color: "#94a3b8",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: isExporting ? "not-allowed" : "pointer",
                          opacity: isExporting ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <ImageIcon size={12} /> {isExporting ? "Generando…" : "Guardar PNG"}
                      </button>
                    </div>

                    <SankeyChart
                      data={filteredData}
                      getPartyColor={getPartyColor}
                      getPartyLogo={getPartyLogo}
                      getPartyDisplayName={getPartyDisplayName}
                      hoveredNode={hoveredNode}
                      setHoveredNode={setHoveredNode}
                      svgRef={sankeyRef}
                    />
                  </div>

                  {/* Tabla Detallada */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                        Detalle Numérico ({filteredData.length} resultados)
                      </h3>

                      {totalPages > 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>Página {currentPage} de {totalPages}</span>
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 4, color: "#fff", opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            aria-label="Página siguiente"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 4, color: "#fff", opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "rgba(255,255,255,0.01)" }}>
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <th scope="col" style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8" }}>Origen</th>
                            <th scope="col" style={{ width: 30 }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Dirección</span></th>
                            <th scope="col" style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8" }}>Destino</th>
                            <th scope="col" style={{ padding: "10px 14px", textAlign: "right", color: "#94a3b8" }}>Votos Transferidos</th>
                            <th scope="col" style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", minWidth: 180 }}>Porcentaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((row, idx) => {
                            const isFidelidad = row.origen_partido === row.destino_partido;
                            const pctNorm = Math.min((row.porcentaje / maxPorcentaje) * 100, 100);
                            return (
                              <tr key={`${row.origen_partido}-${row.destino_partido}-${idx}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <td style={{ padding: "10px 14px" }}><PartyBadge party={row.origen_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} /></td>
                                <td style={{ textAlign: "center", color: isFidelidad ? "#4ade80" : "#64748b" }}><ArrowRight size={14} /></td>
                                <td style={{ padding: "10px 14px" }}><PartyBadge party={row.destino_partido} getColor={getPartyColor} getLogo={getPartyLogo} getDisplayName={getPartyDisplayName} /></td>
                                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#f8fafc" }}>{row.votos_transferidos.toLocaleString("es-ES")}</td>
                                <td style={{ padding: "10px 14px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${pctNorm}%`, background: isFidelidad ? "#4ade80" : getPartyColor(row.origen_partido), borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: isFidelidad ? "#4ade80" : "#f8fafc", minWidth: 45, textAlign: "right" }}>{row.porcentaje.toFixed(2)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              No hay datos de transferencia de voto disponibles todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartyBadge({ party, getColor, getLogo, getDisplayName }: { party: string; getColor: (p: string) => string; getLogo: (p: string) => string | null; getDisplayName: (p: string) => string }) {
  const color = getColor(party);
  const logo = getLogo(party);
  const displayName = getDisplayName(party);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: `${color}18`, border: `1px solid ${color}40`, color: "#fff", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {logo ? (
        <img
          src={logo}
          alt=""
          style={{ width: 15, height: 15, borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => {
            // Si el logo falla al cargar, se oculta para no dejar un icono roto
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      )}
      {displayName}
    </span>
  );
}

// ==========================================
// SANKEY ENGINE (FIDELIDAD DE IZQUIERDA A DERECHA)
// ==========================================
interface SankeyLink {
  id: string;
  gradientId: string;
  data: TransferenciaVotoData;
  path: string;
  avgThickness: number;
  isFidelity: boolean;
  colorOrigen: string;
  colorDestino: string;
}

interface SankeyNodePos {
  y: number;
  height: number;
  total: number;
}

// Anchura mínima visible (en px) para que un flujo pequeño no desaparezca del todo.
const MIN_RIBBON_THICKNESS = 2.5;

// Reparte el alto de cada nodo entre sus enlaces de forma proporcional a sus votos.
// Aplica un grosor mínimo visible, pero si la suma de mínimos supera la altura del
// nodo, reescala TODOS los enlaces de ese nodo para que quepan exactamente dentro
// de él — así ningún flujo se sale del rectángulo de su partido ni queda tapado
// por el nodo vecino.
function distributeThickness(
  groups: Map<string, number[]>,
  nodes: Record<string, SankeyNodePos>,
  votesByIndex: number[]
): { thickness: Record<number, number>; offset: Record<number, number> } {
  const thickness: Record<number, number> = {};
  const offset: Record<number, number> = {};

  groups.forEach((indices, key) => {
    const node = nodes[key];
    if (!node) return;

    const raw = indices.map((i) =>
      Math.max((votesByIndex[i] / (node.total || 1)) * node.height, MIN_RIBBON_THICKNESS)
    );
    const sum = raw.reduce((a, b) => a + b, 0);
    const scale = sum > node.height && sum > 0 ? node.height / sum : 1;

    let cursor = 0;
    indices.forEach((i, idx) => {
      const t = raw[idx] * scale;
      thickness[i] = t;
      offset[i] = cursor;
      cursor += t;
    });
  });

  return { thickness, offset };
}

interface SankeyChartProps {
  data: TransferenciaVotoData[];
  getPartyColor: (party: string) => string;
  getPartyLogo: (party: string) => string | null;
  getPartyDisplayName: (party: string) => string;
  hoveredNode: string | null;
  setHoveredNode: (node: string | null) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function SankeyChart({
  data,
  getPartyColor,
  getPartyLogo,
  getPartyDisplayName,
  hoveredNode,
  setHoveredNode,
  svgRef,
}: SankeyChartProps) {
  const [activeLink, setActiveLink] = useState<TransferenciaVotoData | null>(null);
  const [linkTooltip, setLinkTooltip] = useState<{ link: TransferenciaVotoData; x: number; y: number } | null>(null);

  const layout = useMemo(() => {
    if (!data || data.length === 0) return null;

    const width = 950;
    const nodeWidth = 20;
    const paddingX = 180;
    const leftX = paddingX;
    const rightX = width - paddingX;

    const origenesSet = new Set<string>();
    const destinosSet = new Set<string>();
    const origenesTotales: Record<string, number> = {};
    const destinosTotales: Record<string, number> = {};
    let totalVotosGlobal = 0;

    data.forEach((d) => {
      const orig = normalizeParty(d.origen_partido);
      const dest = normalizeParty(d.destino_partido);

      origenesSet.add(orig);
      destinosSet.add(dest);

      origenesTotales[orig] = (origenesTotales[orig] || 0) + d.votos_transferidos;
      destinosTotales[dest] = (destinosTotales[dest] || 0) + d.votos_transferidos;
      totalVotosGlobal += d.votos_transferidos;
    });

    const listOrigenes = Array.from(origenesSet);
    const listDestinos = Array.from(destinosSet);

    const gap = 20;
    const topMargin = 35;
    const minNodeHeight = 20;

    const maxItems = Math.max(listOrigenes.length, listDestinos.length);
    const calculatedHeight = Math.max(maxItems * 50 + topMargin * 2, 360);
    const usableHeight = Math.max(
      calculatedHeight - topMargin * 2 - (maxItems - 1) * gap,
      minNodeHeight
    );

    // Nodos Izquierda (Origen)
    let curYLeft = topMargin;
    const origNodes: Record<string, SankeyNodePos> = {};
    listOrigenes.forEach((orig) => {
      const h = Math.max((origenesTotales[orig] / (totalVotosGlobal || 1)) * usableHeight, minNodeHeight);
      origNodes[orig] = { y: curYLeft, height: h, total: origenesTotales[orig] };
      curYLeft += h + gap;
    });

    // Nodos Derecha (Destino)
    let curYRight = topMargin;
    const destNodes: Record<string, SankeyNodePos> = {};
    listDestinos.forEach((dest) => {
      const h = Math.max((destinosTotales[dest] / (totalVotosGlobal || 1)) * usableHeight, minNodeHeight);
      destNodes[dest] = { y: curYRight, height: h, total: destinosTotales[dest] };
      curYRight += h + gap;
    });

    // Agrupamos los índices de enlaces por nodo de origen y por nodo de destino,
    // para poder repartir el alto disponible de cada nodo entre sus enlaces sin
    // que la suma de anchuras supere nunca la altura del propio nodo.
    const votesByIndex = data.map((d) => d.votos_transferidos);
    const origGroups = new Map<string, number[]>();
    const destGroups = new Map<string, number[]>();
    data.forEach((d, i) => {
      const origKey = normalizeParty(d.origen_partido);
      const destKey = normalizeParty(d.destino_partido);
      if (!origGroups.has(origKey)) origGroups.set(origKey, []);
      if (!destGroups.has(destKey)) destGroups.set(destKey, []);
      origGroups.get(origKey)!.push(i);
      destGroups.get(destKey)!.push(i);
    });

    const origDist = distributeThickness(origGroups, origNodes, votesByIndex);
    const destDist = distributeThickness(destGroups, destNodes, votesByIndex);

    // Construcción de enlaces como cintas (ribbons): cada una ocupa exactamente
    // el tramo que le corresponde en su nodo de origen y en su nodo de destino,
    // así que nunca se sale del rectángulo del partido ni queda oculta bajo él.
    const computedLinks: SankeyLink[] = data
      .map((d, index): SankeyLink | null => {
        const origKey = normalizeParty(d.origen_partido);
        const destKey = normalizeParty(d.destino_partido);

        const oNode = origNodes[origKey];
        const dNode = destNodes[destKey];

        if (!oNode || !dNode) return null;

        const isFidelity = origKey === destKey;

        const oThick = origDist.thickness[index] ?? MIN_RIBBON_THICKNESS;
        const oOffset = origDist.offset[index] ?? 0;
        const dThick = destDist.thickness[index] ?? MIN_RIBBON_THICKNESS;
        const dOffset = destDist.offset[index] ?? 0;

        const y1Top = oNode.y + oOffset;
        const y1Bottom = y1Top + oThick;
        const y2Top = dNode.y + dOffset;
        const y2Bottom = y2Top + dThick;

        const x1 = leftX + nodeWidth;
        const x2 = rightX;
        const mx = (x1 + x2) / 2;

        const path = [
          `M ${x1} ${y1Top}`,
          `C ${mx} ${y1Top}, ${mx} ${y2Top}, ${x2} ${y2Top}`,
          `L ${x2} ${y2Bottom}`,
          `C ${mx} ${y2Bottom}, ${mx} ${y1Bottom}, ${x1} ${y1Bottom}`,
          "Z",
        ].join(" ");

        // ID seguro para los gradientes SVG
        const safeOrig = origKey.replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDest = destKey.replace(/[^a-zA-Z0-9_-]/g, "_");
        const gradientId = `grad-${safeOrig}-${safeDest}-${index}`;

        return {
          id: `link-${index}`,
          gradientId,
          data: d,
          path,
          avgThickness: (oThick + dThick) / 2,
          isFidelity,
          colorOrigen: getPartyColor(origKey),
          colorDestino: getPartyColor(destKey),
        };
      })
      .filter((link): link is SankeyLink => link !== null)
      .sort((a, b) => {
        // Los flujos no-fidelidad se dibujan primero (más gruesos primero para
        // que los delgados no queden ocultos); los de fidelidad siempre encima.
        if (a.isFidelity !== b.isFidelity) return a.isFidelity ? 1 : -1;
        return b.avgThickness - a.avgThickness;
      });

    return {
      width,
      height: Math.max(curYLeft, curYRight) + topMargin,
      leftX,
      rightX,
      nodeWidth,
      origNodes,
      destNodes,
      links: computedLinks,
    };
  }, [data, getPartyColor]);

  if (!layout) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Sin datos suficientes para generar el gráfico.</div>;
  }

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label="Diagrama de flujo de transferencia de voto entre partidos"
      >
        <title>Diagrama Sankey de transferencia de voto</title>
        <defs>
          {layout.links.map((link) => (
            <linearGradient key={link.gradientId} id={link.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={link.colorOrigen} stopOpacity={link.isFidelity ? "0.9" : "0.75"} />
              <stop offset="100%" stopColor={link.isFidelity ? link.colorOrigen : link.colorDestino} stopOpacity={link.isFidelity ? "0.9" : "0.75"} />
            </linearGradient>
          ))}
        </defs>

        {/* Flujos */}
        {layout.links.map((link) => {
          const isHighlighted =
            hoveredNode === link.data.origen_partido ||
            hoveredNode === link.data.destino_partido ||
            (activeLink?.origen_partido === link.data.origen_partido && activeLink?.destino_partido === link.data.destino_partido);

          return (
            <path
              key={link.id}
              d={link.path}
              fill={`url(#${link.gradientId})`}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={0.5}
              fillOpacity={
                hoveredNode || activeLink
                  ? isHighlighted ? 1 : 0.1
                  : link.isFidelity ? 0.95 : 0.75
              }
              style={{ transition: "fill-opacity 0.2s ease", cursor: "pointer" }}
              onMouseEnter={(event) => {
                setActiveLink(link.data);
                const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                setLinkTooltip({ link: link.data, x: event.clientX - (rect?.left || 0), y: event.clientY - (rect?.top || 0) });
              }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                setLinkTooltip({ link: link.data, x: event.clientX - (rect?.left || 0), y: event.clientY - (rect?.top || 0) });
              }}
              onMouseLeave={() => { setActiveLink(null); setLinkTooltip(null); }}
              onFocus={() => { setActiveLink(link.data); setLinkTooltip({ link: link.data, x: layout.width / 2, y: layout.height / 2 }); }}
              onBlur={() => { setActiveLink(null); setLinkTooltip(null); }}
              tabIndex={0}
              role="img"
              aria-label={`${getPartyDisplayName(link.data.origen_partido)} a ${getPartyDisplayName(link.data.destino_partido)}: ${link.data.votos_transferidos.toLocaleString("es-ES")} votos, ${link.data.porcentaje.toFixed(2)}%`}
            />
          );
        })}

        {/* Nodos Origen (Izquierda) */}
        {Object.entries(layout.origNodes).map(([party, pos]) => {
          const logo = getPartyLogo(party);
          return (
            <g key={`orig-${party}`} onMouseEnter={() => setHoveredNode(party)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
              <rect
                x={layout.leftX}
                y={pos.y}
                width={layout.nodeWidth}
                height={pos.height}
                rx={4}
                fill={getPartyColor(party)}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              {logo && (
                <image
                  href={logo}
                  x={layout.leftX - 34}
                  y={pos.y + pos.height / 2 - 9}
                  width={18}
                  height={18}
                  clipPath="circle(9px at 9px 9px)"
                  onError={(e) => {
                    (e.currentTarget as unknown as SVGImageElement).style.display = "none";
                  }}
                />
              )}
              <text x={layout.leftX - (logo ? 40 : 10)} y={pos.y + pos.height / 2 + 4} textAnchor="end" fill="#f8fafc" fontSize={12} fontWeight={700}>
                {getPartyDisplayName(party)}
              </text>
            </g>
          );
        })}

        {/* Nodos Destino (Derecha) */}
        {Object.entries(layout.destNodes).map(([party, pos]) => {
          const logo = getPartyLogo(party);
          return (
            <g key={`dest-${party}`} onMouseEnter={() => setHoveredNode(party)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
              <rect
                x={layout.rightX}
                y={pos.y}
                width={layout.nodeWidth}
                height={pos.height}
                rx={4}
                fill={getPartyColor(party)}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              {logo && (
                <image
                  href={logo}
                  x={layout.rightX + layout.nodeWidth + 16}
                  y={pos.y + pos.height / 2 - 9}
                  width={18}
                  height={18}
                  clipPath="circle(9px at 9px 9px)"
                  onError={(e) => {
                    (e.currentTarget as unknown as SVGImageElement).style.display = "none";
                  }}
                />
              )}
              <text x={layout.rightX + layout.nodeWidth + (logo ? 40 : 10)} y={pos.y + pos.height / 2 + 4} textAnchor="start" fill="#f8fafc" fontSize={12} fontWeight={700}>
                {getPartyDisplayName(party)}
              </text>
            </g>
          );
        })}
      </svg>

      {linkTooltip && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: linkTooltip.x,
            top: linkTooltip.y,
            transform: "translate(14px, -112%)",
            minWidth: 190,
            background: "rgba(7, 10, 18, 0.97)",
            border: `1px solid ${getPartyColor(linkTooltip.link.origen_partido)}`,
            borderRadius: 10,
            padding: "10px 12px",
            zIndex: 10,
            boxShadow: "0 14px 30px rgba(0,0,0,0.48)",
            color: "#f8fafc",
            fontSize: 11,
            pointerEvents: "none",
          }}
        >
          <div style={{ color: "#a5b4fc", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>Transferencia de voto</div>
          <div style={{ marginTop: 4, fontWeight: 800 }}>{getPartyDisplayName(linkTooltip.link.origen_partido)} <span style={{ color: "#94a3b8" }}>→</span> {getPartyDisplayName(linkTooltip.link.destino_partido)}</div>
          <div style={{ marginTop: 7, display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "#cbd5e1" }}>Votos</span><strong>{linkTooltip.link.votos_transferidos.toLocaleString("es-ES")}</strong></div>
          <div style={{ marginTop: 3, display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "#cbd5e1" }}>Porcentaje</span><strong style={{ color: getPartyColor(linkTooltip.link.origen_partido) }}>{linkTooltip.link.porcentaje.toFixed(2)}%</strong></div>
        </div>
      )}
    </div>
  );
}
