export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

/** Logos de marca servidos desde almacenamiento persistente de WebDev. */
export const BC_LOGO_URL = "/manus-storage/batalla-cultural-logo-20260830_df309405.png";
export const QUORUM_LOGO_URL = "/manus-storage/quorum-logo-20260830_ad98aa8e.png";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  if (!oauthPortalUrl || !appId) {
    if (import.meta.env.DEV) {
      console.warn("Missing VITE_OAUTH_PORTAL_URL or VITE_APP_ID, using local callback fallback.");
    }
    return `${window.location.origin}/api/oauth/callback`;
  }

  let url: URL;
  try {
    url = new URL(`${oauthPortalUrl}/app-auth`);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Invalid VITE_OAUTH_PORTAL_URL:", oauthPortalUrl, error);
    }
    return `${window.location.origin}/api/oauth/callback`;
  }
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
