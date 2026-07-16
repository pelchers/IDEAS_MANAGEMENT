/**
 * Shared Google OAuth 2.0 helper for the Gmail + Calendar providers.
 * Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET. All network calls use the
 * standard Google endpoints, so this is prod-ready once creds are supplied.
 */
export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

export function buildGoogleAuthUrl(scopes: string[], redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`google_token_exchange_failed_${res.status}`);
  return (await res.json()) as GoogleTokens;
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`google_token_refresh_failed_${res.status}`);
  return (await res.json()) as GoogleTokens;
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const j = (await res.json()) as { email?: string };
  return j.email ?? null;
}

/**
 * Return a valid access token for a stored config, refreshing if we have a
 * refresh token. Returns the (possibly updated) config so the caller can persist
 * a rotated token.
 */
export async function ensureAccessToken(config: Record<string, unknown>): Promise<{ accessToken: string; config: Record<string, unknown> }> {
  const accessToken = typeof config.accessToken === "string" ? config.accessToken : "";
  const refreshToken = typeof config.refreshToken === "string" ? config.refreshToken : "";
  const expiresAt = typeof config.expiresAt === "number" ? config.expiresAt : 0;

  // Still valid (60s skew) → use as-is.
  if (accessToken && expiresAt > Date.now() + 60_000) {
    return { accessToken, config };
  }
  if (refreshToken) {
    const t = await refreshGoogleToken(refreshToken);
    const next = {
      ...config,
      accessToken: t.access_token,
      expiresAt: Date.now() + (t.expires_in ?? 3600) * 1000,
    };
    return { accessToken: t.access_token, config: next };
  }
  return { accessToken, config };
}

export function tokensToConfig(t: GoogleTokens): Record<string, unknown> {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    scope: t.scope,
    expiresAt: Date.now() + (t.expires_in ?? 3600) * 1000,
  };
}
