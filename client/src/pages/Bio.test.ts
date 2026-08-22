import { describe, expect, it } from "vitest";
import {
  getLinktreeShareData,
  LINKTREE_SHARE_TEXT,
  LINKTREE_SHARE_TITLE,
  PRIMARY_LINKS,
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
    expect(SOCIAL_LINKS.every((social) => social.url.startsWith("https://") && social.logo.startsWith("/assets/icons/"))).toBe(true);
  });

  it("ofrece descripciones útiles y genera datos completos para compartir", () => {
    expect(PRIMARY_LINKS.every((link) => link.description.length >= 45)).toBe(true);
    expect(getLinktreeShareData("https://encuestabc.example/linktree")).toEqual({
      title: LINKTREE_SHARE_TITLE,
      text: LINKTREE_SHARE_TEXT,
      url: "https://encuestabc.example/linktree",
    });
  });
});
