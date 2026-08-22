import { publicProcedure, router } from "../_core/trpc";

const QUORUM_BASE_URL = "https://batallaperi-avauhaz8.manus.space";
const QUORUM_LATEST_ARTICLE_ENDPOINT = `${QUORUM_BASE_URL}/api/trpc/articles.getPublished?input=%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D`;
const CACHE_TTL_MS = 5 * 60 * 1000;

export type QuorumArticleSummary = {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string | null;
  readingTime: number | null;
  featuredImage: string | null;
  articleUrl: string;
};

const FALLBACK_ARTICLE: QuorumArticleSummary = {
  title: "Ceuta ha dicho basta.",
  excerpt: "Análisis de la actualidad política y social desde Quorum.",
  slug: "22",
  publishedAt: "2026-08-01T10:45:25.000Z",
  readingTime: 5,
  featuredImage: null,
  articleUrl: `${QUORUM_BASE_URL}/articulo/22`,
};

let cache: { expiresAt: number; article: QuorumArticleSummary } | null = null;

function getText(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseLatestArticle(payload: unknown): QuorumArticleSummary | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as { result?: { data?: { json?: unknown } } };
  const records = root.result?.data?.json;
  if (!Array.isArray(records) || records.length === 0 || !records[0] || typeof records[0] !== "object") return null;

  const record = records[0] as Record<string, unknown>;
  const title = getText(record, "title");
  const slug = getText(record, "slug");
  if (!title || !slug) return null;

  const excerpt = getText(record, "excerpt") || getText(record, "subtitle") || "Lee el último análisis publicado por Quorum.";
  return {
    title,
    excerpt,
    slug,
    publishedAt: getText(record, "publishedAt"),
    readingTime: getNumber(record, "readingTime"),
    featuredImage: getText(record, "featuredImage"),
    articleUrl: `${QUORUM_BASE_URL}/articulo/${encodeURIComponent(slug)}`,
  };
}

async function loadLatestQuorumArticle(): Promise<QuorumArticleSummary> {
  if (cache && cache.expiresAt > Date.now()) return cache.article;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(QUORUM_LATEST_ARTICLE_ENDPOINT, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Quorum respondió ${response.status}`);
    const article = parseLatestArticle(await response.json()) || FALLBACK_ARTICLE;
    cache = { article, expiresAt: Date.now() + CACHE_TTL_MS };
    return article;
  } catch (error) {
    console.warn("[Quorum] No se pudo actualizar el artículo destacado:", error instanceof Error ? error.message : error);
    return FALLBACK_ARTICLE;
  } finally {
    clearTimeout(timeout);
  }
}

export const quorumRouter = router({
  getLatest: publicProcedure.query(loadLatestQuorumArticle),
});
