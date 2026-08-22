import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Star, ChevronLeft, Send, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { consolidateLeaders, type ConsolidatedLeader, type LeaderCandidate } from "@/lib/leaderIdentity";

interface PartyConfiguration {
  display_name: string | null;
  color: string | null;
  logo_url: string | null;
}

interface RawPartyLeader {
  id: number;
  party_key: string;
  leader_name: string;
  photo_url: string | null;
  party_configuration: PartyConfiguration | null;
}

type ValoracionMap = Record<string, number>;

export default function ValorarLideres() {
  const [, setLocation] = useLocation();
  const [leaders, setLeaders] = useState<ConsolidatedLeader[]>([]);
  const [valoraciones, setValoraciones] = useState<ValoracionMap>({});
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("party_leaders")
        .select(
          `
          id,
          party_key,
          leader_name,
          photo_url,
          party_configuration!inner(display_name, color, logo_url)
        `
        )
        .eq("is_active", true)
        .order("party_key", { ascending: true });

      if (error) throw error;

      const rawData = (data || []) as unknown as RawPartyLeader[];

      const formattedLeaders: LeaderCandidate[] = rawData.map((item) => ({
        id: item.id,
        party_key: item.party_key,
        leader_name: item.leader_name.trim(),
        photo_url: item.photo_url,
        display_name: item.party_configuration?.display_name || item.party_key,
        color: item.party_configuration?.color || "#818cf8",
        logo_url: item.party_configuration?.logo_url || "",
      }));
      const consolidated = consolidateLeaders(formattedLeaders);

      setLeaders(consolidated);

      // Una persona solo ocupa una tarjeta y una valoración, aunque figure por
      // error o transición organizativa en más de una configuración de partido.
      const initialVals: ValoracionMap = {};
      consolidated.forEach((leader) => {
        initialVals[leader.identity_key] = 0;
      });
      setValoraciones(initialVals);
    } catch (err: any) {
      console.error("Error fetching leaders:", err);
      setErrorMsg("No se pudieron cargar los líderes. Por favor, reinténtalo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRating = (key: string, rating: number) => {
    setValoraciones((prev) => ({
      ...prev,
      [key]: rating,
    }));
  };

  const handleMouseEnter = (key: string, rating: number) => {
    setHoverRatings((prev) => ({ ...prev, [key]: rating }));
  };

  const handleMouseLeave = (key: string) => {
    setHoverRatings((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const respuestaId = crypto.randomUUID();

      const insertData = leaders
        .filter((leader) => {
          const key = leader.identity_key;
          return valoraciones[key] > 0;
        })
        .map((leader) => ({
          respuesta_id: respuestaId,
          party_key: leader.party_key,
          leader_name: leader.leader_name,
          valoracion: valoraciones[leader.identity_key],
        }));

      if (insertData.length === 0) {
        alert("Por favor, valora al menos a un líder antes de enviar.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("valoraciones_lideres")
        .insert(insertData);

      if (error) throw error;

      setSubmitted(true);
      timeoutRef.current = setTimeout(() => {
        setLocation("/resultados");
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting valuations:", err);
      alert("Error al enviar tus valoraciones. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratedCount = Object.values(valoraciones).filter((val) => val > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 text-[#C41E3A] mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Cargando líderes políticos...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white p-4">
        <div className="text-center max-w-md bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Error de conexión</h2>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={fetchLeaders}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#A01830] transition font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white p-4">
        <div className="text-center bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md backdrop-blur-md shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">¡Valoraciones enviadas!</h2>
          <p className="text-gray-400 text-sm mb-6">Muchas gracias por participar en la evaluación.</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#C41E3A]" />
            Redirigiendo a resultados...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-gray-100 flex flex-col selection:bg-[#C41E3A] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#141414]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/resultados")}
              className="p-2 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Valorar Líderes</h1>
          </div>

          {/* Badge del progreso */}
          <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-300">
            Evaluados: <span className="font-bold text-[#C41E3A]">{ratedCount}</span> / {leaders.length}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Banner de Instrucciones */}
        <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-1">
            Evaluación de Líderes Políticos
          </h2>
          <p className="text-gray-400 text-sm">
            Otorga una calificación de <strong>1 a 10</strong> a los líderes que conozcas. Cada persona aparece una sola vez, aunque esté vinculada a varias configuraciones de partido.
          </p>
        </div>

        {/* Grid de Líderes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaders.map((leader) => {
            const key = leader.identity_key;
            const currentRating = valoraciones[key] || 0;
            const activeHover = hoverRatings[key] || 0;
            const displayRating = activeHover || currentRating;

            return (
              <div
                key={key}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado de afiliación */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {leader.affiliations.map((affiliation) => (
                        <span
                          key={affiliation.party_key}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${affiliation.color}20`, color: affiliation.color }}
                          title={affiliation.display_name}
                        >
                          {affiliation.logo_url && <img src={affiliation.logo_url} alt="" className="h-3.5 w-3.5 object-contain" />}
                          <span className="truncate">{affiliation.display_name}</span>
                        </span>
                      ))}
                    </div>

                    {currentRating > 0 && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Valorado
                      </span>
                    )}
                  </div>

                  {/* Foto y Nombre del Líder */}
                  <div className="flex gap-4 items-center mb-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                      <img
                        src={leader.photo_url}
                        alt={leader.leader_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-avatar.png"; }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {leader.leader_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Candidato / Representante
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating interactivo (Puntuación) */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Puntuación:</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: displayRating > 0 ? leader.color : "#9CA3AF" }}
                    >
                      {displayRating > 0 ? `${displayRating} / 10` : "Sin valorar"}
                    </span>
                  </div>

                  {/* Selector rápido de 1 a 10 */}
                  <div className="grid grid-cols-10 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(key, star)}
                        onMouseEnter={() => handleMouseEnter(key, star)}
                        onMouseLeave={() => handleMouseLeave(key)}
                        className={`h-9 rounded-lg flex items-center justify-center transition-all text-xs font-semibold ${
                          star <= displayRating
                            ? "bg-[#C41E3A] text-white shadow-lg shadow-[#C41E3A]/20"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones del Formulario */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end items-center border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => setLocation("/resultados")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition font-medium text-sm"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || ratedCount === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#C41E3A] hover:bg-[#A01830] text-white transition font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C41E3A]/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Valoraciones ({ratedCount})
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
