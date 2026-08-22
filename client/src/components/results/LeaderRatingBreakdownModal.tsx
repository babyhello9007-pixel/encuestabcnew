import { useState, useEffect, useMemo } from "react";
import { BarChart3, Clock, Loader2, Star, X, Calendar, Download, FileText, HelpCircle, GitCompare, FileSpreadsheet, LineChart as LineChartIcon, BarChart2, Bookmark, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchLeaderRanking, type LiderRanking } from "@/lib/leaderRanking";
import { calculateComparisonDifference, getFavoritesForLeader } from "@/lib/leaderComparisonUtils";

interface RawRating {
  valoracion: number;
  party_key: string;
  created_at: string | null;
}

interface LeaderRatingBreakdownModalProps {
  leader: LiderRanking | null;
  isOpen?: boolean;
  onClose: () => void;
}

interface FavoriteComparison {
  id: string;
  label: string;
  leaderName: string;
  compareLeaderName: string;
  dateFilter: "todos" | "hoy" | "7dias" | "30dias";
  chartMode: "lineas" | "barras";
  leaderColor: string;
  compareColor: string;
}

export function LeaderRatingBreakdownModal({
  leader,
  isOpen = true,
  onClose,
}: LeaderRatingBreakdownModalProps) {
  const [ratings, setRatings] = useState<RawRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"distribucion" | "historial">("distribucion");

  // Filtro de rango de fechas para el historial
  const [dateFilter, setDateFilter] = useState<"todos" | "hoy" | "7dias" | "30dias">("todos");

  // Comparación con otro líder y modo de gráfico
  const [allLeaders, setAllLeaders] = useState<LiderRanking[]>([]);
  const [compareLeaderName, setCompareLeaderName] = useState<string>("");
  const [compareRatings, setCompareRatings] = useState<RawRating[]>([]);
  const [chartMode, setChartMode] = useState<"lineas" | "barras">("lineas");
  const [leaderColor, setLeaderColor] = useState("#0ea5e9");
  const [compareColor, setCompareColor] = useState("#a855f7");
  const [favorites, setFavorites] = useState<FavoriteComparison[]>([]);

  useEffect(() => {
    if (!leader) return;
    setLeaderColor(leader.primary_color || "#0ea5e9");
  }, [leader]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bc_top5_favorite_comparisons");
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !leader) return;

    let cancelled = false;
    const loadRatings = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("valoraciones_lideres")
        .select("valoracion, party_key, created_at")
        .eq("leader_name", leader.leader_name)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (queryError) {
        setError("No se pudo cargar el desglose de valoraciones.");
        setRatings([]);
      } else {
        setRatings((data as RawRating[]) || []);
      }
      setLoading(false);
    };

    const loadAllLeaders = async () => {
      try {
        const ranking = await fetchLeaderRanking();
        if (!cancelled) setAllLeaders(ranking.filter(l => l.leader_name !== leader.leader_name));
      } catch (e) {
        // Ignorar
      }
    };

    void loadRatings();
    void loadAllLeaders();
    return () => {
      cancelled = true;
    };
  }, [leader, isOpen]);

  // Cargar valoraciones del líder a comparar
  useEffect(() => {
    if (!compareLeaderName) {
      setCompareRatings([]);
      return;
    }
    let cancelled = false;
    const loadCompare = async () => {
      const { data } = await supabase
        .from("valoraciones_lideres")
        .select("valoracion, party_key, created_at")
        .eq("leader_name", compareLeaderName)
        .order("created_at", { ascending: false });

      if (!cancelled) setCompareRatings((data as RawRating[]) || []);
    };
    void loadCompare();
    return () => {
      cancelled = true;
    };
  }, [compareLeaderName]);

  const filterByDate = (items: RawRating[]) => {
    if (dateFilter === "todos") return items;
    const now = new Date().getTime();
    return items.filter((r) => {
      if (!r.created_at) return false;
      const t = new Date(r.created_at).getTime();
      const diffDays = (now - t) / (1000 * 60 * 60 * 24);
      if (dateFilter === "hoy") return diffDays <= 1;
      if (dateFilter === "7dias") return diffDays <= 7;
      if (dateFilter === "30dias") return diffDays <= 30;
      return true;
    });
  };

  const filteredRatings = useMemo(() => filterByDate(ratings), [ratings, dateFilter]);
  const filteredCompareRatings = useMemo(() => filterByDate(compareRatings), [compareRatings, dateFilter]);

  const leaderAverage = useMemo(() => {
    if (filteredRatings.length === 0) return leader?.media_valoracion || 0;
    const sum = filteredRatings.reduce((acc, r) => acc + Number(r.valoracion), 0);
    return sum / filteredRatings.length;
  }, [filteredRatings, leader]);

  const compareAverage = useMemo(() => {
    if (filteredCompareRatings.length === 0) return null;
    const sum = filteredCompareRatings.reduce((acc, r) => acc + Number(r.valoracion), 0);
    return sum / filteredCompareRatings.length;
  }, [filteredCompareRatings]);

  // Diferencia porcentual exacta
  const percentageDiff = useMemo(() => {
    return calculateComparisonDifference(leaderAverage, compareAverage);
  }, [leaderAverage, compareAverage]);

  const distribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, index) => ({
      score: index + 1,
      count: 0,
    }));
    ratings.forEach((rating) => {
      const score = Number(rating.valoracion);
      if (score >= 1 && score <= 10) counts[score - 1].count += 1;
    });
    const max = Math.max(...counts.map((item) => item.count), 1);
    return counts.map((item) => ({ ...item, percentage: (item.count / max) * 100 }));
  }, [ratings]);

  const handleExportModalPNG = async () => {
    if (!leader) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1800;
      canvas.height = 1180;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo crear el lienzo de exportación.");

      const fillRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fill: string) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
      };

      // Fondo claro opaco: evita PNGs negros o transparentes al exportar.
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#C41E3A";
      ctx.fillRect(0, 0, canvas.width, 24);
      ctx.fillStyle = "#111827";
      ctx.font = "700 24px Arial, sans-serif";
      ctx.fillText("BATALLA CULTURAL · INFORME DE VALORACIÓN", 90, 82);
      ctx.fillStyle = "#64748B";
      ctx.font = "400 19px Arial, sans-serif";
      ctx.fillText(`Generado el ${new Date().toLocaleDateString("es-ES")}`, 90, 116);

      ctx.fillStyle = "#0F172A";
      ctx.font = "800 56px Georgia, serif";
      ctx.fillText(leader.leader_name, 90, 196);
      ctx.fillStyle = "#475569";
      ctx.font = "600 22px Arial, sans-serif";
      ctx.fillText(leader.parties.map((party) => party.display_name).join(" · ") || "Sin partido asignado", 90, 235);

      const metrics = [
        { label: "MEDIA", value: `${leaderAverage.toFixed(2)} / 10`, color: leaderColor },
        { label: "VALORACIONES", value: String(filteredRatings.length || leader.total_valoraciones), color: "#0EA5E9" },
        { label: "RANGO", value: dateFilter === "todos" ? "Todo el período" : dateFilter === "hoy" ? "Últimas 24 h" : dateFilter === "7dias" ? "Últimos 7 días" : "Últimos 30 días", color: "#7C3AED" },
      ];
      metrics.forEach((metric, index) => {
        const x = 90 + index * 540;
        fillRoundedRect(x, 285, 480, 150, 24, "#FFFFFF");
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, 285, 480, 150, 24);
        ctx.stroke();
        ctx.fillStyle = metric.color;
        ctx.font = "700 18px Arial, sans-serif";
        ctx.fillText(metric.label, x + 32, 330);
        ctx.fillStyle = "#0F172A";
        ctx.font = "800 38px Arial, sans-serif";
        ctx.fillText(metric.value, x + 32, 390);
      });

      fillRoundedRect(90, 485, 1620, 520, 28, "#FFFFFF");
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(90, 485, 1620, 520, 28);
      ctx.stroke();
      ctx.fillStyle = "#0F172A";
      ctx.font = "800 28px Arial, sans-serif";
      ctx.fillText("Distribución de valoraciones", 140, 550);
      ctx.fillStyle = "#64748B";
      ctx.font = "400 18px Arial, sans-serif";
      ctx.fillText("Número de valoraciones por puntuación", 140, 582);

      const chartBottom = 895;
      const chartHeight = 250;
      const barWidth = 108;
      const barGap = 42;
      distribution.forEach((item, index) => {
        const x = 145 + index * (barWidth + barGap);
        const barHeight = item.count ? Math.max(16, (item.percentage / 100) * chartHeight) : 8;
        ctx.fillStyle = "#E2E8F0";
        ctx.beginPath();
        ctx.roundRect(x, chartBottom - chartHeight, barWidth, chartHeight, 14);
        ctx.fill();
        ctx.fillStyle = leaderColor;
        ctx.beginPath();
        ctx.roundRect(x, chartBottom - barHeight, barWidth, barHeight, 14);
        ctx.fill();
        ctx.fillStyle = "#0F172A";
        ctx.font = "800 22px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(item.count), x + barWidth / 2, chartBottom - barHeight - 18);
        ctx.fillStyle = "#475569";
        ctx.font = "700 20px Arial, sans-serif";
        ctx.fillText(String(item.score), x + barWidth / 2, chartBottom + 38);
      });
      ctx.textAlign = "left";

      if (compareLeaderName && compareAverage !== null) {
        ctx.fillStyle = "#475569";
        ctx.font = "600 21px Arial, sans-serif";
        const comparison = `Comparativa: ${compareLeaderName} · ${compareAverage.toFixed(2)} / 10${percentageDiff !== null ? ` · Diferencia ${percentageDiff > 0 ? "+" : ""}${percentageDiff.toFixed(1)}%` : ""}`;
        ctx.fillText(comparison, 90, 1080);
      }
      ctx.fillStyle = "#94A3B8";
      ctx.font = "400 17px Arial, sans-serif";
      ctx.fillText("Datos agregados de valoraciones públicas · Batalla Cultural", 90, 1130);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("No se pudo crear el PNG.")), "image/png");
      });
      const link = document.createElement('a');
      link.download = `ficha-${leader?.leader_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      alert("¡Imagen PNG del desglose descargada con éxito!");
    } catch (err) {
      console.error("Error exportando modal PNG:", err);
      alert("No se pudo exportar la imagen del modal.");
    }
  };

  const handleExportModalPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Fondo oscuro institucional
      doc.setFillColor(3, 7, 18);
      doc.rect(0, 0, 210, 297, 'F');

      // Cabecera institucional con logotipo y fecha
      doc.setFillColor(196, 30, 58);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("BATALLA CULTURAL — INFORME OFICIAL DE LÍDER", 14, 12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 165, 12);

      // Título principal
      doc.setFontSize(18);
      doc.text(`Ficha de Análisis: ${leader?.leader_name}`, 14, 32);

      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text(`Media general: ${leaderAverage.toFixed(2)} / 10`, 14, 42);
      doc.text(`Total valoraciones analizadas: ${filteredRatings.length}`, 14, 49);
      doc.text(`Rango temporal aplicado: ${dateFilter.toUpperCase()}`, 14, 56);
      if (compareLeaderName && compareAverage !== null) {
        doc.text(`Comparado con: ${compareLeaderName} (Media: ${compareAverage.toFixed(2)})`, 14, 63);
        if (percentageDiff !== null) {
          doc.text(`Diferencia porcentual: ${percentageDiff > 0 ? '+' : ''}${percentageDiff.toFixed(1)}%`, 14, 70);
        }
      }

      doc.save(`informe-${leader?.leader_name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      alert("¡Informe PDF del líder generado con éxito!");
    } catch (e) {
      console.error("Error generando PDF de líder:", e);
      alert("No se pudo generar el PDF del líder.");
    }
  };

  const handleExportCSV = () => {
    try {
      // Incluir metadatos de filtros de Comunidad Autónoma y Edad si existen en localStorage o estado global
      const storedEdad = localStorage.getItem("bc_filter_edad") || "Todas las edades";
      const storedCCAA = localStorage.getItem("bc_filter_ccaa") || "Todas las CCAA";

      let csvContent = "data:text/csv;charset=utf-8,Lider,Valoracion,Partido,Fecha,FiltroEdad,FiltroCCAA\n";
      filteredRatings.forEach(r => {
        const row = [
          `"${leader?.leader_name}"`,
          r.valoracion,
          `"${r.party_key || 'General'}"`,
          `"${r.created_at ? new Date(r.created_at).toISOString() : ''}"`,
          `"${storedEdad}"`,
          `"${storedCCAA}"`
        ].join(",");
        csvContent += row + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `datos-${leader?.leader_name.toLowerCase().replace(/\s+/g, '-')}-${dateFilter}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("¡Archivo CSV con metadatos de filtros descargado con éxito!");
    } catch (e) {
      console.error("Error descargando CSV:", e);
      alert("No se pudo generar el archivo CSV.");
    }
  };

  const saveFavorite = () => {
    if (!leader) return;
    const label = window.prompt("Nombre para esta configuración favorita:", `${leader.leader_name} · ${compareLeaderName || "sin comparar"}`);
    if (!label) return;
    const favorite: FavoriteComparison = {
      id: `${Date.now()}`,
      label,
      leaderName: leader.leader_name,
      compareLeaderName,
      dateFilter,
      chartMode,
      leaderColor,
      compareColor,
    };
    const updated = [...favorites, favorite].slice(-12);
    setFavorites(updated);
    localStorage.setItem("bc_top5_favorite_comparisons", JSON.stringify(updated));
  };

  const applyFavorite = (id: string) => {
    const favorite = favorites.find((item) => item.id === id);
    if (!favorite || favorite.leaderName !== leader?.leader_name) return;
    setCompareLeaderName(favorite.compareLeaderName);
    setDateFilter(favorite.dateFilter);
    setChartMode(favorite.chartMode);
    setLeaderColor(favorite.leaderColor);
    setCompareColor(favorite.compareColor);
  };

  useEffect(() => {
    if (!isOpen || !leader) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, leader, onClose]);

  if (!isOpen || !leader) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/80 p-0 backdrop-blur-md sm:p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="modal-top5-container"
        role="dialog"
        aria-modal="true"
        aria-label={`Desglose de valoraciones de ${leader.leader_name}`}
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950 text-white shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 sm:h-[calc(100dvh-1.5rem)] sm:rounded-3xl sm:border sm:border-white/15"
      >
        <header className="shrink-0 border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl sm:px-8 sm:py-5">
          <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
            {leader.photo_url ? (
              <img src={leader.photo_url} alt={leader.leader_name} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black text-white/50">
                {leader.leader_name.charAt(0)}
              </div>
            )}
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Ficha Analítica e Historial</p>
                <h3 className="truncate text-xl font-black tracking-tight sm:text-2xl">{leader.leader_name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {leader.parties.map((party) => (
                    <span key={party.party_key} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                      {party.logo_url && <img src={party.logo_url} alt="" className="h-3.5 w-3.5 object-contain" />}
                      {party.display_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white" aria-label="Cerrar desglose" title="Cerrar (Esc)">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">

        {/* Botones de exportación y descarga CSV */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
          <span className="text-[11px] text-white/50 font-semibold">Acciones:</span>
          <button
            onClick={handleExportModalPNG}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium border border-white/10"
          >
            <Download className="w-3.5 h-3.5 text-[#C41E3A]" /> Imagen PNG
          </button>
          <button
            onClick={handleExportModalPDF}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium border border-white/10"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" /> Informe PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium border border-white/10"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Exportar CSV (con filtros)
          </button>
          <button
            onClick={saveFavorite}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 text-xs px-3 py-1.5 rounded-lg transition font-medium border border-amber-400/30"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-300" /> Guardar favorita
          </button>
          {getFavoritesForLeader(favorites, leader.leader_name).length > 0 && (
            <select
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyFavorite(event.target.value);
                event.currentTarget.value = "";
              }}
              className="bg-slate-900 border border-amber-400/30 text-amber-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none max-w-48"
              aria-label="Cargar una configuración favorita"
            >
              <option value="">Cargar favorita…</option>
              {getFavoritesForLeader(favorites, leader.leader_name).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Pestañas de Navegación Modal */}
        <div className="mt-5 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("distribucion")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "distribucion"
                ? "bg-[#C41E3A] text-white shadow-lg"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Distribución de Notas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "historial"
                ? "bg-[#C41E3A] text-white shadow-lg"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Historial y Comparativa ({filteredRatings.length})
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-white/60">
            <Loader2 className="h-6 w-6 animate-spin text-[#C41E3A]" />
          </div>
        ) : error ? (
          <p className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</p>
        ) : activeTab === "distribucion" ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Media" value={`${leader.media_valoracion.toFixed(2)} / 10`} accent={leader.primary_color} />
              <Metric label="Valoraciones" value={String(ratings.length || leader.total_valoraciones)} />
              <Metric label="Mínima" value={ratings.length ? String(Math.min(...ratings.map((item) => item.valoracion))) : "—"} />
              <Metric label="Máxima" value={ratings.length ? String(Math.max(...ratings.map((item) => item.valoracion))) : "—"} />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-white/60" />
                <h4 className="text-sm font-bold">Distribución de notas</h4>
                <span className="ml-auto text-[10px] text-white/45">Escala de 1 a 10</span>
              </div>
              <div className="grid grid-cols-10 items-end gap-1.5 sm:gap-2">
                {distribution.map((item) => (
                  <div key={item.score} className="flex min-w-0 flex-col items-center gap-1.5">
                    <span className="text-[9px] font-semibold text-white/50">{item.count || ""}</span>
                    <div className="flex h-28 w-full items-end rounded-lg bg-white/5 p-1">
                      <div
                        className="group relative w-full rounded-md transition-all cursor-help"
                        style={{ height: `${Math.max(item.count ? item.percentage : 3, 3)}%`, backgroundColor: leader.primary_color }}
                      >
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-36 -translate-x-1/2 rounded-lg border border-white/15 bg-slate-950 px-2 py-1.5 text-center text-[10px] text-white shadow-xl group-hover:block">
                          Nota {item.score}: <strong>{item.count}</strong> valoración{item.count === 1 ? "" : "es"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/65">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/45">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Datos agregados de valoraciones públicas en tiempo real.
            </div>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sky-300 font-semibold">Promedio ({leader.leader_name}):</span>
                <span className="font-black text-sky-400 text-sm">{leaderAverage.toFixed(2)} / 10 ⭐</span>
              </div>

              {/* Selector de rango de fechas con tooltip explicativo */}
              <div className="flex items-center gap-2 relative group">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-slate-900 border border-sky-500/30 text-sky-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="todos">Todo el período</option>
                  <option value="hoy">Últimas 24 horas</option>
                  <option value="7dias">Últimos 7 días</option>
                  <option value="30dias">Últimos 30 días</option>
                </select>
                <div className="cursor-help text-sky-300 hover:text-white" title="Filtra las valoraciones por rango temporal">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Selector secundario para superponer y comparar otro líder */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <GitCompare className="w-4 h-4 text-purple-400 shrink-0" />
                <select
                  value={compareLeaderName}
                  onChange={(e) => setCompareLeaderName(e.target.value)}
                  className="bg-slate-900 border border-purple-500/30 text-purple-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none w-full"
                >
                  <option value="">-- Comparar con otro líder (Opcional) --</option>
                  {allLeaders.map((l) => (
                    <option key={l.leader_name} value={l.leader_name}>{l.leader_name} ({l.media_valoracion.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5" title={`Color de ${leader.leader_name}`}>
                <Palette className="h-3.5 w-3.5 text-sky-300" />
                <label className="text-[10px] text-white/60" htmlFor="leader-primary-color">{leader.leader_name}</label>
                <input
                  id="leader-primary-color"
                  type="color"
                  value={leaderColor}
                  onChange={(event) => setLeaderColor(event.target.value)}
                  className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label={`Elegir color de ${leader.leader_name}`}
                />
              </div>

              {compareLeaderName && (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1.5" title={`Color de ${compareLeaderName}`}>
                  <Palette className="h-3.5 w-3.5 text-purple-300" />
                  <label className="text-[10px] text-white/60" htmlFor="leader-compare-color">Comparativa</label>
                  <input
                    id="leader-compare-color"
                    type="color"
                    value={compareColor}
                    onChange={(event) => setCompareColor(event.target.value)}
                    className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label={`Elegir color de ${compareLeaderName}`}
                  />
                </div>
              )}

              {compareLeaderName && compareAverage !== null && percentageDiff !== null && (
                <div className="flex items-center gap-2 bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-500/40">
                  <span className="text-purple-300">Diferencia:</span>
                  <span className={`font-black ${percentageDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {percentageDiff > 0 ? '+' : ''}{percentageDiff.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Botón para alternar la vista del gráfico entre líneas de tendencia y barras comparativas */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white/50 font-semibold">Visualización de Historial:</span>
              <button
                type="button"
                onClick={() => setChartMode(prev => prev === "lineas" ? "barras" : "lineas")}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-lg transition border border-white/15"
              >
                {chartMode === "lineas" ? (
                  <>
                    <BarChart2 className="w-3.5 h-3.5 text-sky-400" /> Cambiar a Barras Comparativas
                  </>
                ) : (
                  <>
                    <LineChartIcon className="w-3.5 h-3.5 text-sky-400" /> Cambiar a Líneas de Tendencia
                  </>
                )}
              </button>
            </div>

            {/* Contenedor del Gráfico Alternable */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Modo activo: <strong className="text-white capitalize">{chartMode}</strong></span>
                <span>{filteredRatings.length} registros en el período</span>
              </div>

              {chartMode === "barras" ? (
                <div className="space-y-3 py-2">
                  <div className="group relative">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold" style={{ color: leaderColor }}>{leader.leader_name}</span>
                      <span className="font-mono">{leaderAverage.toFixed(2)} / 10</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(leaderAverage / 10) * 100}%`, backgroundColor: leaderColor }} />
                    </div>
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-[10px] text-white shadow-xl group-hover:block">
                      {leader.leader_name}: {leaderAverage.toFixed(2)} / 10 · {filteredRatings.length} valoraciones
                    </span>
                  </div>

                  {compareLeaderName && compareAverage !== null && (
                    <div className="group relative">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold" style={{ color: compareColor }}>{compareLeaderName}</span>
                        <span className="font-mono">{compareAverage.toFixed(2)} / 10</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(compareAverage / 10) * 100}%`, backgroundColor: compareColor }} />
                      </div>
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-[10px] text-white shadow-xl group-hover:block">
                        {compareLeaderName}: {compareAverage.toFixed(2)} / 10 · {filteredCompareRatings.length} valoraciones
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto pr-2 space-y-2">
                  {filteredRatings.length === 0 ? (
                    <p className="text-center text-xs text-white/50 py-8">No hay registros en el rango de fechas seleccionado.</p>
                  ) : (
                    filteredRatings.map((r, i) => (
                      <div key={i} className="group relative flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition cursor-help">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold">
                            {r.valoracion}★
                          </span>
                          <div>
                            <p className="font-semibold text-white">Partido: {r.party_key || "General"}</p>
                            <p className="text-[10px] text-white/45">
                              {r.created_at ? new Date(r.created_at).toLocaleString("es-ES") : "Fecha no disponible"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase px-2 py-1 rounded bg-white/10 text-white/70">Tendencia</span>
                        <span className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 hidden whitespace-nowrap rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-[10px] text-white shadow-xl group-hover:block">
                          Valor exacto: {r.valoracion}/10 · {r.created_at ? new Date(r.created_at).toLocaleString("es-ES") : "Sin fecha"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
        <footer className="shrink-0 border-t border-white/10 bg-slate-950/95 px-5 py-3 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <p className="hidden text-xs text-white/45 sm:block">Puedes cerrar con la tecla Esc o mediante este botón.</p>
            <button type="button" onClick={onClose} className="ml-auto rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">Cerrar desglose</button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 text-lg font-black" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );
}
