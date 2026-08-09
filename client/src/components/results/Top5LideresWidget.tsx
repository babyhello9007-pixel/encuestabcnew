import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Star, Crown, TrendingUp } from "lucide-react";

interface PartyBadge {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

interface TopLider {
  leader_name: string;
  media_valoracion: number;
  total_valoraciones: number;
  photo_url: string;
  parties: PartyBadge[];
  primary_color: string;
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

export function Top5LideresWidget() {
  const [lideres, setLideres] = useState<TopLider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTop5 = useCallback(async () => {
    try {
      setLoading(true);

      const [mediaRes, leadersRes] = await Promise.all([
        supabase
          .from("media_valoraciones_lideres")
          .select("*"),
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

      // Mapa para obtener metadatos rápidamente
      const leadersMap = new Map<string, PartyLeaderRow>();
      leadersData.forEach((leader) => {
        const key = `${leader.party_key}_${leader.leader_name}`;
        leadersMap.set(key, leader);
      });

      // Agrupación por nombre de líder
      const groupedMap = new Map<
        string,
        {
          totalPuntosPonderados: number;
          totalVotos: number;
          photo_url: string;
          partiesMap: Map<string, PartyBadge>;
        }
      >();

      mediaData.forEach((media) => {
        const leaderName = media.leader_name.trim();
        const key = `${media.party_key}_${media.leader_name}`;
        const leaderInfo = leadersMap.get(key);

        const votos = media.total_valoraciones ?? 0;
        const mediaVal = media.media_valoracion ?? 0;

        if (!groupedMap.has(leaderName)) {
          groupedMap.set(leaderName, {
            totalPuntosPonderados: 0,
            totalVotos: 0,
            photo_url: leaderInfo?.photo_url || "",
            partiesMap: new Map(),
          });
        }

        const currentGroup = groupedMap.get(leaderName)!;

        // Suma ponderada de puntos
        currentGroup.totalPuntosPonderados += mediaVal * votos;
        currentGroup.totalVotos += votos;

        // Conservar imagen válida
        if (!currentGroup.photo_url && leaderInfo?.photo_url) {
          currentGroup.photo_url = leaderInfo.photo_url;
        }

        // Registrar partido asociado
        const partyKey = media.party_key;
        if (!currentGroup.partiesMap.has(partyKey)) {
          currentGroup.partiesMap.set(partyKey, {
            party_key: partyKey,
            display_name: leaderInfo?.party_configuration?.display_name || partyKey,
            color: leaderInfo?.party_configuration?.color || "#6366f1",
            logo_url: leaderInfo?.party_configuration?.logo_url || "",
          });
        }
      });

      // Construcción y cálculo de medias ponderadas
      const combined: TopLider[] = Array.from(groupedMap.entries())
        .map(([leader_name, data]) => {
          const parties = Array.from(data.partiesMap.values());
          const mediaPonderada =
            data.totalVotos > 0 ? data.totalPuntosPonderados / data.totalVotos : 0;

          return {
            leader_name,
            media_valoracion: Math.round(mediaPonderada * 10) / 10,
            total_valoraciones: data.totalVotos,
            photo_url: data.photo_url,
            parties,
            primary_color: parties[0]?.color || "#6366f1",
          };
        })
        .sort((a, b) => b.media_valoracion - a.media_valoracion)
        .slice(0, 5);

      setLideres(combined);
    } catch (err) {
      console.error("Error fetching top 5 leaders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTop5();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("top5_lideres")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "valoraciones_lideres",
        },
        () => {
          fetchTop5();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTop5]);

  if (loading || lideres.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 liquid-glass p-6 rounded-2xl border border-white/10">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-[#2D2D2D]">Top 5 Líderes Valorados</h3>
        <TrendingUp className="w-5 h-5 text-[#C41E3A] ml-auto" />
      </div>

      {/* Grid de top 5 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lideres.map((lider, index) => (
          <div
            key={lider.leader_name}
            className={`frosted-glass p-4 rounded-xl border-2 transition text-center ${
              index === 0
                ? "border-yellow-400 ring-2 ring-yellow-400/20 md:col-span-2 md:row-span-2"
                : "border-white/10"
            }`}
          >
            {/* Posición */}
            <div
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm mb-2 ${
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
            <h4 className={`font-bold text-[#2D2D2D] ${index === 0 ? "text-base" : "text-sm"}`}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
