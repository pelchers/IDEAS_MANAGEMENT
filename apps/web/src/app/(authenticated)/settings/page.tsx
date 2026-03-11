"use client";

import { useState } from "react";

/* ── Toggle state for preferences ── */
interface Preferences {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
}

/* ── Integration data ── */
interface Integration {
  name: string;
  icon: string;
  connected: boolean;
}

const INTEGRATIONS: Integration[] = [
  { name: "GITHUB", icon: "\uD83D\uDC19", connected: true },
  { name: "SLACK", icon: "\uD83D\uDCAC", connected: false },
  { name: "STRIPE", icon: "\uD83D\uDCB3", connected: true },
];

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    soundEffects: false,
  });

  const togglePref = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const prefItems: { key: keyof Preferences; label: string }[] = [
    { key: "darkMode", label: "DARK MODE" },
    { key: "emailNotifications", label: "EMAIL NOTIFICATIONS" },
    { key: "pushNotifications", label: "PUSH NOTIFICATIONS" },
    { key: "soundEffects", label: "SOUND EFFECTS" },
  ];

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="mb-8">
        <h1 className="nb-view-title">SETTINGS</h1>
        <p className="nb-view-subtitle mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
        {/* ── Profile Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">PROFILE</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                DISPLAY NAME
              </label>
              <input
                type="text"
                className="nb-input w-full"
                defaultValue="Jane Doe"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                EMAIL
              </label>
              <input
                type="email"
                className="nb-input w-full"
                defaultValue="jane@example.com"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">
                BIO
              </label>
              <textarea
                className="nb-input nb-textarea w-full"
                defaultValue="Product designer and idea enthusiast. Building the future of collaborative thinking."
                placeholder="Tell us about yourself"
              />
            </div>
            <button type="submit" className="nb-btn nb-btn--primary self-start mt-2">
              SAVE CHANGES
            </button>
          </form>
        </div>

        {/* ── Preferences Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">PREFERENCES</h2>
          <div className="flex flex-col">
            {prefItems.map((item, i) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-4 ${
                  i < prefItems.length - 1
                    ? "border-b-2 border-dashed border-signal-black"
                    : ""
                }`}
              >
                <span className="font-bold text-[0.85rem] uppercase tracking-wider">
                  {item.label}
                </span>
                <label className="nb-toggle">
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={() => togglePref(item.key)}
                  />
                  <span className="nb-toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Integrations Card ── */}
        <div className="nb-card p-8">
          <h2 className="nb-card-title">INTEGRATIONS</h2>
          <div className="flex flex-col gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-signal-black"
              >
                {/* Icon */}
                <div className="text-[1.5rem] w-11 h-11 flex items-center justify-center bg-creamy-milk border-2 border-signal-black shrink-0">
                  {integration.icon}
                </div>
                {/* Name + status */}
                <div className="flex-1">
                  <div className="font-bold text-[0.9rem] uppercase">
                    {integration.name}
                  </div>
                  <div
                    className={`font-mono text-[0.75rem] uppercase ${
                      integration.connected
                        ? "text-malachite"
                        : "text-gray-mid"
                    }`}
                  >
                    {integration.connected ? "Connected" : "Not connected"}
                  </div>
                </div>
                {/* Action button */}
                <button
                  className={`nb-btn nb-btn--small ${
                    integration.connected ? "" : "nb-btn--primary"
                  }`}
                >
                  {integration.connected ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Danger Zone Card ── */}
        <div className="nb-card p-8 border-watermelon">
          <h2 className="nb-card-title text-watermelon border-b-watermelon">
            DANGER ZONE
          </h2>
          <p className="font-mono text-[0.85rem] text-watermelon mb-6 leading-relaxed">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="nb-btn">EXPORT ALL DATA</button>
            <button className="nb-btn nb-btn--danger">DELETE ACCOUNT</button>
          </div>
        </div>
      </div>
    </div>
  );
}
