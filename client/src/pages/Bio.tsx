import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Download,
  Heart,
  Instagram,
  Moon,
  Newspaper,
  QrCode,
  Share2,
  Sun,
  Vote,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";

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

type SocialLink = {
  name: string;
  url: string;
  label: string;
  logo?: string;
  icon?: typeof Instagram;
  invertOnDark: boolean;
};

export const QUORUM_URL = "https://batallaperi-avauhaz8.manus.space/";
export const LINKTREE_SHARE_TITLE = "Batalla Cultural";
export const LINKTREE_SHARE_TEXT = "Encuesta, análisis y comunidad para entender la opinión política y cultural de España.";
export const LINKTREE_THEME_STORAGE_KEY = "bc-linktree-theme";
export const LINKTREE_CLICK_STORAGE_KEY = "bc-linktree-click-counts";
export const BIO_FAVICON = "/favicon.png";

export function isQuorumArticleLoading(isNewsOpen: boolean, isLoading: boolean) {
  return isNewsOpen && isLoading;
}

export const LINKTREE_QUORUM_FALLBACK = {
  title: "Ceuta ha dicho basta.",
  excerpt: "Análisis de la actualidad política y social desde Quorum.",
  publishedAt: "2026-08-01T10:45:25.000Z",
  readingTime: 5,
  articleUrl: "https://batallaperi-avauhaz8.manus.space/articulo/22",
};

export function getLinktreeShareData(url: string) {
  return { title: LINKTREE_SHARE_TITLE, text: LINKTREE_SHARE_TEXT, url };
}

export function getLinktreeQrFilename() {
  return "batalla-cultural-linktree-qr.png";
}

export function generateLinktreeQrDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0a1022", light: "#ffffff" },
  });
}

export function formatQuorumArticleDate(value: string | null) {
  if (!value) return "Última publicación";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Última publicación";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function incrementLinktreeClickCount(counts: Record<string, number>, key: string) {
  return { ...counts, [key]: Math.max(0, counts[key] || 0) + 1 };
}

export function formatLinktreeClickCount(count: number) {
  return `${count} ${count === 1 ? "clic" : "clics"}`;
}

export const PRIMARY_LINKS: InternalLink[] = [
  {
    title: "Quorum",
    description: "Análisis político y cultural para mirar más allá de los titulares.",
    externalUrl: QUORUM_URL,
    logo: "https://batallaperi-avauhaz8.manus.space/logo.png",
    icon: BookOpen,
    accent: "text-violet-200 bg-violet-400/10 border-violet-300/20 hover:border-violet-300/60",
    featured: true,
  },
  {
    title: "Participar en la encuesta",
    description: "Comparte tu opinión y ayuda a dibujar el pulso político de España.",
    route: "/nano-encuesta",
    icon: Vote,
    accent: "text-rose-100 bg-rose-500/15 border-rose-300/30 hover:border-rose-200/70",
    featured: true,
  },
  {
    title: "Resultados en directo",
    description: "Explora votos, escaños, mapas y tendencias actualizadas en tiempo real.",
    route: "/resultados",
    icon: BarChart3,
    accent: "text-sky-100 bg-sky-500/15 border-sky-300/30 hover:border-sky-200/70",
  },
  {
    title: "Valora a los líderes",
    description: "Puntúa a los líderes y compara su valoración con la comunidad.",
    route: "/valorar-lideres",
    icon: Crown,
    accent: "text-amber-100 bg-amber-500/15 border-amber-300/30 hover:border-amber-200/70",
  },
  {
    title: "Test político",
    description: "Responde unas preguntas y descubre tu perfil político orientativo.",
    route: "/test-politico",
    icon: ClipboardCheck,
    accent: "text-emerald-100 bg-emerald-500/15 border-emerald-300/30 hover:border-emerald-200/70",
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "X", url: "https://x.com/bcultural_es", label: "Actualidad y opinión", logo: "/assets/icons/x-logo.png", invertOnDark: true },
  { name: "Discord", url: "https://discord.gg/Tc8JabgY3T", label: "Comunidad BC", logo: "/assets/icons/discord-logo.png", invertOnDark: true },
  { name: "Bluesky", url: "https://bsky.app/profile/bcultural-es.bsky.social", label: "Síguenos en Bluesky", logo: "/assets/icons/bluesky-logo.png", invertOnDark: false },
  { name: "Instagram", url: "https://www.instagram.com/bcultural_es/", label: "Contenido visual", icon: Instagram, invertOnDark: false },
];

function QuorumArticleSkeleton({ isDark }: { isDark: boolean }) {
  const shimmer = isDark ? "bg-white/10" : "bg-slate-200";
  const surface = isDark ? "border-emerald-300/25 bg-emerald-400/[0.08]" : "border-emerald-200 bg-emerald-50";

  return (
    <div
      className={`relative block overflow-hidden rounded-2xl border p-4 shadow-lg ${surface}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando la última publicación de Quorum"
      data-testid="quorum-article-skeleton"
    >
      <span className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} aria-hidden="true" />
        <span className="min-w-0 flex-1 space-y-2" aria-hidden="true">
          <span className={`block h-2.5 w-40 rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} />
          <span className={`block h-4 w-4/5 rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} />
          <span className={`block h-3 w-full rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} />
          <span className={`block h-3 w-3/4 rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} />
          <span className={`block h-2.5 w-48 rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} />
        </span>
        <span className={`mt-1 h-4 w-4 shrink-0 rounded-full ${shimmer} motion-safe:animate-pulse motion-reduce:animate-none`} aria-hidden="true" />
      </span>
      <span className="sr-only">Cargando la última publicación de Quorum.</span>
    </div>
  );
}

export default function Bio() {
  const [, setLocation] = useLocation();
  const [shareFeedback, setShareFeedback] = useState<"copied" | "shared" | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [isNewsOpen, setIsNewsOpen] = useState(true);
  const [isResourcesOpen, setIsResourcesOpen] = useState(true);
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  const latestQuorum = trpc.quorum.getLatest.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 1 });

  useEffect(() => {
    const preference = window.localStorage.getItem(LINKTREE_THEME_STORAGE_KEY);
    if (preference === "dark" || preference === "light") {
      setIsDark(preference === "dark");
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LINKTREE_CLICK_STORAGE_KEY);
      if (stored) setClickCounts(JSON.parse(stored) as Record<string, number>);
    } catch {
      setClickCounts({});
    }
  }, []);

  const registerClick = (key: string) => {
    setClickCounts((current) => {
      const next = incrementLinktreeClickCount(current, key);
      window.localStorage.setItem(LINKTREE_CLICK_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current;
      window.localStorage.setItem(LINKTREE_THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  const showShareFeedback = (feedback: "copied" | "shared") => {
    setShareFeedback(feedback);
    window.setTimeout(() => setShareFeedback(null), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showShareFeedback("copied");
      return true;
    } catch {
      return false;
    }
  };

  const shareLink = async () => {
    const shareData = getLinktreeShareData(window.location.href);
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showShareFeedback("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  const openQr = async () => {
    setIsQrOpen(true);
    if (qrDataUrl || isGeneratingQr) return;

    setIsGeneratingQr(true);
    try {
      setQrDataUrl(await generateLinktreeQrDataUrl(window.location.href));
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = getLinktreeQrFilename();
    anchor.click();
  };

  const article = latestQuorum.data ?? LINKTREE_QUORUM_FALLBACK;

  return (
    <main className={`linktree-page min-h-screen overflow-hidden px-4 py-10 sm:py-14 ${isDark ? "linktree-dark bg-[#050816] text-white" : "linktree-light bg-slate-100 text-slate-950"}`}>
      <div className={`pointer-events-none fixed inset-0 ${isDark ? "bg-[radial-gradient(circle_at_top,_rgba(196,30,58,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),transparent_38%)]" : "bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.18),transparent_38%)]"}`} />

      <section className="relative mx-auto w-full max-w-xl">
        <header className="mb-7 text-center">
          <div className="mb-4 flex items-start justify-between">
            <span className="h-11 w-11" aria-hidden="true" />
            <div className={`linktree-logo-shell flex h-24 w-24 items-center justify-center rounded-[2rem] border p-2 shadow-2xl backdrop-blur-xl ${isDark ? "border-white/20 bg-white/10 shadow-rose-950/30" : "border-slate-200 bg-white shadow-slate-300/40"}`}>
              <img
                src={BIO_FAVICON}
                alt="Favicon de Batalla Cultural"
                className="h-full w-full rounded-[1.45rem] object-contain"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = APP_LOGO;
                }}
              />
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`linktree-utility inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${isDark ? "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
              title={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-100">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" /> Comunidad en directo
          </div>
          <h1 className="linktree-heading text-3xl font-black tracking-tight sm:text-4xl">Batalla Cultural</h1>
          <p className="linktree-subtitle mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base">
            Encuesta, análisis y comunidad para entender la opinión política y cultural de España.
          </p>
        </header>

        <section className="mb-4">
          <button
            type="button"
            onClick={() => setIsNewsOpen((current) => !current)}
            className={`mb-2 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition focus:outline-none focus:ring-2 focus:ring-emerald-300/70 ${isDark ? "text-emerald-100 hover:bg-white/5" : "text-emerald-800 hover:bg-emerald-100/70"}`}
            aria-expanded={isNewsOpen}
          >
            Noticias de Quorum <span aria-hidden="true">{isNewsOpen ? "−" : "+"}</span>
          </button>
          {isQuorumArticleLoading(isNewsOpen, latestQuorum.isLoading) ? <QuorumArticleSkeleton isDark={isDark} /> : isNewsOpen ? <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registerClick("quorum-latest")}
          className={`linktree-reveal linktree-quorum-feature linktree-quorum-pulse relative group block overflow-hidden rounded-2xl border p-4 shadow-lg transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300/70 motion-reduce:transform-none motion-reduce:transition-none ${isDark ? "border-emerald-300/25 bg-emerald-400/[0.08]" : "border-emerald-200 bg-emerald-50"}`}
          style={{ animationDelay: "60ms" }}
        >
          <span className="flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-emerald-300/10 text-emerald-200" : "bg-emerald-100 text-emerald-700"}`}>
              <Newspaper className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>
                Quorum · Última publicación
              </span>
              <span className="linktree-feature-title mt-1 block line-clamp-2 text-sm font-bold sm:text-base">
                {article.title}
              </span>
              <span className="linktree-feature-excerpt mt-1 block line-clamp-2 text-xs leading-5">
                {article.excerpt}
              </span>
              <span className={`mt-2 flex items-center gap-2 text-[10px] font-medium ${isDark ? "text-emerald-100/80" : "text-emerald-800"}`}>
                {formatQuorumArticleDate(article.publishedAt)}
                {article.readingTime ? <><span aria-hidden="true">·</span>{article.readingTime} min de lectura</> : null}
                <span aria-hidden="true">·</span><span title="Clics registrados en este dispositivo">{formatLinktreeClickCount(clickCounts["quorum-latest"] || 0)}</span>
              </span>
            </span>
            <ArrowRight className={`mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${isDark ? "text-emerald-100" : "text-emerald-700"}`} />
          </span>
        </a> : null}
        </section>

        <section className="mb-8">
          <button
            type="button"
            onClick={() => setIsResourcesOpen((current) => !current)}
            className={`mb-2 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${isDark ? "text-rose-100 hover:bg-white/5" : "text-rose-700 hover:bg-rose-100/70"}`}
            aria-expanded={isResourcesOpen}
          >
            Participa y explora <span aria-hidden="true">{isResourcesOpen ? "−" : "+"}</span>
          </button>
        {isResourcesOpen && <div className="space-y-3">
          {PRIMARY_LINKS.map((link, index) => {
            const Icon = link.icon;
            const countKey = `primary-${link.route || link.externalUrl || link.title}`;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => {
                  registerClick(countKey);
                  if (link.externalUrl) window.open(link.externalUrl, "_blank", "noopener,noreferrer");
                  else if (link.route) setLocation(link.route);
                }}
                className={`linktree-reveal linktree-card group flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-lg backdrop-blur-xl transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-rose-300/70 motion-reduce:transform-none motion-reduce:transition-none ${link.accent}`}
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <span className={`linktree-icon-shell flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/15 ${link.logo ? "w-28 bg-white/90 px-2" : "w-11 bg-slate-950/35"}`}>
                  {link.logo ? (
                    <img src={link.logo} alt="Logotipo Quorum" className="h-7 w-full object-contain" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="linktree-title flex items-center gap-2 text-sm font-bold sm:text-base">
                    {link.title}
                    {link.featured && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/75">Destacado</span>}
                  </span>
                  <span className="linktree-description mt-1 block text-xs leading-5 text-slate-200/90">{link.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="linktree-click-count text-[10px] font-semibold" title="Clics registrados en este dispositivo">{formatLinktreeClickCount(clickCounts[countKey] || 0)}</span>
                  <ArrowRight className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>}
        </section>

        <section className={`linktree-surface mt-8 rounded-3xl border p-5 shadow-xl backdrop-blur-xl ${isDark ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white/85"}`}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <button type="button" onClick={() => setIsSocialOpen((current) => !current)} className="rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-rose-300/70" aria-expanded={isSocialOpen}>
              <h2 className="linktree-heading text-sm font-bold">Redes oficiales <span className="ml-1 text-rose-400">{isSocialOpen ? "−" : "+"}</span></h2>
              <p className="linktree-muted mt-1 text-xs">Sigue a la comunidad de Batalla Cultural.</p>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={openQr}
                className={`linktree-utility inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${isDark ? "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                aria-label="Generar código QR descargable del Linktree"
              >
                <QrCode className="h-3.5 w-3.5" /> QR
              </button>
              <button
                type="button"
                onClick={shareLink}
                className={`linktree-utility inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 hover:border-rose-200/50 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${isDark ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                aria-label="Compartir el enlace de Batalla Cultural"
              >
                {shareFeedback ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {shareFeedback === "shared" ? "Compartido" : shareFeedback === "copied" ? "Copiado" : "Compartir"}
              </button>
            </div>
          </div>

          {isSocialOpen && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SOCIAL_LINKS.map((social, index) => {
              const SocialIcon = social.icon;
              const countKey = `social-${social.name.toLowerCase()}`;
              return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registerClick(countKey)}
                className={`linktree-reveal linktree-social-card group rounded-2xl border p-3 text-center transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300/70 motion-reduce:transform-none motion-reduce:transition-none ${isDark ? "border-white/10 bg-slate-950/35 hover:border-rose-200/50 hover:bg-white/10 hover:shadow-rose-950/20" : "border-slate-200 bg-slate-50 hover:border-rose-300 hover:bg-white hover:shadow-slate-300/40"}`}
                style={{ animationDelay: `${560 + index * 70}ms` }}
                aria-label={`${social.name}: ${social.label}`}
              >
                <span className="mx-auto flex h-5 w-5 items-center justify-center">
                  {SocialIcon ? <SocialIcon className="h-5 w-5" aria-label={`Icono de ${social.name}`} /> : <img src={social.logo} alt={`Logotipo de ${social.name}`} className={`h-5 w-5 object-contain ${social.invertOnDark && isDark ? "brightness-0 invert" : ""}`} />}
                </span>
                <span className="linktree-title mt-2 block text-xs font-bold">{social.name}</span>
                <span className="linktree-muted mt-0.5 block text-[9px] leading-3">{social.label}</span>
                <span className="linktree-click-count mt-1 block text-[9px] font-semibold" title="Clics registrados en este dispositivo">{formatLinktreeClickCount(clickCounts[countKey] || 0)}</span>
              </a>
              );
            })}
          </div>}
        </section>

        <footer className="linktree-muted mt-7 flex items-center justify-center gap-2 text-center text-[11px]">
          <Heart className="h-3.5 w-3.5 text-rose-300" />
          <span>Batalla Cultural · Datos anónimos, conversación pública</span>
        </footer>
      </section>

      {isQrOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Código QR del Linktree">
          <section className={`w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl ${isDark ? "border-white/15 bg-[#11172a] text-white" : "border-slate-200 bg-white text-slate-950"}`}>
            <div className="mb-4 flex items-center justify-between gap-4 text-left">
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${isDark ? "text-rose-200" : "text-rose-600"}`}>Compartir presencialmente</p>
                <h2 className="mt-1 text-lg font-black">Código QR de Batalla Cultural</h2>
              </div>
              <button type="button" onClick={() => setIsQrOpen(false)} className={`rounded-lg p-2 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300/70 ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`} aria-label="Cerrar código QR">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`mb-5 text-sm leading-5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Escanea el código para abrir esta página o descárgalo para carteles y materiales impresos.</p>
            <div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
              {qrDataUrl ? <img src={qrDataUrl} alt="Código QR del Linktree de Batalla Cultural" className="h-full w-full object-contain" /> : <QrCode className="h-16 w-16 animate-pulse text-slate-400" aria-hidden="true" />}
            </div>
            <button type="button" onClick={downloadQr} disabled={!qrDataUrl || isGeneratingQr} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-rose-300/70">
              <Download className="h-4 w-4" />
              {isGeneratingQr ? "Generando QR…" : "Descargar PNG"}
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
