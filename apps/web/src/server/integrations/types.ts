import type { IntegrationProvider } from "@/generated/prisma";

export type { IntegrationProvider };

/** How a provider is connected. */
export type IntegrationKind = "oauth" | "apiKey" | "local";

export interface ExchangeResult {
  accountLabel?: string;
  scopes?: string[];
  /** Provider config to persist (will be encrypted at rest). */
  config: Record<string, unknown>;
}

export interface AuthUrlContext {
  userId: string;
  redirectUri: string;
  state: string;
}

/**
 * A provider definition. Concrete providers (email/gmail/calendar/vscode)
 * implement this. Everything that needs external creds is gated behind
 * isConfigured() so the UI can render a graceful "not configured" state and the
 * code paths stay prod-ready before keys are added.
 */
export interface IntegrationProviderDef {
  id: IntegrationProvider;
  label: string;
  description: string;
  kind: IntegrationKind;
  /** Human-readable capability tags shown in the UI. */
  capabilities: string[];
  /** Docs / setup pointer shown when not configured. */
  setupHint?: string;

  /** True when the server has the env/creds this provider needs to function. */
  isConfigured(): boolean;

  /** oauth: build the provider consent URL to redirect the user to. */
  buildAuthUrl?(ctx: AuthUrlContext): string;
  /** oauth: exchange the callback code for tokens/config to store. */
  exchangeCode?(ctx: { code: string; redirectUri: string }): Promise<ExchangeResult>;
}

/** Public, serialisable view of a provider + the caller's connection state. */
export interface IntegrationStatusDTO {
  id: IntegrationProvider;
  label: string;
  description: string;
  kind: IntegrationKind;
  capabilities: string[];
  setupHint?: string;
  configured: boolean; // server has creds
  connected: boolean; // this user has an active connection
  status: string;
  accountLabel: string | null;
  connectedAt: string | null;
}
