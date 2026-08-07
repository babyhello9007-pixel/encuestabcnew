import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, TrendingUp, Award } from "lucide-react";

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

export function LideresRankingSection() {
  const [lideres, setLideres] = useState<LiderRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLideresRanking = async () => {
      try {
        setLoading(true);

        // Obtener media de valoraciones
        const { data: mediaData, error: mediaError } = await supabase
          .from("media_valoraciones_lideres")
          .select("*")
          .order("media_valoracion", { ascending: false });

        if (mediaError) throw mediaError;

        // Obtener info de líderes y partidos
        const { data: leadersData, error: leadersError } = await supabase
          .from("party_leaders")
          .select(
            `
            party_key,
            leader_name,
            photo_url,
            party_configuration(display_name, color, logo_url)
          `
          )
          .eq("is_active", true);

        if (leadersError) throw leadersError;

        // Combinar datos
        const combined = (mediaData || []).map((media: any) => {
          const leaderInfo = (leadersData || []).find(
            (l: any) =>
              l.party_key === media.party_key &&
              l.leader_name === media.leader_name
          );

          return {
            party_key: media.party_key,
            leader_name: media.leader_name,
            media_valoracion: media.media_valoracion,
            total_valoraciones: media.total_valoraciones,
            display_name:
              leaderInfo?.party_configuration?.display_name || media.party_key,
            color: leaderInfo?.party_configuration?.color || "#818cf8",
            logo_url: leaderInfo?.party_configuration?.logo_url || "",
            photo_url: leaderInfo?.photo_url || "",
          };
        });

        setLideres(combined);
      } catch (err) {
        console.error("Error fetching leaders ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLideresRanking();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
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
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A]"></div>
        <p className="text-[#666666] mt-4">Cargando ranking de líderes...</p>
      </div>
    );
  }

  if (lideres.length === 0) {
    return (
      <div className="text-center py-12 liquid-glass p-8 rounded-2xl">
        <p className="text-[#666666]">
          No hay valoraciones de líderes aún. ¡Sé el primero en valorar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-[#C41E3A]" />
        <h3 className="text-2xl font-bold text-[#2D2D2D]">Ranking de Líderes</h3>
      </div>

      {/* Top 3 Podio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {lideres.slice(0, 3).map((lider, index) => (
          <div
            key={`${lider.party_key}-${lider.leader_name}`}
            className={`frosted-glass p-6 rounded-2xl border-2 transition ${
              index === 0
                ? "border-yellow-400 ring-2 ring-yellow-400/20"
                : index === 1
                  ? "border-gray-300 ring-2 ring-gray-300/20"
                  : "border-orange-600 ring-2 ring-orange-600/20"
            }`}
          >
            {/* Medalla */}
            <div className="text-center mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg ${
                  index === 0
                    ? "bg-yellow-400"
                    : index === 1
                      ? "bg-gray-300 text-gray-800"
                      : "bg-orange-600"
                }`}
              >
                {index + 1}
              </div>
            </div>

            {/* Foto */}
            {lider.photo_url && (
              <div className="mb-4 rounded-xl overflow-hidden h-32">
                <img
                  src={lider.photo_url}
                  alt={lider.leader_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Nombre y partido */}
            <h4 className="font-bold text-[#2D2D2D] text-center mb-1">
              {lider.leader_name}
            </h4>
            <div className="flex items-center justify-center gap-2 mb-3">
              {lider.logo_url && (
                <img
                  src={lider.logo_url}
                  alt={lider.display_name}
                  className="w-5 h-5 rounded"
                />
              )}
              <p className="text-xs text-[#666666]">{lider.display_name}</p>
            </div>

            {/* Valoración */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: lider.color }}
                >
                  {lider.media_valoracion.toFixed(1)}
                </span>
                <span className="text-[#999999]">/10</span>
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(lider.media_valoracion / 2)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#999999]">
                {lider.total_valoraciones} valoraciones
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de ranking completo */}
      <div className="frosted-glass rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#999999] uppercase">
                  Posición
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#999999] uppercase">
                  Líder
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#999900] uppercase">
                  Partido
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#999999] uppercase">
                  Valoración
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#999999] uppercase">
                  Votos
                </th>
              </tr>
            </thead>
            <tbody>
              {lideres.map((lider, index) => (
                <tr
                  key={`${lider.party_key}-${lider.leader_name}`}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3 text-sm font-bold text-[#2D2D2D]">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#2D2D2D]">
                    {lider.leader_name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {lider.logo_url && (
                        <img
                          src={lider.logo_url}
                          alt={lider.display_name}
                          className="w-5 h-5 rounded"
                        />
                      )}
                      <span className="text-[#666666]">{lider.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="font-bold text-lg"
                        style={{ color: lider.color }}
                      >
                        {lider.media_valoracion.toFixed(1)}
                      </span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-[#999999]">
                    {lider.total_valoraciones}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón para valorar */}
      <div className="text-center pt-4">
        <a
          href="/valorar-lideres"
          className="inline-block px-6 py-3 bg-[#C41E3A] hover:bg-[#A01830] text-white rounded-lg font-semibold transition flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Valorar Líderes
        </a>
      </div>
    </div>
  );
}
