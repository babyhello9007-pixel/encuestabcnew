import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TwitterFeed } from "@/components/TwitterFeed";
import { ArrowRight, BarChart3, Lock, Zap, ChevronDown } from "lucide-react";

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();
  const [responseCount, setResponseCount] = useState(0);
  const [showEncuestaMenu, setShowEncuestaMenu] = useState(false);

  useEffect(() => {
    const fetchResponseCount = async () => {
      try {
        const { data, error } = await supabase
          .from("total_respuestas_view")
          .select("total_respuestas");
        if (error) throw error;
        setResponseCount(data?.[0]?.total_respuestas || 0);
      } catch (err) {
        console.error("Error fetching response count:", err);
        const { count } = await supabase
          .from("respuestas")
          .select("*", { count: "exact", head: true });
        setResponseCount(count || 0);
      }
    };

    fetchResponseCount();
    const interval = setInterval(fetchResponseCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 frosted-glass border-0 shadow-none">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-primary">Batalla Cultural</h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm items-center">
            <div className="relative group">
              <button
                onClick={() => setShowEncuestaMenu(!showEncuestaMenu)}
                className="text-foreground hover:text-primary transition font-medium flex items-center gap-1"
              >
                Encuesta
                <ChevronDown size={16} />
              </button>
              {showEncuestaMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 frosted-glass rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => { setLocation("/nano-encuesta"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    NanoEncuestaBC (5 min)
                  </button>
                  <button
                    onClick={() => { setLocation("/encuesta"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    Encuesta Completa (20 min)
                  </button>
                  <button
                    onClick={() => { setLocation("/lideres"); setShowEncuestaMenu(false); }}
                    className="w-full text-left px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 transition font-medium"
                  >
                    Elige a tus Líderes
                  </button>
                </div>
              )}
            </div>
            <a href="/resultados" className="text-foreground hover:text-primary transition font-medium">
              Resultados
            </a>
            <a href="/acerca-de" className="text-foreground hover:text-primary transition font-medium">
              Acerca de
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary -z-10" />
          
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="hero-text text-foreground">
                    La Encuesta de <span className="text-primary">Batalla Cultural</span>
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Tu voz importa. Participa en la encuesta más importante sobre el futuro político y cultural de España.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button
                    onClick={() => setLocation("/encuesta")}
                    className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 group"
                  >
                    Comenzar Encuesta
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                  </button>
                  <button
                    onClick={() => setLocation("/nano-encuesta")}
                    className="btn-secondary w-full md:w-auto"
                  >
                    Versión Rápida (5 min)
                  </button>
                </div>
              </div>

              {/* Right Stats */}
              <div className="space-y-6">
                <div className="liquid-glass p-8">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Participación en Tiempo Real
                  </p>
                  <p className="text-5xl font-bold text-primary mb-3">
                    +{responseCount.toLocaleString()}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    ciudadanos compartiendo su opinión
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-box">
                    <div className="stat-value">61</div>
                    <div className="stat-label">Preguntas</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">5 min</div>
                    <div className="stat-label">Promedio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-secondary/50">
          <div className="container">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                ¿Por qué participar?
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Una plataforma transparente, segura y diseñada para capturar la verdadera opinión de los españoles.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-8 space-y-6">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="text-primary" size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-foreground mb-3">Resultados en Vivo</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Visualiza los resultados en tiempo real con gráficos interactivos y análisis detallados de cada pregunta.
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="text-primary" size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-foreground mb-3">Privacidad Total</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Tu información personal nunca se comparte. Responde con total libertad y anonimato garantizado.
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="text-primary" size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-foreground mb-3">Rápido y Fácil</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Completa la encuesta en solo 5 minutos. Interfaz intuitiva diseñada para tu comodidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  {responseCount.toLocaleString()}
                </div>
                <p className="text-lg text-muted-foreground">Respuestas Registradas</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  61
                </div>
                <p className="text-lg text-muted-foreground">Preguntas Detalladas</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  100%
                </div>
                <p className="text-lg text-muted-foreground">Datos Públicos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 md:py-32 bg-secondary/50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold text-foreground mb-16 text-center">
                Metodología
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8">
                  <h4 className="text-xl font-semibold text-foreground mb-4">Elecciones Generales</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    350 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 3% de los votos válidos.
                  </p>
                </div>
                <div className="glass-card p-8">
                  <h4 className="text-xl font-semibold text-foreground mb-4">Asociaciones Juveniles</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    50 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 7% de los votos válidos.
                  </p>
                </div>
                <div className="glass-card p-8">
                  <h4 className="text-xl font-semibold text-foreground mb-4">Cobertura Completa</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Incluye preguntas sobre elecciones generales, autonómicas, municipales y europeas.
                  </p>
                </div>
                <div className="glass-card p-8">
                  <h4 className="text-xl font-semibold text-foreground mb-4">Análisis Profundo</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Valoraciones de líderes políticos y preguntas sobre políticas clave para el futuro de España.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Black Background */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-black">
          <div className="container text-center space-y-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              ¿Listo para participar?
            </h3>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Tu opinión es valiosa. Dedica unos minutos a responder la encuesta y forma parte de este importante análisis sobre el futuro político y cultural de España.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation("/encuesta")}
                className="btn-primary inline-flex items-center justify-center gap-2 group"
              >
                Comenzar Ahora
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => setLocation("/resultados")}
                className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition backdrop-blur-sm border border-white/30"
              >
                Ver Resultados
              </button>
              <button
                onClick={() => setLocation("/lideres")}
                className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Elige a tus Líderes
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Twitter Feed Section */}
      <TwitterFeed />

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50">
        <div className="container py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-lg">Batalla Cultural</h4>
              <p className="text-muted-foreground leading-relaxed">
                La encuesta más importante sobre el futuro político y cultural de España.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-lg">Enlaces</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="/encuesta" className="hover:text-primary transition">Encuesta</a></li>
                <li><a href="/resultados" className="hover:text-primary transition">Resultados</a></li>
                <li><a href="/acerca-de" className="hover:text-primary transition">Acerca de</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition">Términos</a></li>
                <li><a href="#" className="hover:text-primary transition">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="section-divider mb-8" />
          <div className="text-center text-sm text-muted-foreground">
            <p>
              La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
