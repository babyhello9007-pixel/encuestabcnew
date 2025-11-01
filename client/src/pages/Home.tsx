import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    // Obtener el número de respuestas usando el VIEW
    const fetchResponseCount = async () => {
      try {
        const { data, error } = await supabase
          .from("total_respuestas_view")
          .select("total_respuestas");
        if (error) throw error;
        setResponseCount(data?.[0]?.total_respuestas || 0);
      } catch (err) {
        console.error("Error fetching response count:", err);
        // Fallback a método antiguo si el VIEW no existe
        const { count } = await supabase
          .from("respuestas")
          .select("*", { count: "exact", head: true });
        setResponseCount(count || 0);
      }
    };

    fetchResponseCount();

    // Actualizar cada 2 segundos para ver cambios en tiempo real
    const interval = setInterval(fetchResponseCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 header-dark border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-[#C41E3A]">Batalla Cultural</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#encuesta" className="text-[#2D2D2D] hover:text-[#C41E3A] transition">
              Encuesta
            </a>
            <a href="/resultados" className="text-[#2D2D2D] hover:text-[#C41E3A] transition">
              Resultados
            </a>
            <a href="/acerca-de" className="text-[#2D2D2D] hover:text-[#C41E3A] transition">
              Acerca de
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] leading-tight">
                III Encuesta de <span className="text-[#C41E3A]">Batalla Cultural</span>
              </h2>
              <p className="text-lg text-[#666666]">
                Tu voz importa. Participa en la encuesta más importante sobre el futuro político y cultural de España.
              </p>
            </div>

            <div className="space-y-4">
              <div className="liquid-glass p-6 space-y-2">
                <p className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wide">
                  Participación en tiempo real
                </p>
                <p className="text-3xl font-bold text-[#2D2D2D]">
                  +{responseCount.toLocaleString()} respuestas
                </p>
                <p className="text-sm text-[#666666]">
                  Ciudadanos compartiendo su opinión
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="frosted-glass p-4 text-center">
                  <p className="text-2xl font-bold text-[#C41E3A]">61</p>
                  <p className="text-xs text-[#666666] mt-1">Preguntas</p>
                </div>
                <div className="frosted-glass p-4 text-center">
                  <p className="text-2xl font-bold text-[#C41E3A]">5 min</p>
                  <p className="text-xs text-[#666666] mt-1">Tiempo promedio</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setLocation("/encuesta")}
                className="flex-1 bg-[#C41E3A] hover:bg-[#A01830] text-white h-12 text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Comenzar Encuesta
              </Button>
              <Button
                onClick={() => setLocation("/resultados")}
                variant="outline"
                className="flex-1 border-[#C41E3A] text-[#C41E3A] hover:bg-[#F5F1E8] h-12 text-base font-semibold rounded-lg"
              >
                Ver Resultados
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 liquid-glass rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <img src="/favicon.png" alt="BC Logo" className="h-24 w-24 mx-auto opacity-80" />
                  <p className="text-[#2D2D2D] font-semibold">
                    Encuesta sobre la Batalla Cultural
                  </p>
                  <p className="text-sm text-[#666666]">
                    Análisis político, juventud y futuro de España
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl">🗳️</span>
            </div>
            <h3 className="font-semibold text-[#2D2D2D]">Transparencia Total</h3>
            <p className="text-sm text-[#666666]">
              Todos los datos son públicos y anónimos. Conoce exactamente cómo se procesan tus respuestas.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-[#2D2D2D]">Resultados en Vivo</h3>
            <p className="text-sm text-[#666666]">
              Visualiza los resultados en tiempo real con gráficos interactivos y análisis detallados.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="h-12 w-12 rounded-lg bg-[#C41E3A] bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-[#2D2D2D]">Privacidad Garantizada</h3>
            <p className="text-sm text-[#666666]">
              Tu información personal nunca se comparte. Responde con total libertad y anonimato.
            </p>
          </div>
        </section>

        {/* Methodology Section */}
        <section id="metodologia" className="liquid-glass p-8 rounded-2xl space-y-4 mb-16">
          <h3 className="text-2xl font-bold text-[#2D2D2D]">Metodología</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-[#666666]">
            <div>
              <p className="font-semibold text-[#2D2D2D] mb-2">Elecciones Generales</p>
              <p>
                350 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 3% de los votos válidos.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D] mb-2">Asociaciones Juveniles</p>
              <p>
                50 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 7% de los votos válidos.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D] mb-2">Gasto en Defensa</p>
              <p>
                Se pregunta sobre aumentar el gasto en defensa al 5% del PIB.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D] mb-2">Cobertura Completa</p>
              <p>
                Incluye preguntas sobre elecciones generales, autonómicas, municipales y europeas.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <h3 className="text-3xl font-bold text-[#2D2D2D]">
            ¿Listo para participar?
          </h3>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Tu opinión es valiosa. Dedica unos minutos a responder la encuesta y forma parte de este importante análisis sobre el futuro político de España.
          </p>
          <Button
            onClick={() => setLocation("/encuesta")}
            className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-12 text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Comenzar Ahora
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            III Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}

