"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Shown at the top of the dashboard when the user hasn't set a display name yet.
 * Dismissible for the session (sessionStorage). Prompts profile setup so the
 * user appears properly in Explore, Friends, and Groups.
 */
export function ProfileSetupBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("im_profile_prompt_dismissed") === "1") {
      return;
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.user && !data.user.displayName) setShow(true);
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem("im_profile_prompt_dismissed", "1");
    setShow(false);
  };

  return (
    <div
      style={{
        border: "3px solid #282828",
        boxShadow: "4px 4px 0 #FF5E54",
        backgroundColor: "#FFF4E6",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
      data-testid="profile-setup-banner"
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase" }}>
          Finish setting up your profile
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
          Add a display name and bio so others can find you in Explore, Friends, and Groups.
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <Link href="/profile" className="nb-btn nb-btn--primary nb-btn--small">SET UP PROFILE</Link>
        <button className="nb-btn nb-btn--small" onClick={dismiss}>DISMISS</button>
      </div>
    </div>
  );
}
