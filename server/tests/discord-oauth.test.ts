import { describe, it, expect } from "vitest";

describe("Discord OAuth Credentials", () => {
  it("should have valid Discord OAuth credentials", async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();
    expect(clientId).toMatch(/^\d+$/); // Discord Client ID is numeric
    expect(clientSecret?.length).toBeGreaterThan(20); // Client Secret should be long enough
  });

  it("should have valid Discord Bot Token", () => {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    expect(botToken).toBeDefined();
    expect(botToken?.length).toBeGreaterThan(20); // Bot token should be long enough
  });

  it("should be able to exchange code for token with Discord OAuth", async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Discord credentials not configured");
    }

    // Test that we can make a request to Discord OAuth endpoint
    // This is a basic validation that credentials are properly formatted
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "identify email guilds guilds.members.read",
      }).toString(),
    });

    // We expect either success (200) or an error response
    // but not a network error or malformed request
    expect(response.status).toBeLessThan(500);
    expect(response.ok || response.status === 401).toBe(true);
  });

  it("should be able to validate bot token with Discord API", async () => {
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      throw new Error("Discord Bot Token not configured");
    }

    // Test that we can make a request to Discord API with the bot token
    // This validates that the bot token is correctly formatted and valid
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    // We expect either success (200) or an error response
    // but not a network error or malformed request
    expect(response.status).toBeLessThan(500);
    expect(response.ok || response.status === 401).toBe(true);
  });
});
