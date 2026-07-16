import type { IntegrationProvider } from "@/generated/prisma";
import type { IntegrationProviderDef, IntegrationStatusDTO } from "./types";
import { emailProvider } from "./providers/email";
import { gmailProvider } from "./providers/gmail";
import { googleCalendarProvider } from "./providers/google-calendar";
import { vscodeProvider } from "./providers/vscode";
import { listIntegrations } from "./store";

/** All registered providers, in display order. Add a provider = add a module here. */
const PROVIDERS: IntegrationProviderDef[] = [
  emailProvider,
  gmailProvider,
  googleCalendarProvider,
  vscodeProvider,
];

const BY_ID = new Map<IntegrationProvider, IntegrationProviderDef>(PROVIDERS.map((p) => [p.id, p]));

export function listProviders(): IntegrationProviderDef[] {
  return PROVIDERS;
}

export function getProvider(id: string): IntegrationProviderDef | undefined {
  return BY_ID.get(id as IntegrationProvider);
}

/** Build the per-user status list for the Settings → Integrations UI. */
export async function getIntegrationStatuses(userId: string): Promise<IntegrationStatusDTO[]> {
  const rows = await listIntegrations(userId);
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  return PROVIDERS.map((p) => {
    const row = byProvider.get(p.id);
    const connected = row?.status === "CONNECTED";
    return {
      id: p.id,
      label: p.label,
      description: p.description,
      kind: p.kind,
      capabilities: p.capabilities,
      setupHint: p.setupHint,
      configured: p.isConfigured(),
      connected,
      status: row?.status ?? "DISCONNECTED",
      accountLabel: row?.accountLabel ?? null,
      connectedAt: row?.connectedAt ? row.connectedAt.toISOString() : null,
    };
  });
}
