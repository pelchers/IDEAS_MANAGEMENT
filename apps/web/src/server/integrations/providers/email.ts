import type { IntegrationProviderDef } from "../types";
import { emailConfigured, sendEmail, appBaseUrl } from "@/server/email/send";
import { getToday, type TaskDTO } from "@/server/tasks/tasks";
import { prisma } from "@/server/db";

export const emailProvider: IntegrationProviderDef = {
  id: "EMAIL",
  label: "Email digests",
  description: "Email yourself a daily digest of what's due across your projects.",
  kind: "apiKey",
  capabilities: ["Today digest", "Task summaries"],
  setupHint: "Set RESEND_API_KEY (or SMTP_HOST/USER/PASS) on the server to enable sending.",
  isConfigured: () => emailConfigured(),
};

function renderDigest(name: string, buckets: { overdue: TaskDTO[]; today: TaskDTO[]; upcoming: TaskDTO[] }) {
  const line = (t: TaskDTO) => `• ${t.title}${t.projectName ? ` (${t.projectName})` : ""}`;
  const section = (label: string, items: TaskDTO[]) =>
    items.length ? `${label}:\n${items.map(line).join("\n")}\n` : "";

  const text =
    `Hi ${name},\n\nYour work for today:\n\n` +
    section("Overdue", buckets.overdue) +
    section("Due today", buckets.today) +
    section("Upcoming", buckets.upcoming.slice(0, 5)) +
    `\nOpen your board: ${appBaseUrl()}/today\n`;

  const htmlItem = (t: TaskDTO) =>
    `<li style="margin:4px 0">${escapeHtml(t.title)}${t.projectName ? ` <span style="color:#888">(${escapeHtml(t.projectName)})</span>` : ""}</li>`;
  const htmlSection = (label: string, items: TaskDTO[], color: string) =>
    items.length
      ? `<h3 style="color:${color};margin:16px 0 4px">${label}</h3><ul style="padding-left:18px;margin:0">${items.map(htmlItem).join("")}</ul>`
      : "";
  const html =
    `<div style="font-family:system-ui,sans-serif;max-width:520px">` +
    `<p>Hi ${escapeHtml(name)}, here's your work for today:</p>` +
    htmlSection("Overdue", buckets.overdue, "#c0392b") +
    htmlSection("Due today", buckets.today, "#27ae60") +
    htmlSection("Upcoming", buckets.upcoming.slice(0, 5), "#2980b9") +
    `<p style="margin-top:20px"><a href="${appBaseUrl()}/today">Open your board →</a></p></div>`;

  return { text, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Build and send the caller's "Today" digest. Returns a status object rather
 * than throwing so the API can report "not configured" cleanly.
 */
export async function sendTodayDigest(userId: string, now: Date) {
  if (!emailConfigured()) {
    return { ok: false as const, reason: "not_configured" as const };
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, displayName: true } });
  if (!user) return { ok: false as const, reason: "no_user" as const };

  const buckets = await getToday(userId, now);
  const { text, html } = renderDigest(user.displayName || user.email.split("@")[0], buckets);
  const result = await sendEmail({
    to: user.email,
    subject: `Your tasks — ${buckets.counts.overdue + buckets.counts.today} due`,
    text,
    html,
  });
  return { ok: result.ok, reason: result.ok ? undefined : ("send_failed" as const), counts: buckets.counts };
}
