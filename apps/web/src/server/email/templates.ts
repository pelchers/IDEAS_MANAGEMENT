/**
 * Email templates (HTML + text). Brutalist-plain, provider-safe inline styles.
 */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

function shell(title: string, bodyHtml: string): string {
  return `<div style="font-family:monospace;max-width:600px;margin:0 auto;border:3px solid #282828;padding:24px">
    <h1 style="text-transform:uppercase;font-size:1.2rem;margin-top:0">${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#FF5E54;color:#fff;text-decoration:none;font-weight:700;text-transform:uppercase;padding:12px 20px;border:3px solid #282828;margin:12px 0">${escapeHtml(label)}</a>`;
}

export function verificationEmail(opts: { name: string | null; email: string; verifyUrl: string }) {
  const who = opts.name || opts.email;
  const subject = "Verify your email";
  const html = shell(subject, `
    <p>Hi ${escapeHtml(who)},</p>
    <p>Confirm your email address to finish setting up your account.</p>
    ${button(opts.verifyUrl, "Verify email")}
    <p style="font-size:0.7rem;color:#999">Or paste this link: ${escapeHtml(opts.verifyUrl)}</p>
  `);
  const text = `Hi ${who},\n\nVerify your email: ${opts.verifyUrl}`;
  return { subject, html, text };
}

export function passwordResetEmail(opts: { name: string | null; email: string; resetUrl: string }) {
  const who = opts.name || opts.email;
  const subject = "Reset your password";
  const html = shell(subject, `
    <p>Hi ${escapeHtml(who)},</p>
    <p>We received a request to reset your password. This link expires soon.</p>
    ${button(opts.resetUrl, "Reset password")}
    <p style="font-size:0.7rem;color:#999">If you didn't request this, you can ignore this email.</p>
    <p style="font-size:0.7rem;color:#999">Or paste this link: ${escapeHtml(opts.resetUrl)}</p>
  `);
  const text = `Hi ${who},\n\nReset your password: ${opts.resetUrl}\n\nIf you didn't request this, ignore this email.`;
  return { subject, html, text };
}
