import { useState } from "react";

const VERSION = "0.1.0";

export default function SettingsScreen({
  theme = "light",
  onThemeChange = () => {},
}) {
  const [keepLoopOn, setKeepLoopOn] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 14px 32px",
        paddingLeft: `calc(14px + var(--safe-left))`,
        paddingRight: `calc(14px + var(--safe-right))`,
        paddingBottom: `calc(32px + var(--safe-bottom))`,
      }}
    >
      <Section title="Appearance">
        <SettingRow
          label="Dark theme"
          hint="Switch to dark mode for lower brightness"
        >
          <Toggle
            value={theme === "dark"}
            onChange={(isDark) => onThemeChange(isDark ? "dark" : "light")}
          />
        </SettingRow>
      </Section>

      <Section title="About">
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            padding: "10px 12px",
          }}
        >
          <div>SkiViz v{VERSION}</div>
          <div>Nordic ski technique visualizer</div>
          <div style={{ marginTop: 6 }}>
            Add to your home screen from Safari (iOS) or Chrome (Android) to use
            as a full-screen app.
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 8,
          paddingLeft: 2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: "var(--bg-surface)",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, hint, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderBottom: "0.5px solid var(--border-subtle)",
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
          {label}
        </div>
        {hint && (
          <div
            style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}
          >
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: value ? "var(--accent-athlete)" : "var(--bg-raised)",
        border: `0.5px solid ${value ? "var(--accent-athlete)" : "var(--border)"}`,
        position: "relative",
        flexShrink: 0,
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}
