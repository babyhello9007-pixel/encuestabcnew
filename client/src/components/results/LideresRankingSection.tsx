import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Star,
  TrendingUp,
  Award,
  RefreshCw,
  Crown,
  Medal,
  Trophy,
  Search,
  User,
  Sparkles,
} from "lucide-react";

interface LiderRanking {
  party_key: string;
  leader_name: string;
  media_valoracion: number;
  total_valoraciones: number;
  display_name: string;
  color: string;
  logo_url: string;
  photo_url: string;
}

interface MediaValoracionRow {
  party_key: string;
  leader_name: string;
  media_valoracion: number;
  total_valoraciones: number;
}

interface PartyLeaderRow {
  party_key: string;
  leader_name: string;
  photo_url: string | null;
  party_configuration: {
    display_name: string;
    color: string;
    logo_url: string;
  } | null;
}

export function LideresRankingSection() {
  const [lideres, setLideres] = useState<LiderRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLideresRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [mediaRes, leadersRes] = await Promise.all([
        supabase
          .from("media_valoraciones_lideres")
          .select("*")
          .order("media_valoracion", { ascending: false }),
        supabase
          .from("party_leaders")
          .select(
            `
            party_key,
            leader_name,
            photo_url,
            party_configuration(display_name, color, logo_url)
          `
          )
          .eq("is_active", true),
      ]);

      if (mediaRes.error) throw mediaRes.error;
      if (leadersRes.error) throw leadersRes.error;

      const mediaData = (mediaRes.data as MediaValoracionRow[]) || [];
      const leadersData = (leadersRes.data as unknown as PartyLeaderRow[]) || [];

      const leadersMap = new Map<string, PartyLeaderRow>();
      leadersData.forEach((leader) => {
        const key = `${leader.party_key}_${leader.leader_name}`;
        leadersMap.set(key, leader);
      });

      const combined: LiderRanking[] = mediaData.map((media) => {
        const key = `${media.party_key}_${media.leader_name}`;
        const leaderInfo = leadersMap.get(key);

        return {
          party_key: media.party_key,
          leader_name: media.leader_name,
          media_valoracion: media.media_valoracion ?? 0,
          total_valoraciones: media.total_valoraciones ?? 0,
          display_name:
            leaderInfo?.party_configuration?.display_name || media.party_key,
          color: leaderInfo?.party_configuration?.color || "#6366f1",
          logo_url: leaderInfo?.party_configuration?.logo_url || "",
          photo_url: leaderInfo?.photo_url || "",
        };
      });

      setLideres(combined);
    } catch (err) {
      console.error("Error fetching leaders ranking:", err);
      setError("No se pudieron cargar los datos del ranking.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLideresRanking();

    const channel = supabase
      .channel("media_valoraciones_lideres")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "valoraciones_lideres",
        },
        () => {
          fetchLideresRanking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLideresRanking]);

  // Reorganizar Top 3 para mostrar en formato podio visual: [2º, 1º, 3º]
  const podiumData = useMemo(() => {
    const top3 = lideres.slice(0, 3);
    if (top3.length < 3) return top3.map((l, i) => ({ ...l, originalIndex: i }));
    return [
      { ...top3[1], originalIndex: 1 }, // 2º Puesto (Izquierda)
      { ...top3[0], originalIndex: 0 }, // 1er Puesto (Centro)
      { ...top3[2], originalIndex: 2 }, // 3er Puesto (Derecha)
    ];
  }, [lideres]);

  // Filtrado de la tabla según el término de búsqueda
  const filteredLideres = useMemo(() => {
    if (!searchQuery.trim()) return lideres;
    const query = searchQuery.toLowerCase();
    return lideres.filter(
      (l) =>
        l.leader_name.toLowerCase().includes(query) ||
        l.display_name.toLowerCase().includes(query)
    );
  }, [lideres, searchQuery]);

  if (loading) {
    return <RankingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-500/5 backdrop-blur-md border border-red-500/20 p-8 rounded-3xl space-y-4 max-w-lg mx-auto">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchLideresRanking}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C41E3A] text-white rounded-xl text-sm font-semibold hover:bg-[#A01830] shadow-lg shadow-red-900/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4 animate-spin-once" /> Reintentar
        </button>
      </div>
    );
  }

  if (lideres.length === 0) {
    return (
      <div className="text-center py-16 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-8 rounded-3xl max-w-lg mx-auto shadow-xl">
        <Sparkles className="w-12 h-12 text-[#C41E3A] mx-auto mb-3 animate-bounce" />
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Aún no hay valoraciones
        </h4>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Sé el primero en valorar a tus líderes políticos y encabezar el ranking.
        </p>
        <a
          href="/valorar-lideres"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-xl font-semibold shadow-lg shadow-red-900/20 transition-all hover:scale-105"
        >
          <TrendingUp className="w-4 h-4" />
          Valorar Líderes
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#C41E3A] to-red-700 text-white shadow-lg shadow-red-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Ranking de Líderes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Valoraciones acumuladas en tiempo real
            </p>
          </div>
        </div>

        <a
          href="/valorar-lideres"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-xl font-semibold text-sm shadow-md shadow-red-900/20 transition-all hover:scale-105 active:scale-95"
        >
          <TrendingUp className="w-4 h-4" />
          Valorar Líderes
        </a>
      </div>

      {/* Podio Destacado (Top 3) */}
      {lideres.length > 0 && (
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {podiumData.map((lider) => (
              <PodioCard
                key={`${lider.party_key}-${lider.leader_name}`}
                lider={lider}
                rank={lider.originalIndex + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección Tabla con Filtro de Búsqueda */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl overflow-hidden transition-all">
        {/* Barra superior de la tabla */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
            Clasificación Completa
          </h4>

          {/* Input Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar líder o partido..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 transition"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 text-center w-20">Posición</th>
                <th className="px-6 py-3.5">Líder</th>
                <th className="px-6 py-3.5">Partido</th>
                <th className="px-6 py-3.5 text-center">Valoración</th>
                <th className="px-6 py-3.5 text-center">Total Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredLideres.length > 0 ? (
                filteredLideres.map((lider, index) => (
                  <RankingRow
                    key={`${lider.party_key}-${lider.leader_name}`}
                    lider={lider}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                    No se encontraron resultados para "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de la tarjeta del Podio
function PodioCard({ lider, rank }: { lider: LiderRanking; rank: number }) {
  const isFirst = rank === 1;

  const cardConfig = {
    1: {
      border: "border-amber-400/80 dark:border-amber-400/60 ring-4 ring-amber-400/15",
      badgeBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-500/30",
      glowBg: "from-amber-500/10 via-transparent to-transparent",
      icon: <Crown className="w-6 h-6 text-amber-400 drop-shadow-md animate-pulse" />,
      height: "md:-translate-y-3",
    },
    2: {
      border: "border-slate-300 dark:border-slate-600 ring-2 ring-slate-300/15",
      badgeBg: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-slate-400/20",
      glowBg: "from-slate-400/5 via-transparent to-transparent",
      icon: <Medal className="w-5 h-5 text-slate-400" />,
      height: "translate-y-0",
    },
    3: {
      border: "border-amber-700/60 dark:border-amber-700/50 ring-2 ring-amber-700/15",
      badgeBg: "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-700/20",
      glowBg: "from-amber-700/5 via-transparent to-transparent",
      icon: <Trophy className="w-5 h-5 text-amber-700" />,
      height: "translate-y-0",
    },
  }[rank as 1 | 2 | 3] || {
    border: "border-gray-200",
    badgeBg: "bg-gray-400",
    glowBg: "",
    icon: null,
    height: "",
  };

  const activeStars = Math.round(lider.media_valoracion / 2);

  return (
    <div
      className={`relative group bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 ${cardConfig.border} ${cardConfig.height}`}
    >
      {/* Fondo con resplandor suave */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${cardConfig.glowBg} rounded-3xl pointer-events-none`}
      />

      {/* Corona o Icono de Medalla flotante superior */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-md border border-gray-100 dark:border-gray-800">
          {cardConfig.icon}
        </div>
      </div>

      {/* Badge con el número de puesto */}
      <div className="text-center mt-2 mb-4">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shadow-md ${cardConfig.badgeBg}`}
        >
          {rank}
        </span>
      </div>

      {/* Avatar / Fotografía del Líder */}
      <div className="relative mx-auto mb-4 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
        {lider.photo_url ? (
          <img
            src={lider.photo_url}
            alt={lider.leader_name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-400">
            <User className="w-12 h-12 opacity-50" />
          </div>
        )}

        {/* Insignia del partido encima de la foto */}
        {lider.logo_url && (
          <div className="absolute bottom-1.5 right-1.5 p-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-md border border-white/20">
            <img
              src={lider.logo_url}
              alt={lider.display_name}
              className="w-4 h-4 object-contain"
            />
          </div>
        )}
      </div>

      {/* Nombre e Información */}
      <div className="text-center mb-4">
        <h4 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">
          {lider.leader_name}
        </h4>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
          {lider.display_name}
        </p>
      </div>

      {/* Puntuación y Estrellas */}
      <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: lider.color }}
          >
            {lider.media_valoracion.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            / 10
          </span>
        </div>

        {/* Estrellas */}
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 transition-colors ${
                i < activeStars
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 dark:text-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Barra de progreso de valoración */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(lider.media_valoracion / 10) * 100}%`,
              backgroundColor: lider.color,
            }}
          />
        </div>

        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 pt-0.5">
          {lider.total_valoraciones.toLocaleString()} votos acumulados
        </p>
      </div>
    </div>
  );
}

// Subcomponente de las filas de la Tabla
function RankingRow({ lider, index }: { lider: LiderRanking; index: number }) {
  const isTop3 = index < 3;

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group">
      {/* Posición */}
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-extrabold text-xs ${
            index === 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              : index === 1
              ? "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
              : index === 2
              ? "bg-amber-900/10 text-amber-800 dark:bg-amber-700/20 dark:text-amber-500"
              : "text-gray-500 dark:text-gray-400 font-semibold"
          }`}
        >
          #{index + 1}
        </span>
      </td>

      {/* Líder (Foto + Nombre) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/50 dark:border-gray-700">
            {lider.photo_url ? (
              <img
                src={lider.photo_url}
                alt={lider.leader_name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm block group-hover:text-[#C41E3A] transition-colors">
              {lider.leader_name}
            </span>
          </div>
        </div>
      </td>

      {/* Partido */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {lider.logo_url && (
            <img
              src={lider.logo_url}
              alt={lider.display_name}
              className="w-4 h-4 object-contain rounded"
            />
          )}
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {lider.display_name}
          </span>
        </div>
      </td>

      {/* Valoración con Bar de Progreso integrada */}
      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="font-extrabold text-base tracking-tight"
              style={{ color: lider.color }}
            >
              {lider.media_valoracion.toFixed(1)}
            </span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(lider.media_valoracion / 10) * 100}%`,
                backgroundColor: lider.color,
              }}
            />
          </div>
        </div>
      </td>

      {/* Votos */}
      <td className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
        {lider.total_valoraciones.toLocaleString()}
      </td>
    </tr>
  );
}

// Skeleton para Carga Gradual (UX)
function RankingSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl"
          />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
