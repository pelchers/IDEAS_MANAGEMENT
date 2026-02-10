function envInt(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const authConfig = {
  cookieSecure: process.env.AUTH_COOKIE_SECURE === "true",
  sessionTtlSeconds: envInt("AUTH_SESSION_TTL_SECONDS", 15 * 60),
  refreshTtlSeconds: envInt("AUTH_REFRESH_TTL_SECONDS", 30 * 24 * 60 * 60)
};

