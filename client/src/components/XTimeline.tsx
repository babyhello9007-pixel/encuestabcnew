import { useEffect, useRef, useState } from "react";
import { ExternalLink, MessageCircleMore } from "lucide-react";

declare global {
  interface Window {
    twttr?: { widgets?: { load?: (element?: HTMLElement) => Promise<unknown> | void } };
  }
}

const PROFILE_URL = "https://x.com/bcultural_es";
const SCRIPT_ID = "x-platform-widgets";

export function XTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "fallback">("loading");

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => setStatus((current) => current === "loading" ? "fallback" : current), 8000);
    const markLoadedIfRendered = () => {
      if (containerRef.current?.querySelector("iframe")) {
        window.clearTimeout(fallbackTimer);
        setStatus("loaded");
      }
    };
    const observer = new MutationObserver(markLoadedIfRendered);
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true });
    const renderTimeline = () => {
      if (!containerRef.current || !window.twttr?.widgets?.load) return;
      Promise.resolve(window.twttr.widgets.load(containerRef.current))
        .then(() => window.setTimeout(markLoadedIfRendered, 250))
        .catch(() => { window.clearTimeout(fallbackTimer); setStatus("fallback"); });
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.twttr?.widgets?.load) renderTimeline();
      else existing.addEventListener("load", renderTimeline, { once: true });
      return () => { observer.disconnect(); window.clearTimeout(fallbackTimer); existing.removeEventListener("load", renderTimeline); };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://platform.twitter.com/widgets.js";
    script.charset = "utf-8";
    script.onload = renderTimeline;
    script.onerror = () => setStatus("fallback");
    document.body.appendChild(script);
    return () => { observer.disconnect(); window.clearTimeout(fallbackTimer); script.onload = null; script.onerror = null; };
  }, []);

  return (
    <section aria-labelledby="x-timeline-title" className="px-4 sm:px-8 py-10 md:py-16 max-w-6xl mx-auto w-full">
      <div className="liquid-glass overflow-hidden rounded-3xl border border-sky-400/15 bg-gradient-to-br from-sky-950/20 via-slate-900/55 to-slate-950 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-sky-300"><MessageCircleMore size={14} /> Actualidad social</div>
            <h2 id="x-timeline-title" className="mt-3 text-2xl sm:text-3xl font-bold text-white">Últimas publicaciones de <span className="text-sky-300">@bcultural_es</span></h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Sigue las novedades, análisis y avisos de Batalla Cultural directamente desde X.</p>
          </div>
          <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:-translate-y-0.5 hover:bg-sky-400/20">Ver perfil en X <ExternalLink size={15} /></a>
        </div>

        <div className="relative min-h-[390px] rounded-2xl border border-white/10 bg-slate-950/50 p-2 sm:p-3">
          {status === "loading" && <div role="status" aria-live="polite" className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-white/55"><div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-300/20 border-t-sky-300" />Cargando publicaciones recientes…</div>}
          <div ref={containerRef} className="relative z-10">
            <a className="twitter-timeline" data-theme="dark" data-height="520" data-chrome="noheader nofooter transparent" data-dnt="true" href={PROFILE_URL}>Publicaciones de @bcultural_es</a>
          </div>
          {status === "fallback" && <div className="relative z-20 flex min-h-[360px] flex-col items-center justify-center gap-3 px-5 text-center"><p className="text-sm text-white/65">No se ha podido cargar la cronología integrada en este navegador.</p><a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950">Abrir @bcultural_es <ExternalLink size={15} /></a></div>}
        </div>
      </div>
    </section>
  );
}
