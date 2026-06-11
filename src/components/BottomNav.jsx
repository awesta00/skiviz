import React from "react";

//Icons
const TABS = [
  {
    id: "compare",
    label: "Compare",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="4"
          width="8"
          height="16"
          rx="2"
          stroke={active ? "var(--accent-ref)" : "currentColor"}
          strokeWidth="1.5"
        />
        <rect
          x="13"
          y="4"
          width="8"
          height="16"
          rx="2"
          stroke={active ? "var(--accent-ref)" : "currentColor"}
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "library",
    label: "Library",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke={active ? "var(--accent-ref)" : "currentColor"}
          strokeWidth="1.5"
        />
        <path
          d="M10 9l5 3-5 3V9z"
          fill={active ? "var(--accent-ref)" : "currentColor"}
        />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          stroke={active ? "var(--accent-ref)" : "currentColor"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          stroke={active ? "var(--accent-ref)" : "currentColor"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      style={{
        background: "var(--bg-surface)",
        borderTop: "0.5px solid var(--border)",
        display: "flex",
        flexShrink: 0,
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "10px 4px 8px",
              color: active ? "var(--accent-ref)" : "var(--text-muted)",
              minHeight: "56px",
              borderTop: `2px solid ${active ? "var(--accent-ref)" : "transparent"}`,
              fontSize: "12px", // Safe fallback to reset the mobile 16px global rule
            }}
          >
            {tab.icon(active)}
            <span
              style={{
                fontSize: "10px", // Explicitly typed string units to strictly override global cascading rules
                fontWeight: 500,
                letterSpacing: "0.3px",
                lineHeight: 1.2,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
