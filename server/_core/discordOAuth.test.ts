import { describe, expect, it } from "vitest";
import { buildDiscordAuthorizationUrl, isValidDiscordOAuthState } from "./discordOAuth";

describe("Discord OAuth", () => {
  it("construye una URL de autorización con redirección, alcance y state", () => {
    const url = new URL(
      buildDiscordAuthorizationUrl(
        "client-id",
        "https://encuestabc.example/api/auth/discord/callback",
        "state-seguro"
      )
    );

    expect(url.origin).toBe("https://discord.com");
    expect(url.pathname).toBe("/api/oauth2/authorize");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("redirect_uri")).toBe("https://encuestabc.example/api/auth/discord/callback");
    expect(url.searchParams.get("state")).toBe("state-seguro");
    expect(url.searchParams.get("scope")).toContain("guilds.members.read");
  });

  it("acepta solo el mismo state emitido por el servidor", () => {
    expect(isValidDiscordOAuthState("abc123", "abc123")).toBe(true);
    expect(isValidDiscordOAuthState("abc123", "abc124")).toBe(false);
    expect(isValidDiscordOAuthState(undefined, "abc123")).toBe(false);
    expect(isValidDiscordOAuthState("abc123", undefined)).toBe(false);
  });
});
