import { prisma } from "@/server/db";
import { newToken } from "@/server/auth/tokens";

/**
 * Render a notification digest email (HTML + text) for a user.
 */
export function renderDigestEmail(opts: {
  displayName: string | null;
  email: string;
  notifications: { title: string; body: string; createdAt: Date }[];
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const name = opts.displayName || opts.email;
  const count = opts.notifications.length;
  const subject = `You have ${count} new notification${count !== 1 ? "s" : ""}`;

  const items = opts.notifications
    .map((n) => `<li style="margin-bottom:8px"><strong>${escapeHtml(n.title)}</strong>${n.body ? `<br/><span style="color:#666">${escapeHtml(n.body)}</span>` : ""}</li>`)
    .join("");

  const html = `
    <div style="font-family:monospace;max-width:600px;margin:0 auto;border:3px solid #282828;padding:24px">
      <h1 style="text-transform:uppercase;font-size:1.2rem">Hi ${escapeHtml(name)},</h1>
      <p>Here's what you missed:</p>
      <ul style="list-style:none;padding:0">${items}</ul>
      <hr style="border:none;border-top:1px solid #ccc;margin:16px 0"/>
      <p style="font-size:0.7rem;color:#999">
        <a href="${opts.unsubscribeUrl}">Unsubscribe from digest emails</a>
      </p>
    </div>`;

  const textItems = opts.notifications.map((n) => `- ${n.title}${n.body ? ` (${n.body})` : ""}`).join("\n");
  const text = `Hi ${name},\n\nHere's what you missed:\n\n${textItems}\n\nUnsubscribe: ${opts.unsubscribeUrl}`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

/**
 * Ensure a user has an unsubscribe token; generate one if missing.
 */
export async function ensureUnsubscribeToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { unsubscribeToken: true } });
  if (user?.unsubscribeToken) return user.unsubscribeToken;
  const token = newToken(32);
  await prisma.user.update({ where: { id: userId }, data: { unsubscribeToken: token } });
  return token;
}

/**
 * Build and "send" digests for all users due for delivery.
 * Email sending is stubbed (logged) — no email provider is configured yet.
 * Returns the list of digests that would be sent.
 */
export async function runDigestCycle(frequency: "DAILY" | "WEEKLY", baseUrl: string) {
  const windowMs = frequency === "DAILY" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  const users = await prisma.user.findMany({
    where: { emailDigestFrequency: frequency },
    select: { id: true, email: true, displayName: true },
  });

  const sent: { userId: string; email: string; count: number }[] = [];

  for (const u of users) {
    const notifications = await prisma.notification.findMany({
      where: { userId: u.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { title: true, body: true, createdAt: true },
      take: 50,
    });
    if (notifications.length === 0) continue;

    const token = await ensureUnsubscribeToken(u.id);
    const unsubscribeUrl = `${baseUrl}/api/notifications/unsubscribe?token=${token}`;
    const email = renderDigestEmail({ displayName: u.displayName, email: u.email, notifications, unsubscribeUrl });

    // Email provider not configured — log instead of send. Replace with real
    // provider (Resend/SES/Postmark) once API keys are available.
    console.log(`[digest] would send to ${u.email}: ${email.subject}`);

    sent.push({ userId: u.id, email: u.email, count: notifications.length });
  }

  return sent;
}
