"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserInfo {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface Entitlements {
  plan: string;
  features: string[];
  isAdmin: boolean;
}

/* ------------------------------------------------------------------ */
/*  Settings Page                                                      */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Billing state
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password change state
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setError("Failed to load profile. Please sign in again.");
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setUser(data.user);
        setEntitlements(data.entitlements ?? null);
      } else {
        setError("Unauthorized. Please sign in.");
      }
    } catch {
      setError("Network error loading profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleManageBilling = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();

      if (res.status === 503) {
        setBillingError("Billing is not configured yet. Contact your administrator.");
        return;
      }
      if (res.status === 404) {
        setBillingError("No active subscription found. You are on the free plan.");
        return;
      }
      if (!res.ok) {
        setBillingError(data.error || "Failed to open billing portal.");
        return;
      }
      if (data.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      setBillingError("Network error. Please try again.");
    } finally {
      setBillingLoading(false);
    }
  };

  const roleBadgeColor = (role: string): string => {
    switch (role.toUpperCase()) {
      case "ADMIN": return "nb-badge-watermelon";
      case "PRO": return "nb-badge-amethyst";
      case "MEMBER": return "nb-badge-cornflower";
      default: return "nb-badge-lemon";
    }
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700 }}>
          Loading settings...
        </p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="page-enter" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="brutalist-card" style={{ maxWidth: "400px", textAlign: "center", padding: "var(--space-xl)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--nb-watermelon)", fontWeight: 700 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="view-header">
        <h1 className="view-title">SETTINGS</h1>
      </div>

      <div className="settings-grid">
        {/* ===== PROFILE SECTION ===== */}
        <div className="brutalist-card settings-section">
          <h2 className="card-title">PROFILE</h2>
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                className="form-input"
                value={user?.email ?? ""}
                readOnly
                disabled
                style={{ cursor: "not-allowed", opacity: 0.7 }}
              />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--nb-gray-mid)",
                marginTop: "2px",
              }}>
                Email cannot be changed here.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">ROLE</label>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                <span className={`nb-badge ${roleBadgeColor(user?.role ?? "")}`}>
                  {user?.role?.toUpperCase() ?? "USER"}
                </span>
                {user?.emailVerified && (
                  <span className="nb-badge nb-badge-malachite">
                    VERIFIED
                  </span>
                )}
              </div>
            </div>

            {entitlements && (
              <div className="form-group">
                <label className="form-label">PLAN</label>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}>
                  {entitlements.plan}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===== ACCOUNT SECTION ===== */}
        <div className="brutalist-card settings-section">
          <h2 className="card-title">ACCOUNT</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--nb-gray-mid)",
                margin: "0 0 var(--space-sm) 0",
              }}>
                Manage your password through the authentication provider.
              </p>
              <button
                className="brutalist-btn brutalist-btn--primary"
                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                style={{ alignSelf: "flex-start" }}
              >
                CHANGE PASSWORD
              </button>
              {showPasswordInfo && (
                <div style={{
                  marginTop: "var(--space-sm)",
                  padding: "var(--space-md)",
                  border: "2px dashed var(--nb-black)",
                  backgroundColor: "var(--nb-cream)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                }}>
                  To change your password, sign out and use the
                  &quot;Forgot Password&quot; link on the sign-in page.
                  A reset email will be sent to <strong>{user?.email}</strong>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== BILLING SECTION ===== */}
        <div className="brutalist-card settings-section">
          <h2 className="card-title">BILLING</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {entitlements && (
              <div className="form-group">
                <label className="form-label">CURRENT PLAN</label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}>
                  <span className={`nb-badge ${
                    entitlements.plan === "free"
                      ? "nb-badge-lemon"
                      : "nb-badge-amethyst"
                  }`}>
                    {entitlements.plan.toUpperCase()}
                  </span>
                  {entitlements.features.length > 0 && (
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "var(--nb-gray-mid)",
                    }}>
                      {entitlements.features.length} feature{entitlements.features.length !== 1 ? "s" : ""} enabled
                    </span>
                  )}
                </div>
              </div>
            )}

            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--nb-gray-mid)",
              margin: 0,
            }}>
              Manage your subscription, update payment methods, and view invoices through the Stripe billing portal.
            </p>

            <button
              className="brutalist-btn brutalist-btn--primary"
              onClick={handleManageBilling}
              disabled={billingLoading}
              style={{ alignSelf: "flex-start" }}
            >
              {billingLoading ? "OPENING..." : "MANAGE BILLING"}
            </button>

            {billingError && (
              <div style={{
                padding: "var(--space-md)",
                border: "2px dashed var(--nb-watermelon)",
                backgroundColor: "var(--nb-cream)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--nb-watermelon)",
                fontWeight: 700,
              }}>
                {billingError}
              </div>
            )}
          </div>
        </div>

        {/* ===== DANGER ZONE ===== */}
        <div className="brutalist-card settings-section settings-danger">
          <h2 className="card-title">DANGER ZONE</h2>
          <p className="danger-text">
            These actions are irreversible. Proceed with extreme caution.
          </p>
          <div className="danger-actions">
            {!showDeleteConfirm ? (
              <button
                className="brutalist-btn brutalist-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                DELETE ACCOUNT
              </button>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
                padding: "var(--space-md)",
                border: "3px solid var(--nb-watermelon)",
                backgroundColor: "var(--nb-cream)",
              }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  margin: 0,
                }}>
                  Account deletion is not available through self-service.
                  Please contact support to request account deletion.
                </p>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <button
                    className="brutalist-btn brutalist-btn--small"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
