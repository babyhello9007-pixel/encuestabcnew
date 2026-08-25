import { describe, expect, it } from "vitest";
import {
  formatQuorumArticleDate,
  generateLinktreeQrDataUrl,
  incrementLinktreeClickCount,
  formatLinktreeClickCount,
  getLinktreeQrFilename,
  getLinktreeShareData,
  LINKTREE_QUORUM_FALLBACK,
  LINKTREE_SHARE_TEXT,
  LINKTREE_SHARE_TITLE,
  PRIMARY_LINKS,
  isQuorumArticleLoading,
  QUORUM_URL,
  SOCIAL_LINKS,
} from "./Bio";

describe("configuración del Linktree de Batalla Cultural", () => {
  it("enlaza Quorum a su sitio oficial con un logotipo identificado", () => {
    const quorum = PRIMARY_LINKS.find((link) => link.title === "Quorum");

    expect(quorum?.externalUrl).toBe(QUORUM_URL);
    expect(quorum?.logo).toBe("https://batallaperi-avauhaz8.manus.space/logo.png");
  });

  it("incluye los cuatro perfiles sociales oficiales con sus activos visuales", () => {
    expect(SOCIAL_LINKS.map((social) => social.name)).toEqual(["X", "Discord", "Bluesky", "Instagram"]);
    expect(SOCIAL_LINKS.every((social) => social.url.startsWith("https://") && Boolean(social.logo || social.icon))).toBe(true);
    expect(SOCIAL_LINKS.find((social) => social.name === "Instagram")?.icon).toBeTruthy();
  });

  it("ofrece descripciones útiles y genera datos completos para compartir", () => {
    expect(PRIMARY_LINKS.every((link) => link.description.length >= 45)).toBe(true);
    expect(getLinktreeShareData("https://encuestabc.example/linktree")).toEqual({
      title: LINKTREE_SHARE_TITLE,
      text: LINKTREE_SHARE_TEXT,
      url: "https://encuestabc.example/linktree",
    });
  });

  it("prepara un nombre descargable de QR y formatea las fechas de Quorum de forma legible", () => {
    expect(getLinktreeQrFilename()).toBe("batalla-cultural-linktree-qr.png");
    expect(formatQuorumArticleDate("2026-08-01T10:45:25.000Z")).toContain("2026");
    expect(formatQuorumArticleDate(null)).toBe("Última publicación");
  });

  it("mantiene una publicación de Quorum utilizable si la actualización remota tarda", () => {
    expect(LINKTREE_QUORUM_FALLBACK.title).toBeTruthy();
    expect(LINKTREE_QUORUM_FALLBACK.articleUrl).toContain("/articulo/");
  });

  it("muestra el skeleton solo cuando las noticias están abiertas y siguen cargando", () => {
    expect(isQuorumArticleLoading(true, true)).toBe(true);
    expect(isQuorumArticleLoading(false, true)).toBe(false);
    expect(isQuorumArticleLoading(true, false)).toBe(false);
  });

  it("genera un QR PNG descargable para el enlace público", async () => {
    const result = await generateLinktreeQrDataUrl("https://encuestabc.example/linktree");
    expect(result.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("acumula y etiqueta los clics locales de forma transparente", () => {
    const first = incrementLinktreeClickCount({}, "social-instagram");
    const second = incrementLinktreeClickCount(first, "social-instagram");
    expect(second["social-instagram"]).toBe(2);
    expect(formatLinktreeClickCount(second["social-instagram"])).toBe("2 clics");
  });

});
