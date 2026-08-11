import { describe, expect, it } from "vitest";
import { buildDiscordAuthorizationUrl } from "../_core/discordOAuth";

const liveDiscordTests = process.env.DISCORD_LIVE_TESTS === "true";

describe("Discord OAuth configuration", () => {
  it("construye una URL de autorización con callback y state", () => {
    const url = new URL(
      buildDiscordAuthorizationUrl(
        "123456789012345678",
        "https://encuestabc-6q57y6uz.manus.space/api/auth/discord/callback",
        "state-for-test"
      )
    );

    expect(url.origin).toBe("https://discord.com");
    expect(url.pathname).toBe("/api/oauth2/authorize");
    expect(url.searchParams.get("client_id")).toBe("123456789012345678");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-for-test");
    expect(url.searchParams.get("redirect_uri")).toContain("/api/auth/discord/callback");
    expect(url.searchParams.get("scope")).toContain("identify");
    expect(url.searchParams.get("scope")).toContain("guilds.members.read");
  });

  it("comprueba que las credenciales configuradas tienen el formato esperado", () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();
    expect(botToken).toBeDefined();
    expect(clientId).toMatch(/^\d+$/);
    expect(clientSecret?.length).toBeGreaterThan(20);
    expect(botToken?.length).toBeGreaterThan(20);
  });
});

describe.skipIf(!liveDiscordTests)("Discord OAuth live connectivity", () => {
  it("can reach the Discord OAuth endpoint", async () => {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      signal: AbortSignal.timeout(8000),
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "client_credentials",
        scope: "identify",
      }).toString(),
    });

    expect(response.status).toBeLessThan(500);
  });

  it("can reach the Discord API with the bot token", async () => {
    const response = await fetch("https://discord.com/api/users/@me", {
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN || ""}`,
      },
    });

    expect(response.status).toBeLessThan(500);
  });
});
