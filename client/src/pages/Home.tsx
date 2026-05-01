import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { TwitterFeed } from "@/components/TwitterFeed";
import Footer from "@/components/Footer";
import FollowUsMenu from "@/components/FollowUsMenu";
import { ArrowRight, BarChart3, Lock, Zap, ChevronDown, X, Menu } from "lucide-react";

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showEncuestaMenu) setShowEncuestaMenu(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showEncuestaMenu]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bc-bg)", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800&display=swap');

        :root {
          --bc-bg: #0a0a0f;
          --bc-surface: #111118;
          --bc-surface2: #18181f;
          --bc-border: rgba(255,255,255,0.07);
          --bc-border2: rgba(255,255,255,0.12);
          --bc-text: #f0eff8;
          --bc-muted: #8b8aa0;
          --bc-accent: #e8465a;
          --bc-accent2: #ff6b7a;
          --bc-accent-dim: rgba(232,70,90,0.12);
          --bc-gold: #c9a96e;
          --bc-gold-dim: rgba(201,169,110,0.1);
        }

        .bc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.3s, border-color 0.3s;
        }
        .bc-header.scrolled {
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--bc-border);
        }

        .bc-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--bc-muted);
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .bc-nav-link:hover { color: var(--bc-text); }

        .bc-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          background: var(--bc-surface2);
          border: 1px solid var(--bc-border2);
          border-radius: 12px;
          overflow: hidden;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .bc-dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          font-size: 14px;
          color: var(--bc-muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border-bottom: 1px solid var(--bc-border);
        }
        .bc-dropdown-item:last-child { border-bottom: none; }
        .bc-dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--bc-text); }

        /* Hero */
        .bc-hero {
          position: relative;
          padding: 120px 2rem 100px;
          overflow: hidden;
        }
        .bc-hero-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .bc-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .bc-hero { padding: 80px 1.5rem 60px; }
        }

        /* Background orbs */
        .bc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .bc-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(232,70,90,0.12) 0%, transparent 70%);
          top: -100px; right: -100px;
        }
        .bc-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%);
          bottom: -50px; left: -100px;
        }

        .bc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bc-accent-dim);
          border: 1px solid rgba(232,70,90,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--bc-accent2);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .bc-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--bc-accent);
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .bc-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.1;
          color: var(--bc-text);
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .bc-headline-accent { color: var(--bc-accent); }

        .bc-subline {
          font-size: 18px;
          line-height: 1.7;
          color: var(--bc-muted);
          margin: 0 0 40px;
          max-width: 440px;
        }

        /* CTA Buttons */
        .bc-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
        }
        .bc-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--bc-accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 16px 28px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 rgba(232,70,90,0);
        }
        .bc-btn-primary:hover {
          background: var(--bc-accent2);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(232,70,90,0.3);
        }
        .bc-btn-primary:active { transform: translateY(0); }

        .bc-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--bc-surface2);
          color: var(--bc-text);
          border: 1px solid var(--bc-border2);
          border-radius: 10px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .bc-btn-secondary:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.2);
        }

        .bc-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: transparent;
          color: var(--bc-muted);
          border: 1px solid var(--bc-border);
          border-radius: 10px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .bc-btn-ghost:hover { color: var(--bc-text); border-color: var(--bc-border2); }

        /* Stats card */
        .bc-stat-card {
          background: var(--bc-surface);
          border: 1px solid var(--bc-border2);
          border-radius: 20px;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        .bc-stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(232,70,90,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .bc-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bc-accent);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bc-stat-live {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--bc-accent);
          animation: pulse 1.5s ease infinite;
        }
        .bc-stat-number {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(52px, 8vw, 80px);
          font-weight: 800;
          color: var(--bc-text);
          line-height: 1;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .bc-stat-sub {
          font-size: 15px;
          color: var(--bc-muted);
          line-height: 1.5;
        }

        .bc-mini-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }
        .bc-mini-stat {
          background: var(--bc-surface2);
          border: 1px solid var(--bc-border);
          border-radius: 12px;
          padding: 16px;
        }
        .bc-mini-stat-num {
          font-size: 22px;
          font-weight: 700;
          color: var(--bc-gold);
          margin-bottom: 2px;
        }
        .bc-mini-stat-label {
          font-size: 12px;
          color: var(--bc-muted);
        }

        /* Section styles */
        .bc-section {
          padding: 100px 2rem;
          position: relative;
        }
        .bc-section-alt {
          background: var(--bc-surface);
        }
        .bc-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .bc-section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .bc-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          color: var(--bc-text);
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .bc-section-sub {
          font-size: 17px;
          color: var(--bc-muted);
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Feature cards */
        .bc-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .bc-features-grid { grid-template-columns: 1fr; }
        }
        .bc-feature-card {
          background: var(--bc-surface2);
          border: 1px solid var(--bc-border);
          border-radius: 16px;
          padding: 36px 28px;
          transition: border-color 0.25s, transform 0.25s;
          cursor: default;
        }
        .bc-feature-card:hover {
          border-color: var(--bc-border2);
          transform: translateY(-3px);
        }
        .bc-feature-icon {
          width: 52px; height: 52px;
          border-radius: 12px;
          background: var(--bc-accent-dim);
          border: 1px solid rgba(232,70,90,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: var(--bc-accent);
        }
        .bc-feature-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--bc-text);
          margin: 0 0 10px;
        }
        .bc-feature-text {
          font-size: 14px;
          color: var(--bc-muted);
          line-height: 1.7;
          margin: 0;
        }

        /* Stats band */
        .bc-stats-band {
          background: var(--bc-bg);
          border-top: 1px solid var(--bc-border);
          border-bottom: 1px solid var(--bc-border);
          padding: 60px 2rem;
        }
        .bc-stats-band-inner {
          max-width: 800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--bc-border);
          border-radius: 16px;
          overflow: hidden;
        }
        .bc-stat-cell {
          background: var(--bc-bg);
          padding: 48px 40px;
          text-align: center;
        }
        .bc-stat-cell-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 52px;
          font-weight: 800;
          color: var(--bc-accent);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 8px;
        }
        .bc-stat-cell-label {
          font-size: 14px;
          color: var(--bc-muted);
          letter-spacing: 0.03em;
        }

        /* Methodology cards */
        .bc-method-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) {
          .bc-method-grid { grid-template-columns: 1fr; }
        }
        .bc-method-card {
          background: var(--bc-bg);
          border: 1px solid var(--bc-border);
          border-radius: 14px;
          padding: 28px;
          transition: border-color 0.2s;
        }
        .bc-method-card:hover { border-color: var(--bc-border2); }
        .bc-method-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bc-accent);
          margin-bottom: 10px;
        }
        .bc-method-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--bc-text);
          margin: 0 0 8px;
        }
        .bc-method-text {
          font-size: 14px;
          color: var(--bc-muted);
          line-height: 1.65;
          margin: 0;
        }

        /* CTA Final */
        .bc-cta-final {
          padding: 120px 2rem;
          background: var(--bc-surface);
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .bc-cta-final::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,70,90,0.08) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .bc-cta-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          color: var(--bc-text);
          margin: 0 0 20px;
          letter-spacing: -0.02em;
          position: relative;
        }
        .bc-cta-sub {
          font-size: 18px;
          color: var(--bc-muted);
          max-width: 520px;
          margin: 0 auto 48px;
          line-height: 1.7;
          position: relative;
        }
        .bc-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
        }

        /* Mobile menu */
        .bc-mobile-menu {
          position: fixed;
          inset: 0;
          background: rgba(10,10,15,0.98);
          backdrop-filter: blur(20px);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bc-mobile-link {
          font-size: 24px;
          font-weight: 600;
          color: var(--bc-muted);
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
          padding: 12px 24px;
          transition: color 0.2s;
          text-decoration: none;
          display: block;
        }
        .bc-mobile-link:hover { color: var(--bc-text); }

        .bc-divider {
          width: 40px; height: 2px;
          background: var(--bc-accent);
          border-radius: 2px;
          margin: 0 0 24px;
        }

        /* Arrow icon animate */
        .bc-arrow-icon {
          transition: transform 0.2s;
          display: inline-block;
        }
        .bc-btn-primary:hover .bc-arrow-icon { transform: translateX(4px); }
      `}</style>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="bc-mobile-menu">
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "var(--bc-muted)", cursor: "pointer" }}
          >
            <X size={28} />
          </button>
          <button className="bc-mobile-link" onClick={() => { setLocation("/nano-encuesta"); setMobileMenuOpen(false); }}>
            NanoEncuesta (5 min)
          </button>
          <button className="bc-mobile-link" onClick={() => { setLocation("/encuesta"); setMobileMenuOpen(false); }}>
            Encuesta Completa
          </button>
          <a href="/resultados" className="bc-mobile-link" onClick={() => setMobileMenuOpen(false)}>Resultados</a>
          <a href="/acerca-de" className="bc-mobile-link" onClick={() => setMobileMenuOpen(false)}>Acerca de</a>
          <a href="https://batallaperi-avauhaz8.manus.space/" target="_blank" rel="noreferrer" className="bc-mobile-link" onClick={() => setMobileMenuOpen(false)}>Quorum</a>
        </div>
      )}

      {/* Header */}
      <header className={`bc-header${scrolled ? " scrolled" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/favicon.png" alt="BC Logo" style={{ height: 32, width: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--bc-text)", letterSpacing: "-0.01em" }}>
            Batalla Cultural
          </span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }} className="hidden md:flex">
          <div style={{ position: "relative" }}>
            <button
              className="bc-nav-link"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              onClick={(e) => { e.stopPropagation(); setShowEncuestaMenu(!showEncuestaMenu); }}
            >
              Encuesta <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: showEncuestaMenu ? "rotate(180deg)" : "none" }} />
            </button>
            {showEncuestaMenu && (
              <div className="bc-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="bc-dropdown-item" onClick={() => { setLocation("/nano-encuesta"); setShowEncuestaMenu(false); }}>
                  NanoEncuestaBC <span style={{ fontSize: 12, color: "var(--bc-accent)", marginLeft: 6 }}>5 min</span>
                </button>
                <button className="bc-dropdown-item" onClick={() => { setLocation("/encuesta"); setShowEncuestaMenu(false); }}>
                  Encuesta Completa <span style={{ fontSize: 12, color: "var(--bc-muted)", marginLeft: 6 }}>20 min</span>
                </button>
              </div>
            )}
          </div>
          <a href="/resultados" className="bc-nav-link">Resultados</a>
          <a href="/acerca-de" className="bc-nav-link">Acerca de</a>
          <a href="https://batallaperi-avauhaz8.manus.space/" target="_blank" rel="noreferrer" className="bc-nav-link">Quorum</a>
          <FollowUsMenu />
          <button
            onClick={() => setLocation("/nano-encuesta")}
            className="bc-btn-primary"
            style={{ padding: "10px 20px", fontSize: 14, borderRadius: 8 }}
          >
            Participar
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          style={{ background: "none", border: "none", color: "var(--bc-muted)", cursor: "pointer" }}
        >
          <Menu size={24} />
        </button>
      </header>

      <main style={{ flex: 1 }}>

        {/* Hero */}
        <section className="bc-hero">
          <div className="bc-orb bc-orb-1" />
          <div className="bc-orb bc-orb-2" />

          <div className="bc-hero-grid" style={{ position: "relative", zIndex: 1 }}>
            {/* Left */}
            <div>
              <div className="bc-eyebrow">
                <span className="bc-eyebrow-dot" />
                Encuesta en vivo · España 2025
              </div>
              <h1 className="bc-headline">
                La voz de<br />
                <span className="bc-headline-accent">España,</span><br />
                sin filtros
              </h1>
              <p className="bc-subline">
                Participa en la encuesta política y cultural más importante del año. Tus respuestas construyen el mapa real de la opinión española.
              </p>
              <div className="bc-cta-group">
                <button
                  onClick={() => setLocation("/nano-encuesta")}
                  className="bc-btn-primary"
                >
                  Comenzar Encuesta
                  <span className="bc-arrow-icon"><ArrowRight size={18} /></span>
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={() => setLocation("/nano-encuesta")} className="bc-btn-secondary" style={{ fontSize: 14 }}>
                    Versión rápida · 5 min
                  </button>
                  <button onClick={() => setLocation("/resultados")} className="bc-btn-ghost" style={{ fontSize: 14 }}>
                    Ver resultados
                  </button>
                </div>
              </div>
            </div>

            {/* Right — stat card */}
            <div>
              <div className="bc-stat-card">
                <div className="bc-stat-label">
                  <span className="bc-stat-live" />
                  Participación en tiempo real
                </div>
                <div className="bc-stat-number">
                  +{animatedCount.toLocaleString("es-ES")}
                </div>
                <p className="bc-stat-sub">ciudadanos han compartido su opinión</p>

                <div className="bc-mini-stats">
                  <div className="bc-mini-stat">
                    <div className="bc-mini-stat-num">100%</div>
                    <div className="bc-mini-stat-label">Datos públicos</div>
                  </div>
                  <div className="bc-mini-stat">
                    <div className="bc-mini-stat-num">0%</div>
                    <div className="bc-mini-stat-label">Datos vendidos</div>
                  </div>
                  <div className="bc-mini-stat">
                    <div className="bc-mini-stat-num">5 min</div>
                    <div className="bc-mini-stat-label">Versión rápida</div>
                  </div>
                  <div className="bc-mini-stat">
                    <div className="bc-mini-stat-num">20 min</div>
                    <div className="bc-mini-stat-label">Versión completa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bc-section bc-section-alt">
          <div className="bc-container">
            <div className="bc-section-header">
              <div className="bc-divider" style={{ margin: "0 auto 20px" }} />
              <h2 className="bc-section-title">¿Por qué participar?</h2>
              <p className="bc-section-sub">
                Una plataforma transparente, segura y diseñada para capturar la verdadera opinión de los españoles.
              </p>
            </div>
            <div className="bc-features-grid">
              <div className="bc-feature-card">
                <div className="bc-feature-icon"><BarChart3 size={24} /></div>
                <h3 className="bc-feature-title">Resultados en vivo</h3>
                <p className="bc-feature-text">
                  Visualiza los resultados en tiempo real con gráficos interactivos y análisis detallados de cada pregunta.
                </p>
              </div>
              <div className="bc-feature-card">
                <div className="bc-feature-icon"><Lock size={24} /></div>
                <h3 className="bc-feature-title">Privacidad total</h3>
                <p className="bc-feature-text">
                  Tu información personal nunca se comparte. Responde con total libertad y anonimato garantizado.
                </p>
              </div>
              <div className="bc-feature-card">
                <div className="bc-feature-icon"><Zap size={24} /></div>
                <h3 className="bc-feature-title">Rápido y fácil</h3>
                <p className="bc-feature-text">
                  Completa la encuesta en solo 5 minutos. Interfaz intuitiva diseñada para tu comodidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <div className="bc-stats-band">
          <div className="bc-stats-band-inner">
            <div className="bc-stat-cell">
              <div className="bc-stat-cell-num">{animatedCount.toLocaleString("es-ES")}</div>
              <div className="bc-stat-cell-label">Respuestas registradas</div>
            </div>
            <div className="bc-stat-cell">
              <div className="bc-stat-cell-num">100%</div>
              <div className="bc-stat-cell-label">Datos públicos y abiertos</div>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <section className="bc-section bc-section-alt">
          <div className="bc-container">
            <div className="bc-section-header">
              <div className="bc-divider" style={{ margin: "0 auto 20px" }} />
              <h2 className="bc-section-title">Metodología</h2>
            </div>
            <div className="bc-method-grid" style={{ maxWidth: 860, margin: "0 auto" }}>
              <div className="bc-method-card">
                <div className="bc-method-num">01</div>
                <h3 className="bc-method-title">Elecciones Generales</h3>
                <p className="bc-method-text">350 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 3% de los votos válidos.</p>
              </div>
              <div className="bc-method-card">
                <div className="bc-method-num">02</div>
                <h3 className="bc-method-title">Asociaciones Juveniles</h3>
                <p className="bc-method-text">50 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 7% de los votos válidos.</p>
              </div>
              <div className="bc-method-card">
                <div className="bc-method-num">03</div>
                <h3 className="bc-method-title">Cobertura Completa</h3>
                <p className="bc-method-text">Incluye preguntas sobre elecciones generales, autonómicas, municipales y europeas.</p>
              </div>
              <div className="bc-method-card">
                <div className="bc-method-num">04</div>
                <h3 className="bc-method-title">Análisis Profundo</h3>
                <p className="bc-method-text">Valoraciones de líderes políticos y preguntas sobre políticas clave para el futuro de España.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bc-cta-final">
          <h2 className="bc-cta-headline">¿Listo para participar?</h2>
          <p className="bc-cta-sub">
            Tu opinión es valiosa. Dedica unos minutos y forma parte de este análisis sobre el futuro político y cultural de España.
          </p>
          <div className="bc-cta-buttons">
            <button
              onClick={() => setLocation("/nano-encuesta")}
              className="bc-btn-primary"
              style={{ fontSize: 16, padding: "16px 32px" }}
            >
              Comenzar ahora
              <span className="bc-arrow-icon"><ArrowRight size={20} /></span>
            </button>
            <button
              onClick={() => setLocation("/resultados")}
              className="bc-btn-secondary"
              style={{ fontSize: 16, padding: "16px 32px" }}
            >
              Ver resultados
            </button>
          </div>
        </section>
      </main>

      <TwitterFeed />
      <Footer />
    </div>
  );
}
