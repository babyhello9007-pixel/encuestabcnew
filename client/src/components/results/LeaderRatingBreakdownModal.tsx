import { useState, useEffect, useMemo } from "react";
import { BarChart3, Clock, Loader2, Star, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { LiderRanking } from "@/lib/leaderRanking";

interface RawRating {
  valoracion: number;
  party_key: string;
  created_at: string | null;
}

interface LeaderRatingBreakdownModalProps {
  leader: LiderRanking | null;
  onClose: () => void;
}

export function LeaderRatingBreakdownModal({
  leader,
  onClose,
}: LeaderRatingBreakdownModalProps) {
  const [ratings, setRatings] = useState<RawRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"distribucion" | "historial">("distribucion");

  useEffect(() => {
    if (!leader) return;

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

    void loadRatings();
    return () => {
      cancelled = true;
    };
  }, [leader]);

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

  if (!leader) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Desglose de valoraciones de ${leader.leader_name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950/95 p-5 text-white shadow-2xl shadow-black/40 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar desglose"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 pr-10">
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
              Historial y Desglose de Valoración
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

        {/* Pestañas de Navegación Modal */}
        <div className="mt-6 flex gap-2 border-b border-white/10 pb-3">
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
            <Clock className="h-3.5 w-3.5" /> Historial Detallado ({ratings.length})
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
          <div className="mt-6 space-y-3">
            <div className="max-h-72 overflow-y-auto pr-2 space-y-2">
              {ratings.length === 0 ? (
                <p className="text-center text-xs text-white/50 py-8">No hay registros detallados en el historial.</p>
              ) : (
                ratings.map((r, i) => (
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
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-white/10 text-white/70">Registrado</span>
                  </div>
                ))
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
