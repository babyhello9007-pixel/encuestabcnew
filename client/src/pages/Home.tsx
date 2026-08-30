import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { SeoHead } from "@/components/SeoHead";
import { XTimeline } from "@/components/XTimeline";
import { 
  ArrowRight, 
  BarChart3, 
  Lock, 
  Zap, 
  X, 
  Menu, 
  Sparkles, 
  Newspaper, 
  ExternalLink,
  PenTool,
  Users
} from "lucide-react";

// Hook animador de contadores
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (target === 0) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * ease));

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
    prev.current = target;
  }, [target, duration]);

  return count;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [responseCount, setResponseCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const animatedCount = useAnimatedCounter(responseCount);

  // Obtener contador de respuestas desde Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchResponseCount = async () => {
      try {
        const { data, error } = await supabase
          .from("total_respuestas_view")
          .select("total_respuestas");
          
        if (error) throw error;
        if (isMounted && data?.[0]?.total_respuestas) {
          setResponseCount(data[0].total_respuestas);
        }
      } catch (err) {
        console.error("Error fetching response count:", err);
        const { count } = await supabase
          .from("respuestas")
          .select("*", { count: "exact", head: true });
        if (isMounted) setResponseCount(count || 0);
      }
    };

    fetchResponseCount();
    const interval = setInterval(fetchResponseCount, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Efecto de scroll para el header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const QUORUM_URL = "https://batallaperi-avauhaz8.manus.space/";

  return (
    <div className="bc-home-shell min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      <SeoHead title="Batalla Cultural | Encuesta y resultados políticos en vivo" description="Participa en la encuesta política y cultural de Batalla Cultural. Consulta resultados en vivo, mapas electorales y análisis de opinión en España." path="/" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800&display=swap');

        .bc-home-shell .frosted-glass {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035));
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  box-shadow: inset 1px 1px 0 rgba(255,255,255,0.14), inset -1px -1px 0 rgba(0,0,0,0.28), 12px 16px 34px rgba(0,0,0,0.25);
}

.bc-home-shell .liquid-glass {
  position: relative;
  overflow: hidden;
  /* Cambio a tinte morado/púrpura al final del degradado */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.045) 48%, rgba(168, 85, 247, 0.12) 100%);
  backdrop-filter: blur(32px) saturate(165%);
  -webkit-backdrop-filter: blur(32px) saturate(165%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 26px;
  /* Glow/Sombra morada exterior */
  box-shadow: inset 1px 1px 0 rgba(255,255,255,0.18), inset -1px -1px 0 rgba(0,0,0,0.28), 18px 24px 52px rgba(0,0,0,0.32), 0 0 40px rgba(168, 85, 247, 0.15);
}

.bc-home-shell .frosted-glass::after,
.bc-home-shell .liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(255,255,255,0.12), transparent 34%, transparent 70%, rgba(255,255,255,0.04));
}

.bc-home-shell .frosted-glass,
.bc-home-shell .liquid-glass {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.bc-home-shell .frosted-glass:hover,
.bc-home-shell .liquid-glass:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.28);
  /* Hover con resplandor morado enriquecido */
  box-shadow: inset 1px 1px 0 rgba(255,255,255,0.2), 18px 26px 54px rgba(0,0,0,0.36), 0 0 34px rgba(168, 85, 247, 0.22);
}

.bc-home-shell header {
  background: linear-gradient(180deg, rgba(5, 8, 22, 0.76), rgba(5, 8, 22, 0.28));
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .bc-home-shell .frosted-glass:hover,
  .bc-home-shell .liquid-glass:hover { transform: none; }
}

.font-playfair {
  font-family: 'TVP', sans-serif;
}

      `}</style>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
          <img src="/favicon.png" alt="BC" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-white hidden sm:inline tracking-tight">Batalla Cultural</span>
        </div>

<nav className="hidden md:flex items-center gap-6">
  <button className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setLocation("/")}>Inicio</button>
  <button className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setLocation("/encuesta")}>Encuesta</button>
  <button className="text-sm font-medium text-white/70 hover:text-white transition-colors" onClick={() => setLocation("/resultados")}>Resultados</button>
  <a 
    href={QUORUM_URL} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-sm font-medium text-[#54D59F] hover:text-[#54D59F]/80 transition-colors flex items-center gap-1.5 bg-[#54D59F]/10 px-3 py-1.5 rounded-lg border border-[#54D59F]/20"
  >
    <Newspaper size={15} />
    Quorum
  </a>
</nav>

        <div className="flex items-center gap-3">
          <button 
            className="hidden sm:inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02]"
            onClick={() => setLocation("/nano-encuesta")}
          >
            Participar
          </button>

          {/* Toggle Menu Móvil */}
          <button className="md:hidden p-2 text-white/80 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Desplegable Menú Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-40 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          <button className="text-left text-base font-medium text-white/80 py-2 border-b border-white/5" onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}>Inicio</button>
          <button className="text-left text-base font-medium text-white/80 py-2 border-b border-white/5" onClick={() => { setLocation("/encuesta"); setMobileMenuOpen(false); }}>Encuesta</button>
          <button className="text-left text-base font-medium text-white/80 py-2 border-b border-white/5" onClick={() => { setLocation("/resultados"); setMobileMenuOpen(false); }}>Resultados</button>
          <a href={QUORUM_URL} target="_blank" rel="noopener noreferrer" className="text-left text-base font-medium text-red-400 py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Newspaper size={18} />
            Medio Quorum <ExternalLink size={14} />
          </a>
          <button 
            className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-red-600/20 text-center"
            onClick={() => { setLocation("/nano-encuesta"); setMobileMenuOpen(false); }}
          >
            Participar Ahora
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-8 py-16 md:py-28 overflow-hidden max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Contenido Izquierdo */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 frosted-glass rounded-full border border-red-500/20">
                <Sparkles size={14} className="text-red-400 animate-pulse" />
                <span className="text-xs font-semibold text-red-300 uppercase tracking-wide">En vivo • España 2026</span>
              </div>
              <h1 className="font-playfair text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
                La voz de <span className="text-red-500">España</span>, sin filtros
              </h1>
              <p className="text-lg sm:text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
                Participa en la encuesta política y cultural más importante del año. Tus respuestas construyen el mapa real de la opinión española.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-red-600/25 hover:translate-y-[-2px]"
                  onClick={() => setLocation("/nano-encuesta")}
                >
                  Comenzar Encuesta <ArrowRight size={18} />
                </button>
                <button 
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium px-6 py-3.5 rounded-xl transition-all"
                  onClick={() => setLocation("/resultados")}
                >
                  Ver Resultados en Vivo
                </button>
              </div>
            </div>

            {/* Tarjeta de Estadísticas (Derecha) */}
            <div className="flex flex-col gap-4">
              <div className="liquid-glass p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold text-red-500 mb-2 font-mono">
                      +{animatedCount.toLocaleString('es-ES')}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">
                      Ciudadanos participando
                    </div>
                  </div>
                  <BarChart3 size={38} className="text-red-400 opacity-30" />
                </div>
                <p className="text-xs text-white/40 border-t border-white/10 pt-4">
                  Datos públicos y anónimos • Actualizado en tiempo real
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="frosted-glass p-5 text-center rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">61</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Preguntas</div>
                </div>
                <div className="frosted-glass p-5 text-center rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">5 min</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Tiempo promedio</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- NUEVO APARTADO: MEDIO QUORUM --- */}
        <section className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full">
          <div className="liquid-glass relative overflow-hidden rounded-3xl p-8 md:p-12 border border-red-500/20 bg-gradient-to-r from-red-950/20 via-slate-900/60 to-slate-950">
            {/* Glow de fondo */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Columna Izquierda: Identidad/Logo */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden p-3 shadow-xl">
                  <img 
                    src="/quorum.png" 
                    alt="Logo QUORUM" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback en caso de que aún no exista la imagen estática
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-red-500 text-2xl tracking-tighter">Q</span>';
                    }}
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold tracking-wider uppercase mb-2">
                  El medio de Batalla Cultural
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  QUORUM
                </h2>
              </div>

              {/* Columna Derecha: Manifiesto e Invitación */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    El periódico donde la opinión no se censura
                  </h3>
                  <p className="text-white/70 leading-relaxed text-base">
                    Bienvenido a <strong className="text-white">QUORUM</strong>, el medio de comunicación independiente impulsado por la comunidad. Un espacio completamente libre donde invitamos a todos los usuarios —<strong>sin importar tu ideología ni el tema</strong>— a redactar, publicar y debatir sus propios artículos de opinión y análisis.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 frosted-glass p-4 rounded-xl">
                    <PenTool className="text-red-400 shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-white text-sm">Libertad de Cátedra</h4>
                      <p className="text-xs text-white/50 mt-0.5">Escribe sobre política, sociedad o cultura sin líneas editoriales impuestas.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 frosted-glass p-4 rounded-xl">
                    <Users className="text-red-400 shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-white text-sm">Pluralismo Real</h4>
                      <p className="text-xs text-white/50 mt-0.5">Todas las opiniones fundamentadas tienen cabida y repercusión.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a 
                    href={QUORUM_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/30 w-full sm:w-auto justify-center"
                  >
                    Ir a Medio Quorum / Publicar Artículo
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* --- FIN APARTADO MEDIO QUORUM --- */}

        <XTimeline />

        {/* Features Section */}
        <section className="px-4 sm:px-8 py-16 md:py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Por qué participar?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Transparencia total, privacidad garantizada, análisis profundo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="frosted-glass p-6 rounded-2xl flex flex-col gap-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                <Lock size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Privacidad Total</h3>
              <p className="text-sm text-white/60 leading-relaxed">Tus datos son anónimos y públicos. Responde con total libertad.</p>
            </div>

            <div className="frosted-glass p-6 rounded-2xl flex flex-col gap-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Resultados en Vivo</h3>
              <p className="text-sm text-white/60 leading-relaxed">Visualiza análisis interactivos actualizados en tiempo real.</p>
            </div>

            <div className="frosted-glass p-6 rounded-2xl flex flex-col gap-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Impacto Real</h3>
              <p className="text-sm text-white/60 leading-relaxed">Tu opinión forma parte del análisis electoral más completo.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="px-4 sm:px-8 py-12 md:py-20 max-w-4xl mx-auto w-full text-center">
          <div className="liquid-glass p-8 md:p-12 rounded-3xl border border-white/10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para hacer oír tu voz?</h3>
            <p className="text-white/60 mb-8 max-w-xl mx-auto text-base">
              Dedica 5 minutos a responder la encuesta y forma parte de este importante análisis sobre el futuro político de España.
            </p>
            <button 
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-red-600/30 hover:scale-[1.02]"
              onClick={() => setLocation("/nano-encuesta")}
            >
              Comenzar Encuesta <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 text-center text-sm text-white/40 border-t border-white/10">
        <p>#LaEncuestaBC 2026 | Todos los datos son anónimos y públicos</p>
      </footer>
    </div>
  );
}
