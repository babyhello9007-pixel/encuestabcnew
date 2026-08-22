import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { calculateMetricsFromResponses, uniquePartyCandidates, type PartyMetricsData } from "@/lib/partyBreakdownUtils";

interface PartyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyName: string;
  partyType: "general" | "youth";
  accentColor?: string;
  partyLogo?: string;
  partyKey?: string;
}

export function PartyStatsModal({ isOpen, onClose, partyName, partyType, accentColor = "#C41E3A", partyLogo, partyKey }: PartyStatsModalProps) {
  const [metrics, setMetrics] = useState<PartyMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [topLeaders, setTopLeaders] = useState<Array<{ name: string; votes: number; pct: number; photo?: string }>>([]);

  useEffect(() => {
    if (!isOpen || !partyName) return;

    const candidates = uniquePartyCandidates(partyName, partyKey);
    let cancelled = false;

    const fetchTopLeaders = async () => {
      try {
        if (!candidates.length) {
          setTopLeaders([]);
          return;
        }

        const { data, error } = await supabase
          .from("ranking_lideres_por_partido")
          .select("lider_preferido, total_votos, porcentaje")
          .in("partido", candidates)
          .order("total_votos", { ascending: false })
          .limit(3);

        if (cancelled || error || !data?.length) {
          if (error) console.error("Error fetching top leaders:", error);
          setTopLeaders([]);
          return;
        }

        const leaderNames = data.map((row) => row.lider_preferido).filter(Boolean);
        const { data: leaderPhotos } = await supabase
          .from("party_leaders")
          .select("leader_name, photo_url")
          .in("leader_name", leaderNames);

        const photosByName = new Map((leaderPhotos || []).map((leader) => [leader.leader_name, leader.photo_url]));

        if (cancelled) return;
        setTopLeaders(
          data.map((row) => ({
            name: row.lider_preferido,
            votes: Number(row.total_votos || 0),
            pct: Number(row.porcentaje || 0),
            photo: photosByName.get(row.lider_preferido),
          })),
        );
      } catch (err) {
        console.error("Error loading top leaders:", err);
        if (!cancelled) setTopLeaders([]);
      }
    };

    const fetchMetrics = async () => {
      setLoading(true);
      setMetrics(null);
      try {
        const viewName = partyType === "general" 
          ? "edad_ideologia_por_partido" 
          : "edad_ideologia_por_asociacion";
        const searchField = partyType === "general" ? "partido" : "asociacion";

        const { data, error } = await supabase
          .from(viewName)
          .select("edad_promedio, ideologia_promedio, total_votos")
          .in(searchField, candidates)
          .limit(1);

        if (cancelled) return;
        if (!error && data?.[0]) {
          setMetrics({
            edad_promedio: Number.isFinite(Number(data[0].edad_promedio)) ? Number(data[0].edad_promedio) : null,
            ideologia_promedio: Number.isFinite(Number(data[0].ideologia_promedio)) ? Number(data[0].ideologia_promedio) : null,
            total_votos: Number(data[0].total_votos || 0),
          });
          return;
        }

        // La vista puede no estar disponible temporalmente; el fallback consulta las respuestas reales.
        const voteField = partyType === "general" ? "voto_generales" : "voto_asociacion_juvenil";
        const { data: responseRows, error: responseError } = await supabase
          .from("respuestas")
          .select("edad, posicion_ideologica")
          .in(voteField, candidates)
          .limit(10_000);

        if (responseError) console.error("Error cargando respuestas del desglose:", responseError);
        if (!cancelled) setMetrics(calculateMetricsFromResponses(responseRows || []));
      } catch (err) {
        console.error("Error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMetrics();
    fetchTopLeaders();
    return () => { cancelled = true; };
  }, [isOpen, partyName, partyType, partyKey]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 p-0 backdrop-blur-md sm:p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="party-breakdown-title"
        style={{ ["--accent" as any]: accentColor }}
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 shadow-2xl animate-in fade-in zoom-in-95 sm:h-[calc(100dvh-1.5rem)] sm:rounded-3xl sm:border sm:border-white/60"
      >
        {/* Header */}
        <header className="shrink-0 bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--accent),black_22%)] px-5 py-4 sm:px-8 sm:py-5">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Resultados detallados</p>
              <h2 id="party-breakdown-title" className="flex items-center gap-3 truncate text-xl font-bold text-white sm:text-2xl">
                {partyLogo ? <img src={partyLogo} alt="" className="h-8 w-8 shrink-0 rounded-lg bg-white/15 p-1 object-contain" /> : null}
                <span className="truncate">{partyName}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Cerrar desglose"
              title="Cerrar (Esc)"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl space-y-6 p-5 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Perfil de sus votantes</h3>
                  <p className="mt-1 text-sm text-slate-500">Promedios calculados sobre las respuestas disponibles.</p>
                </div>
                {!loading && metrics && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{metrics.total_votos.toLocaleString("es-ES")} votos</span>}
              </div>

              {loading ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--accent)]"></div>
                  <span className="text-sm font-medium">Cargando desglose real…</span>
                </div>
              ) : metrics ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-700">Edad media</label>
                      <span className="text-2xl font-bold text-[var(--accent)]">{metrics.edad_promedio !== null ? `${metrics.edad_promedio.toFixed(1)}` : "—"}</span>
                    </div>
                    <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${metrics.edad_promedio !== null ? Math.min((metrics.edad_promedio / 80) * 100, 100) : 0}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">Años</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-700">Posición ideológica</label>
                      <span className="text-2xl font-bold text-[var(--accent)]">{metrics.ideologia_promedio !== null ? `${metrics.ideologia_promedio.toFixed(1)}/10` : "—"}</span>
                    </div>
                    <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${metrics.ideologia_promedio !== null ? (metrics.ideologia_promedio / 10) * 100 : 0}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500"><span>Izquierda</span><span>Derecha</span></div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-700">Total de votos</p>
                    <p className="mt-2 text-4xl font-bold text-slate-900">{metrics.total_votos.toLocaleString("es-ES")}</p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">Respuestas usadas para calcular este desglose.</p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <p className="font-semibold text-slate-800">Aún no hay respuestas suficientes</p>
                  <p className="mt-1 max-w-md text-sm text-slate-500">Cuando haya datos de edad o posición ideológica para este partido, aparecerán aquí.</p>
                </div>
              )}
            </div>

            {topLeaders.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Preferencias de liderazgo</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Top 3 líderes del partido</h3>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {topLeaders.map((leader, index) => (
                    <article key={leader.name + index} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">#{index + 1}</span>
                      {leader.photo ? <img src={leader.photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">{leader.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{leader.votes.toLocaleString("es-ES")} votos · {leader.pct.toFixed(1)}%</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl justify-end">
            <button onClick={onClose} className="rounded-xl bg-[var(--accent)] px-6 py-2.5 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2">Cerrar desglose</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
