import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const DISCORD_SERVER_ID = "1360701189108535366";
const DISCORD_WRITER_ROLE_ID = "1360701814953218200";

interface DiscordUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

interface DiscordGuildMember {
  user: DiscordUser;
  roles: string[];
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Exchange Discord authorization code for access token
 */
async function exchangeDiscordCode(code: string): Promise<string> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Discord OAuth credentials not configured");
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/auth/discord/callback`,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Discord token exchange failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Get Discord user info
 */
async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Discord user: ${response.statusText}`);
  }

  return (await response.json()) as DiscordUser;
}

/**
 * Get Discord guild member info to check roles
 */
async function getDiscordGuildMember(
  guildId: string,
  userId: string,
  accessToken: string
): Promise<DiscordGuildMember | null> {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    throw new Error("Discord Client ID not configured");
  }

  // Use bot token to fetch guild member info
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.warn(
      "[Discord] Bot token not configured, skipping guild member verification"
    );
    return null;
  }

  const response = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // User not in guild
    }
    throw new Error(
      `Failed to fetch Discord guild member: ${response.statusText}`
    );
  }

  return (await response.json()) as DiscordGuildMember;
}

/**
 * Check if user has the writer role in the Discord server
 */
async function hasWriterRole(
  guildId: string,
  userId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const member = await getDiscordGuildMember(guildId, userId, accessToken);

    if (!member) {
      return false; // User not in guild
    }

    return member.roles.includes(DISCORD_WRITER_ROLE_ID);
  } catch (error) {
    console.error("[Discord] Error checking writer role:", error);
    return false;
  }
}

export function registerDiscordOAuthRoutes(app: Express) {
  /**
   * Discord OAuth callback
   * Verifies user is in the server and has the writer role
   */
  app.get("/api/auth/discord/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      // Exchange code for access token
      const accessToken = await exchangeDiscordCode(code);

      // Get Discord user info
      const discordUser = await getDiscordUser(accessToken);

      // Check if user is in the server and has writer role
      const isWriter = await hasWriterRole(
        DISCORD_SERVER_ID,
        discordUser.id,
        accessToken
      );

      if (!isWriter) {
        res.status(403).json({
          error: "You must be a member of the Batalla Cultural server with the Escritores role to access this panel",
        });
        return;
      }

      // Create or update user in database
      const openId = `discord_${discordUser.id}`;
      await db.upsertUser({
        openId,
        name: discordUser.username || null,
        email: discordUser.email ?? null,
        loginMethod: "discord",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: discordUser.username || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to admin blog panel
      res.redirect(302, "/admin/blog");
    } catch (error) {
      console.error("[Discord OAuth] Callback failed:", error);
      res.status(500).json({ error: "Discord OAuth callback failed" });
    }
  });

  /**
   * Get Discord OAuth login URL
   */
  app.get("/api/auth/discord/login-url", (_req: Request, res: Response) => {
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!clientId) {
      res.status(500).json({ error: "Discord Client ID not configured" });
      return;
    }

    const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/auth/discord/callback`;
    const scopes = ["identify", "email", "guilds", "guilds.members.read"];
    const state = Math.random().toString(36).substring(7);

    const loginUrl = new URL("https://discord.com/api/oauth2/authorize");
    loginUrl.searchParams.append("client_id", clientId);
    loginUrl.searchParams.append("redirect_uri", redirectUri);
    loginUrl.searchParams.append("response_type", "code");
    loginUrl.searchParams.append("scope", scopes.join(" "));
    loginUrl.searchParams.append("state", state);

    res.json({ url: loginUrl.toString() });
  });
}
