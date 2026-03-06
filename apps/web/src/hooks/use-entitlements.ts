"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";
import React from "react";

interface EntitlementData {
  plan: string;
  features: string[];
  isAdmin: boolean;
}

interface EntitlementContextValue {
  /** Current subscription plan */
  plan: string;
  /** List of active feature entitlements */
  features: string[];
  /** Whether the user is an admin (bypasses all gates) */
  isAdmin: boolean;
  /** Whether entitlements are still loading */
  loading: boolean;
  /** Check if a specific feature is available */
  hasFeature: (feature: string) => boolean;
  /** Refresh entitlements from the server */
  refresh: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextValue>({
  plan: "FREE",
  features: [],
  isAdmin: false,
  loading: true,
  hasFeature: () => false,
  refresh: async () => {},
});

/**
 * Provider component that fetches and provides entitlement data.
 * Wrap your app layout with this to enable useEntitlements() throughout.
 */
export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EntitlementData>({
    plan: "FREE",
    features: [],
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        if (json.entitlements) {
          setData(json.entitlements);
        }
      }
    } catch {
      // Network error — keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasFeature = useCallback(
    (feature: string) => {
      if (data.isAdmin) return true;
      return data.features.includes(feature);
    },
    [data]
  );

  const value: EntitlementContextValue = {
    plan: data.plan,
    features: data.features,
    isAdmin: data.isAdmin,
    loading,
    hasFeature,
    refresh,
  };

  return React.createElement(EntitlementContext.Provider, { value }, children);
}

/**
 * Hook to access entitlement data in client components.
 * Must be used within an EntitlementProvider.
 *
 * @example
 * ```tsx
 * const { hasFeature, plan } = useEntitlements();
 *
 * if (!hasFeature("ai_chat")) {
 *   return <UpgradePrompt />;
 * }
 * ```
 */
export function useEntitlements(): EntitlementContextValue {
  return useContext(EntitlementContext);
}
