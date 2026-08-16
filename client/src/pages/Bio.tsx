import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  ExternalLink,
  Heart,
  Vote,
} from "lucide-react";
import { APP_LOGO } from "@/const";

type InternalLink = {
  title: string;
  description: string;
  route?: string;
  externalUrl?: string;
  logo?: string;
  icon: typeof Vote;
  accent: string;
  featured?: boolean;
};

export const QUORUM_URL = "https://batallaperi-avauhaz8.manus.space/";

export const PRIMARY_LINKS: InternalLink[] = [
  {
    title: "Quorum",
    description: "Periódico de análisis político y cultural",
    externalUrl: QUORUM_URL,
    logo: "https://batallaperi-avauhaz8.manus.space/logo.png",
    icon: BookOpen,
    accent: "text-violet-200 bg-violet-400/10 border-violet-300/20 hover:border-violet-300/60",
    featured: true,
  },
  {
    title: "Participar en la encuesta",
    description: "Da tu opinión en menos de cinco minutos",
    route: "/nano-encuesta",
    icon: Vote,
    accent: "text-rose-100 bg-rose-500/15 border-rose-300/30 hover:border-rose-200/70",
    featured: true,
  },
  {
    title: "Resultados en directo",
    description: "Consulta datos, tendencias y simulaciones",
    route: "/resultados",
    icon: BarChart3,
    accent: "text-sky-100 bg-sky-500/15 border-sky-300/30 hover:border-sky-200/70",
  },
  {
    title: "Valora a los líderes",
    description: "Comparte tu valoración política",
    route: "/valorar-lideres",
    icon: Crown,
    accent: "text-amber-100 bg-amber-500/15 border-amber-300/30 hover:border-amber-200/70",
  },
  {
    title: "Test político",
    description: "Descubre tu perfil político",
    route: "/test-politico",
    icon: ClipboardCheck,
    accent: "text-emerald-100 bg-emerald-500/15 border-emerald-300/30 hover:border-emerald-200/70",
  },
];

export const SOCIAL_LINKS = [
  { name: "X", url: "https://x.com/bcultural_es", label: "Actualidad y opinión", logo: "/assets/icons/x-logo.png" },
  { name: "Discord", url: "https://discord.gg/Tc8JabgY3T", label: "Comunidad BC", logo: "/assets/icons/discord-logo.png" },
  { name: "Bluesky", url: "https://bsky.app/profile/bcultural-es.bsky.social", label: "Síguenos en Bluesky", logo: "/assets/icons/bluesky-logo.png" },
  { name: "Instagram", url: "https://www.instagram.com/bcultural_es/", label: "Contenido visual", logo: "/assets/icons/instagram-logo.gif" },
];

export default function Bio() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // El Linktree sigue siendo utilizable aunque el navegador bloquee el portapapeles.
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] px-4 py-10 text-white sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,30,58,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),transparent_38%)]" />

      <section className="relative mx-auto w-full max-w-xl">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl shadow-rose-950/30 backdrop-blur-xl">
            <img src={APP_LOGO} alt="Batalla Cultural" className="h-full w-full rounded-[1.45rem] object-contain" />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-100">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" /> Comunidad en directo
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Batalla Cultural</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
            Encuesta, análisis y comunidad para entender la opinión política y cultural de España.
          </p>
        </header>

        <div className="space-y-3">
          {PRIMARY_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => {
                  if (link.externalUrl) window.open(link.externalUrl, "_blank", "noopener,noreferrer");
                  else if (link.route) setLocation(link.route);
                }}
                className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-lg backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${link.accent}`}
              >
                <span className={`flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/15 ${link.logo ? "w-28 bg-white/90 px-2" : "w-11 bg-slate-950/35"}`}>
                  {link.logo ? (
                    <img
                      src={link.logo}
                      alt="Logotipo Quorum"
                      className="h-7 w-full object-contain"
                    />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold sm:text-base">
                    {link.title}
                    {link.featured && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/75">Destacado</span>}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-300">{link.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold">Redes oficiales</h2>
              <p className="mt-1 text-xs text-slate-400">Sigue a la comunidad de Batalla Cultural.</p>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 transition hover:bg-white/10"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <ExternalLink className="h-3.5 w-3.5" />}
              {copied ? "Enlace copiado" : "Compartir"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SOCIAL_LINKS.map((social) => {
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-center transition hover:-translate-y-0.5 hover:border-rose-200/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                  aria-label={`${social.name}: ${social.label}`}
                >
                  <span className="mx-auto flex h-5 w-5 items-center justify-center">
                    <img src={social.logo} alt={`Logotipo de ${social.name}`} className="h-5 w-5 object-contain" />
                  </span>
                  <span className="mt-2 block text-xs font-bold">{social.name}</span>
                  <span className="mt-0.5 block text-[9px] leading-3 text-slate-400">{social.label}</span>
                </a>
              );
            })}
          </div>
        </section>

        <footer className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <Heart className="h-3.5 w-3.5 text-rose-300" />
          <span>Batalla Cultural · Datos anónimos, conversación pública</span>
        </footer>
      </section>
    </main>
  );
}
