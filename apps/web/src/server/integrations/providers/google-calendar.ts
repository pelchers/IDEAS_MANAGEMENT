import type { IntegrationProviderDef, ExchangeResult } from "../types";
import {
  googleConfigured,
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleEmail,
  ensureAccessToken,
  tokensToConfig,
} from "../google";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export const googleCalendarProvider: IntegrationProviderDef = {
  id: "GOOGLE_CALENDAR",
  label: "Google Calendar",
  description: "Push task due dates to your calendar as events.",
  kind: "oauth",
  capabilities: ["Task → calendar event", "Due-date sync"],
  setupHint: "Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and add this app's redirect URI in Google Cloud.",
  isConfigured: () => googleConfigured(),
  buildAuthUrl: ({ redirectUri, state }) => buildGoogleAuthUrl(SCOPES, redirectUri, state),
  exchangeCode: async ({ code, redirectUri }): Promise<ExchangeResult> => {
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const email = await fetchGoogleEmail(tokens.access_token);
    return { accountLabel: email ?? undefined, scopes: SCOPES, config: tokensToConfig(tokens) };
  },
};

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface TaskForEvent {
  title: string;
  description?: string | null;
  dueDate: string; // ISO
  eventId?: string | null; // existing event to update
}

/**
 * Create or update a 30-minute calendar event for a task's due date.
 * Returns the event id (persist it on task.externalRefs.calendarEventId) and the
 * possibly-refreshed config.
 */
export async function calendarUpsertEventForTask(
  config: Record<string, unknown>,
  task: TaskForEvent
): Promise<{ ok: boolean; eventId: string | null; config: Record<string, unknown> }> {
  const { accessToken, config: next } = await ensureAccessToken(config);
  const start = new Date(task.dueDate);
  const end = new Date(start.getTime() + 30 * 60_000);
  const body = {
    summary: task.title,
    description: task.description ?? undefined,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    source: { title: "IDEA Management" },
  };

  const url = task.eventId ? `${CALENDAR_API}/${task.eventId}` : CALENDAR_API;
  const method = task.eventId ? "PATCH" : "POST";
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, eventId: task.eventId ?? null, config: next };
  const event = (await res.json()) as { id?: string };
  return { ok: true, eventId: event.id ?? task.eventId ?? null, config: next };
}
