import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRight, BarChart3, Lock, Zap, ChevronDown, X, Menu, Sparkles } from "lucide-react";

// Animated counter hook
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
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [responseCount, setResponseCount] = useState(0);
  const [showEncuestaMenu, setShowEncuestaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const animatedCount = useAnimatedCounter(responseCount);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        .frosted-glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }

        .liquid-glass {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
        }

        .bc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 0 1rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .bc-header.scrolled {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .bc-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px 12px;
        }

        .bc-nav-link:hover { color: rgba(255, 255, 255, 1); }

        .bc-hero {
          position: relative;
          padding: 60px 1rem;
          overflow: hidden;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 768px) {
          .bc-hero { padding: 120px 2rem 100px; }
        }

        .bc-hero-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }

        @media (min-width: 768px) {
          .bc-hero-grid { grid-template-columns: 1fr 1fr; gap: 80px; }
        }

        .bc-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 8vw, 64px);
          font-weight: 800;
          line-height: 1.1;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 20px;
          letter-spacing: -0.02em;
          animation: slideInLeft 0.8s ease-out 0.2s both;
        }

        .bc-headline-accent { color: #e8465a; }

        .bc-subline {
          font-size: clamp(16px, 4vw, 18px);
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 40px;
          max-width: 440px;
          animation: slideInLeft 0.8s ease-out 0.4s both;
        }

        .bc-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 100%;
          animation: slideInLeft 0.8s ease-out 0.6s both;
        }

        @media (min-width: 480px) {
          .bc-cta-group { max-width: 380px; }
        }

        .bc-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #e8465a;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 16px 28px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        @media (min-width: 480px) {
          .bc-btn-primary { width: auto; }
        }

        .bc-btn-primary:hover {
          background: #ff6b7a;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(232, 70, 90, 0.3);
        }

        .bc-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        @media (min-width: 480px) {
          .bc-btn-secondary { width: auto; }
        }

        .bc-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .bc-card {
          padding: 24px;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
          .bc-card { padding: 20px; }
        }

        .bc-stat-card {
          text-align: center;
          padding: 20px;
        }

        @media (max-width: 640px) {
          .bc-stat-card { padding: 16px; }
        }

        .bc-stat-value {
          font-size: clamp(24px, 6vw, 36px);
          font-weight: 700;
          color: #e8465a;
          margin-bottom: 8px;
        }

        .bc-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bc-feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          animation: fadeIn 0.8s ease-out;
        }

        .bc-feature-item {
          animation: slideInUp 0.6s ease-out;
        }

        .bc-feature-item:nth-child(1) { animation-delay: 0.1s; }
        .bc-feature-item:nth-child(2) { animation-delay: 0.2s; }
        .bc-feature-item:nth-child(3) { animation-delay: 0.3s; }

        @media (min-width: 640px) {
          .bc-feature-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .bc-feature-item {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .bc-feature-item { padding: 20px; }
        }

        .bc-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(232, 70, 90, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8465a;
        }

        .bc-feature-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .bc-feature-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        .bc-footer {
          margin-top: auto;
          padding: 40px 1rem 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 640px) {
          .bc-footer { padding: 30px 1rem 15px; }
        }
      `}</style>

      {/* Header */}
      <header className={`bc-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="BC" className="h-8 w-8" />
          <span className="text-lg font-bold text-white hidden sm:inline">Batalla Cultural</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <button className="bc-nav-link" onClick={() => setLocation("/")}>Inicio</button>
          <button className="bc-nav-link" onClick={() => setLocation("/encuesta")}>Encuesta</button>
          <button className="bc-nav-link" onClick={() => setLocation("/resultados")}>Resultados</button>
        </nav>
        <div className="flex items-center gap-3">
          <button className="bc-btn-primary" onClick={() => setLocation("/encuesta")}>
            Participar
          </button>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bc-hero">
          <div className="bc-hero-grid">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 frosted-glass w-fit">
                <Sparkles size={14} className="text-red-400" />
                <span className="text-xs font-semibold text-red-300 uppercase">En vivo • España 2025</span>
              </div>
              <h1 className="bc-headline">
                La voz de <span className="bc-headline-accent">España</span>, sin filtros
              </h1>
              <p className="bc-subline">
                Participa en la encuesta política y cultural más importante del año. Tus respuestas construyen el mapa real de la opinión española.
              </p>
              <div className="bc-cta-group">
                <button className="bc-btn-primary" onClick={() => setLocation("/nano-encuesta")}>
                  Comenzar Encuesta <ArrowRight size={18} />
                </button>
                <button className="bc-btn-secondary" onClick={() => setLocation("/resultados")}>
                  Ver Resultados en Vivo
                </button>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex flex-col gap-4">
              <div className="liquid-glass bc-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="bc-stat-value">+{animatedCount.toLocaleString('es-ES')}</div>
                    <div className="bc-stat-label">Ciudadanos participando</div>
                  </div>
                  <BarChart3 size={32} className="text-red-400 opacity-40" />
                </div>
                <p className="text-xs text-white/50">Datos públicos y anónimos • Actualizado en tiempo real</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="frosted-glass bc-stat-card">
                  <div className="text-2xl font-bold text-white">61</div>
                  <div className="bc-stat-label">Preguntas</div>
                </div>
                <div className="frosted-glass bc-stat-card">
                  <div className="text-2xl font-bold text-white">5 min</div>
                  <div className="bc-stat-label">Tiempo promedio</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Por qué participar?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Transparencia total, privacidad garantizada, análisis profundo</p>
          </div>
          <div className="bc-feature-grid">
            <div className="frosted-glass bc-feature-item">
              <div className="bc-feature-icon">
                <Lock size={20} />
              </div>
              <div className="bc-feature-title">Privacidad Total</div>
              <div className="bc-feature-desc">Tus datos son anónimos y públicos. Responde con total libertad.</div>
            </div>
            <div className="frosted-glass bc-feature-item">
              <div className="bc-feature-icon">
                <BarChart3 size={20} />
              </div>
              <div className="bc-feature-title">Resultados en Vivo</div>
              <div className="bc-feature-desc">Visualiza análisis interactivos actualizados en tiempo real.</div>
            </div>
            <div className="frosted-glass bc-feature-item">
              <div className="bc-feature-icon">
                <Zap size={20} />
              </div>
              <div className="bc-feature-title">Impacto Real</div>
              <div className="bc-feature-desc">Tu opinión forma parte del análisis electoral más completo.</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 md:py-24 max-w-4xl mx-auto w-full text-center">
          <div className="liquid-glass bc-card">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para participar?</h3>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Dedica 5 minutos a responder la encuesta y forma parte de este importante análisis sobre el futuro político de España.
            </p>
            <button className="bc-btn-primary" onClick={() => setLocation("/nano-encuesta")}>
              Comenzar Encuesta <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bc-footer">
        <p>III Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos</p>
      </footer>
    </div>
  );
}
