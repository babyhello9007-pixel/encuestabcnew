import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, ChevronLeft, Send, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface Leader {
  id: number;
  party_key: string;
  leader_name: string;
  photo_url: string;
  display_name: string;
  color: string;
  logo_url: string;
}

interface Valoracion {
  [key: string]: number;
}

export default function ValorarLideres() {
  const [, setLocation] = useLocation();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [valoraciones, setValoraciones] = useState<Valoracion>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        setLoading(true);

        // Obtener líderes activos con info del partido
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

        const formattedLeaders = (data || []).map((item: any) => ({
          id: item.id,
          party_key: item.party_key,
          leader_name: item.leader_name,
          photo_url: item.photo_url,
          display_name: item.party_configuration?.display_name || item.party_key,
          color: item.party_configuration?.color || "#818cf8",
          logo_url: item.party_configuration?.logo_url || "",
        }));

        setLeaders(formattedLeaders);

        // Inicializar valoraciones
        const initialVals: Valoracion = {};
        formattedLeaders.forEach((leader: Leader) => {
          initialVals[`${leader.party_key}-${leader.leader_name}`] = 0;
        });
        setValoraciones(initialVals);
      } catch (err) {
        console.error("Error fetching leaders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  const handleRating = (key: string, rating: number) => {
    setValoraciones((prev) => ({
      ...prev,
      [key]: rating,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Generar UUID para respuesta
      const respuestaId = crypto.randomUUID();

      // Preparar datos para insertar
      const insertData = leaders
        .filter((leader) => {
          const key = `${leader.party_key}-${leader.leader_name}`;
          return valoraciones[key] > 0;
        })
        .map((leader) => ({
          respuesta_id: respuestaId,
          party_key: leader.party_key,
          leader_name: leader.leader_name,
          valoracion: valoraciones[`${leader.party_key}-${leader.leader_name}`],
        }));

      if (insertData.length === 0) {
        alert("Por favor, valora al menos un líder");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("valoraciones_lideres")
        .insert(insertData);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setLocation("/resultados");
      }, 2000);
    } catch (err) {
      console.error("Error submitting valuations:", err);
      alert("Error al enviar valoraciones");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-[#C41E3A] mx-auto mb-4" />
          <p className="text-[#2D2D2D]">Cargando líderes...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
        <div className="text-center liquid-glass p-8 rounded-2xl max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">¡Gracias!</h2>
          <p className="text-[#666666]">Tus valoraciones han sido registradas</p>
          <p className="text-sm text-[#999999] mt-4">Redirigiendo a resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/resultados")}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-[#2D2D2D]" />
            </button>
            <h1 className="text-xl font-bold text-[#C41E3A]">Valorar Líderes</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Instrucciones */}
          <div className="liquid-glass p-6 rounded-2xl mb-8">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-2">
              Valora a los líderes políticos
            </h2>
            <p className="text-[#666666]">
              Usa las estrellas para valorar a cada líder de 1 a 10. Tu opinión es importante.
            </p>
          </div>

          {/* Grid de líderes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaders.map((leader) => {
              const key = `${leader.party_key}-${leader.leader_name}`;
              const rating = valoraciones[key] || 0;

              return (
                <div
                  key={key}
                  className="frosted-glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition"
                >
                  {/* Logo y nombre del partido */}
                  <div className="flex items-center gap-3 mb-4">
                    {leader.logo_url && (
                      <img
                        src={leader.logo_url}
                        alt={leader.display_name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <span className="text-xs font-semibold text-[#999999] uppercase">
                      {leader.display_name}
                    </span>
                  </div>

                  {/* Foto del líder */}
                  {leader.photo_url && (
                    <div className="mb-4 rounded-xl overflow-hidden h-40">
                      <img
                        src={leader.photo_url}
                        alt={leader.leader_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Nombre del líder */}
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-4">
                    {leader.leader_name}
                  </h3>

                  {/* Estrellas de valoración */}
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(key, star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-[#C41E3A] text-[#C41E3A]"
                              : "text-[#999999]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Puntuación */}
                  {rating > 0 && (
                    <div
                      className="text-center py-2 rounded-lg"
                      style={{ backgroundColor: `${leader.color}20` }}
                    >
                      <span
                        className="font-bold text-lg"
                        style={{ color: leader.color }}
                      >
                        {rating}/10
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón de envío */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => setLocation("/resultados")}
              className="px-6 py-3 rounded-lg border border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A]/10 transition font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-[#C41E3A] hover:bg-[#A01830] text-white transition font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Valoraciones
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
