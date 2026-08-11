import { useEffect, useState, useCallback, useRef } from "react";
import { Star, Crown, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
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
  const Icon = isNew ? Minus : isUp ? ArrowUp : ArrowDown;
  const label = isNew ? "Nuevo" : `${isUp ? "+" : "−"}${Math.abs(indicator.delta)}`;

  return (
    <span
      title={isNew ? "Líder incorporado desde la última actualización" : `${isUp ? "Sube" : "Baja"} ${Math.abs(indicator.delta)} posiciones`}
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold ${
        isNew
          ? "bg-slate-100 text-slate-600"
          : isUp
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
      }`}
    >
      <Icon className="h-3 w-3" /> {label}
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
    <div className="mb-8 liquid-glass p-6 rounded-2xl border border-white/10">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top 5 Líderes Valorados</h3>
        <TrendingUp className="w-5 h-5 text-[#C41E3A] ml-auto" />
      </div>

      {/* Grid de top 5 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lideres.map((lider, index) => (
          <button
            type="button"
            key={lider.leader_name}
            onClick={() => setSelectedLeader(lider)}
            title={`Ver desglose de valoraciones de ${lider.leader_name}`}
            aria-label={`Abrir desglose de valoraciones de ${lider.leader_name}`}
            className={`frosted-glass p-4 rounded-xl border-2 transition text-center cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 ${
              index === 0
                ? "border-yellow-400 ring-2 ring-yellow-400/20 md:col-span-2 md:row-span-2"
                : "border-white/10"
            }`}
          >
            {/* Posición y evolución */}
            <div className="mb-3 flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm ${
                  index === 0
                    ? "bg-yellow-400"
                    : index === 1
                      ? "bg-gray-300 text-gray-800"
                      : index === 2
                        ? "bg-orange-600"
                        : "bg-slate-600"
                }`}
              >
                {index + 1}
              </span>
              <MovementBadge indicator={positionIndicators[lider.leader_name.trim().toLocaleLowerCase()]} />
            </div>

            {/* Foto */}
            {lider.photo_url && (
              <div className={`mb-3 rounded-lg overflow-hidden ${index === 0 ? "h-32" : "h-20"}`}>
                <img
                  src={lider.photo_url}
                  alt={lider.leader_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Nombre */}
            <h4 className={`font-bold text-gray-900 dark:text-white ${index === 0 ? "text-base" : "text-sm"}`}>
              {lider.leader_name}
            </h4>

            {/* Partidos */}
            <div className="flex flex-wrap justify-center gap-1 mb-2 mt-1">
              {lider.parties.map((party) => (
                <div key={party.party_key} className="flex items-center gap-0.5">
                  {party.logo_url && (
                    <img
                      src={party.logo_url}
                      alt={party.display_name}
                      className="w-4 h-4 rounded"
                      title={party.display_name}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Valoración */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <span
                  className={`font-bold ${index === 0 ? "text-2xl" : "text-lg"}`}
                  style={{ color: lider.primary_color }}
                >
                  {lider.media_valoracion.toFixed(1)}
                </span>
                <span className="text-xs text-[#999999]">/10</span>
              </div>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${index === 0 ? "w-4 h-4" : "w-3 h-3"} ${
                      i < Math.round(lider.media_valoracion / 2)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[#999999] ${index === 0 ? "text-xs" : "text-[10px]"}`}>
                {lider.total_valoraciones} votos
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
    <LeaderRatingBreakdownModal
      leader={selectedLeader}
      onClose={() => setSelectedLeader(null)}
    />
    </>
  );
}
