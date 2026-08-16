import { useState, useEffect, useMemo } from "react";
import { BarChart3, Clock, Loader2, Star, X, Calendar, Download, FileText, HelpCircle, GitCompare, FileSpreadsheet, LineChart as LineChartIcon, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchLeaderRanking, type LiderRanking } from "@/lib/leaderRanking";

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
    if (compareAverage === null || compareAverage === 0) return null;
    const diff = ((leaderAverage - compareAverage) / compareAverage) * 100;
    return diff;
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
    const modalNode = document.getElementById('modal-top5-container');
    if (!modalNode) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(modalNode, { scale: 2, backgroundColor: '#030712', useCORS: true, logging: false });
      const link = document.createElement('a');
      link.download = `ficha-${leader?.leader_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
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

  if (!isOpen || !leader) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Desglose de valoraciones de ${leader.leader_name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div id="modal-top5-container" className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950/95 p-5 text-white shadow-2xl shadow-black/40 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar desglose"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 pr-16">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
            {leader.photo_url ? (
              <img src={leader.photo_url} alt={leader.leader_name} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black text-white/50">
                {leader.leader_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Ficha Analítica e Historial
            </p>
            <h3 className="text-xl font-black tracking-tight sm:text-2xl">{leader.leader_name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {leader.parties.map((party) => (
                <span
                  key={party.party_key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70"
                >
                  {party.logo_url && <img src={party.logo_url} alt="" className="h-3.5 w-3.5 object-contain" />}
                  {party.display_name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de exportación y descarga CSV */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
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
        </div>

        {/* Pestañas de Navegación Modal */}
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-3">
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
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                        className="w-full rounded-md transition-all"
                        style={{ height: `${Math.max(item.count ? item.percentage : 3, 3)}%`, backgroundColor: leader.primary_color }}
                        title={`${item.count} valoraciones de ${item.score}`}
                      />
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
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-sky-300">{leader.leader_name}</span>
                      <span className="font-mono">{leaderAverage.toFixed(2)} / 10</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                      <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${(leaderAverage / 10) * 100}%` }} />
                    </div>
                  </div>

                  {compareLeaderName && compareAverage !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-purple-300">{compareLeaderName}</span>
                        <span className="font-mono">{compareAverage.toFixed(2)} / 10</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                        <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${(compareAverage / 10) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto pr-2 space-y-2">
                  {filteredRatings.length === 0 ? (
                    <p className="text-center text-xs text-white/50 py-8">No hay registros en el rango de fechas seleccionado.</p>
                  ) : (
                    filteredRatings.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
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
