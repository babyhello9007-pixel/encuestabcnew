import { useState, useEffect, useCallback, useRef } from "react";
import { Crown, TrendingUp } from "lucide-react";
import {
  fetchLeaderRanking,
  subscribeToLeaderRatings,
  type LiderRanking,
} from "@/lib/leaderRanking";
import { compareLeaderPositions, type PositionIndicator } from "@/lib/leaderPosition";
import { LeaderRatingBreakdownModal } from "@/components/results/LeaderRatingBreakdownModal";

function MovementBadge({ indicator }: { indicator?: PositionIndicator }) {
  if (!indicator || indicator.movement === "same") return null;

  const isUp = indicator.movement === "up";
  const isNew = indicator.movement === "new";
  const label = isNew ? "Nuevo" : `${isUp ? "+" : "−"}${Math.abs(indicator.delta)}`;

  return (
    <span
      title={isNew ? "Líder incorporado" : `${isUp ? "Sube" : "Baja"} ${Math.abs(indicator.delta)}`}
      className={`inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold ${
        isNew
          ? "bg-slate-100 text-slate-600"
          : isUp
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
      }`}
    >
      {label}
    </span>
  );
}

export function Top5LideresWidget() {
  const [lideres, setLideres] = useState<LiderRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<LiderRanking | null>(null);
  const previousRankingRef = useRef<string[]>([]);
  const [positionIndicators, setPositionIndicators] = useState<Record<string, PositionIndicator>>({});

  const fetchTop5 = useCallback(async () => {
    try {
      setLoading(true);
      const ranking = await fetchLeaderRanking();
      const previousRanking = previousRankingRef.current;
      if (previousRanking.length > 0) {
        setPositionIndicators(
          compareLeaderPositions(
            previousRanking,
            ranking.map((leader) => leader.leader_name)
          )
        );
      }
      previousRankingRef.current = ranking.map((leader) => leader.leader_name);
      setLideres(ranking.slice(0, 5));
    } catch (err) {
      console.error("Error fetching top 5 leaders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTop5();

    const unsubscribe = subscribeToLeaderRatings(() => {
      void fetchTop5();
    });

    return unsubscribe;
  }, [fetchTop5]);

  if (loading || lideres.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Encabezado compacto */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Top 5 Líderes (Generales)</h4>
          </div>
          <span className="text-[10px] text-gray-500">Haz clic en cualquier líder para ver su desglose</span>
        </div>

        {/* Grid horizontal compacto de 5 columnas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {lideres.map((lider, index) => (
            <button
              type="button"
              key={lider.leader_name}
              onClick={() => setSelectedLeader(lider)}
              title={`Ver desglose de valoraciones de ${lider.leader_name}`}
              aria-label={`Abrir desglose de valoraciones de ${lider.leader_name}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#C41E3A]/50 hover:shadow transition text-left cursor-pointer group"
            >
              {/* Mini avatar y medalla */}
              <div className="relative flex-shrink-0">
                {lider.photo_url ? (
                  <img
                    src={lider.photo_url}
                    alt={lider.leader_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                    {lider.leader_name.charAt(0)}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white shadow ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-slate-400"
                        : index === 2
                          ? "bg-amber-700"
                          : "bg-slate-600"
                  }`}
                >
                  {index + 1}
                </span>
              </div>

              {/* Info principal compacta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#C41E3A] transition">
                    {lider.leader_name}
                  </span>
                  <MovementBadge indicator={positionIndicators[lider.leader_name.trim().toLocaleLowerCase()]} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-extrabold" style={{ color: lider.primary_color }}>
                    ★ {lider.media_valoracion.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-500">({lider.total_valoraciones || lider.total_votos})</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <LeaderRatingBreakdownModal
        leader={selectedLeader}
        isOpen={!!selectedLeader}
        onClose={() => setSelectedLeader(null)}
      />
    </>
  );
}
