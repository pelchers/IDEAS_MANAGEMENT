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
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

export const gmailProvider: IntegrationProviderDef = {
  id: "GMAIL",
  label: "Gmail",
  description: "Read recent mail and turn emails into tasks; send from your account.",
  kind: "oauth",
  capabilities: ["Read recent mail", "Send email", "Email → task"],
  setupHint: "Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and add this app's redirect URI in Google Cloud.",
  isConfigured: () => googleConfigured(),
  buildAuthUrl: ({ redirectUri, state }) => buildGoogleAuthUrl(SCOPES, redirectUri, state),
  exchangeCode: async ({ code, redirectUri }): Promise<ExchangeResult> => {
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const email = await fetchGoogleEmail(tokens.access_token);
    return { accountLabel: email ?? undefined, scopes: SCOPES, config: tokensToConfig(tokens) };
  },
};

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailMessageSummary {
  id: string;
  snippet: string;
  from: string;
  subject: string;
}

function header(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** List the most recent messages (id + snippet + from/subject). Refreshes token as needed. */
export async function gmailListRecent(
  config: Record<string, unknown>,
  max = 10
): Promise<{ messages: GmailMessageSummary[]; config: Record<string, unknown> }> {
  const { accessToken, config: next } = await ensureAccessToken(config);
  const listRes = await fetch(`${GMAIL_API}/messages?maxResults=${max}&labelIds=INBOX`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) throw new Error(`gmail_list_failed_${listRes.status}`);
  const list = (await listRes.json()) as { messages?: Array<{ id: string }> };
  const ids = (list.messages ?? []).map((m) => m.id);

  const messages: GmailMessageSummary[] = [];
  for (const id of ids) {
    const msgRes = await fetch(`${GMAIL_API}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!msgRes.ok) continue;
    const m = (await msgRes.json()) as {
      snippet?: string;
      payload?: { headers?: Array<{ name: string; value: string }> };
    };
    const headers = m.payload?.headers ?? [];
    messages.push({
      id,
      snippet: m.snippet ?? "",
      from: header(headers, "From"),
      subject: header(headers, "Subject"),
    });
  }
  return { messages, config: next };
}

/** Send a plain-text email from the connected Gmail account (RFC 2822 / base64url). */
export async function gmailSend(
  config: Record<string, unknown>,
  msg: { to: string; subject: string; body: string }
): Promise<{ ok: boolean; config: Record<string, unknown> }> {
  const { accessToken, config: next } = await ensureAccessToken(config);
  const raw = [`To: ${msg.to}`, `Subject: ${msg.subject}`, "Content-Type: text/plain; charset=utf-8", "", msg.body].join("\r\n");
  const encoded = Buffer.from(raw).toString("base64url");
  const res = await fetch(`${GMAIL_API}/messages/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: encoded }),
  });
  return { ok: res.ok, config: next };
}
