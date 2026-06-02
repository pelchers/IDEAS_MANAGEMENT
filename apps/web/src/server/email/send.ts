/**
 * Provider-agnostic email transport.
 *
 * Wiring is complete: to enable real delivery, set RESEND_API_KEY (and
 * optionally EMAIL_FROM) in the environment — no code change required. With no
 * provider key set, emails are logged to the console (dev fallback) and
 * `delivered` is false, so callers can branch if they need to.
 *
 * Resend is used because it needs only a single HTTPS call (no SDK/dependency).
 * To add another provider, branch on EMAIL_PROVIDER and implement the call.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  ok: boolean;
  delivered: boolean; // true only when actually handed to a provider
  provider: string;
  id?: string;
  error?: string;
}

/** Whether a real email provider is configured. */
export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/** Default From — override with EMAIL_FROM (use a verified domain in prod). */
function defaultFrom(): string {
  return process.env.EMAIL_FROM || "IDEA Management <onboarding@resend.dev>";
}

export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom(),
          to: [msg.to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text ?? stripHtml(msg.html),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[email] Resend send failed (${res.status}): ${body}`);
        return { ok: false, delivered: false, provider: "resend", error: String(res.status) };
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { ok: true, delivered: true, provider: "resend", id: data?.id };
    } catch (err) {
      console.error("[email] Resend error:", err instanceof Error ? err.message : err);
      return { ok: false, delivered: false, provider: "resend", error: "exception" };
    }
  }

  // No provider configured — log instead of send (dev fallback).
  console.log(
    `[email:stub] to=${msg.to} subject="${msg.subject}" — no email provider configured ` +
      `(set RESEND_API_KEY to enable delivery)`
  );
  return { ok: true, delivered: false, provider: "none" };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Resolve the public app base URL for links inside emails. */
export function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
