import { useState, useEffect } from "react";

export default function LibraryScreen({ onSelectVideo }) {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [activeTags, setActiveTags] = useState(new Set());
  const [showTagFilter, setShowTagFilter] = useState(false);

  useEffect(() => {
    fetch("/library.json")
      .then((r) => r.json())
      .then((data) => {
        setLibrary(data);
        const cats = [...new Set(data.map((v) => v.category))];
        if (cats.length) setOpenCategory(cats[0]);
        setLoading(false);
      })
      .catch(() => {
        setError(
          "Could not load library. Make sure library.json is in the /public folder.",
        );
        setLoading(false);
      });
  }, []);

  const allTags = [...new Set(library.flatMap((v) => v.tags ?? []))].sort();

  const filtered =
    activeTags.size === 0
      ? library
      : library.filter((v) =>
          [...activeTags].every((t) => v.tags?.includes(t)),
        );

  const categories = [...new Set(library.map((v) => v.category))];

  function toggleTag(tag) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function clearTags() {
    setActiveTags(new Set());
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          padding: `8px 12px`,
          paddingLeft: `calc(12px + var(--safe-left))`,
          paddingRight: `calc(12px + var(--safe-right))`,
          background: "var(--bg-surface)",
          borderBottom: "0.5px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: showTagFilter ? 8 : 0,
          }}
        >
          <button
            onClick={() => setShowTagFilter((s) => !s)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: showTagFilter
                ? "var(--accent-ref)"
                : "var(--bg-raised)",
              color: showTagFilter ? "white" : "var(--text-secondary)",
              border: `0.5px solid ${showTagFilter ? "var(--accent-ref)" : "var(--border)"}`,
              borderRadius: "var(--radius-md)",
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 3h12M3 7h8M5 11h4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            Filter by tag
            {activeTags.size > 0 && (
              <span
                style={{
                  background: "white",
                  color: "var(--accent-ref)",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "0 5px",
                  lineHeight: "16px",
                }}
              >
                {activeTags.size}
              </span>
            )}
          </button>
          {activeTags.size > 0 && (
            <button
              onClick={clearTags}
              style={{
                fontSize: 12,
                color: "var(--accent-global)",
                background: "none",
                border: "none",
                padding: "4px 2px",
              }}
            >
              Clear all
            </button>
          )}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            {filtered.length} video{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showTagFilter && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.map((tag) => {
              const active = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    background: active
                      ? "var(--accent-ref)"
                      : "var(--bg-raised)",
                    color: active ? "white" : "var(--text-secondary)",
                    border: `0.5px solid ${active ? "var(--accent-ref)" : "var(--border)"}`,
                    cursor: "pointer",
                    minHeight: "36px",
                    minWidth: "36px",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Video list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px 16px",
          paddingLeft: `calc(12px + var(--safe-left))`,
          paddingRight: `calc(12px + var(--safe-right))`,
          paddingBottom: `calc(16px + var(--safe-bottom))`,
        }}
      >
        {loading && (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: 32,
            }}
          >
            Loading library…
          </div>
        )}

        {error && (
          <div
            style={{
              color: "var(--accent-global)",
              fontSize: 13,
              padding: 16,
              background: "var(--bg-raised)",
              borderRadius: "var(--radius-md)",
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            {error}
          </div>
        )}

        {!loading && activeTags.size > 0 && (
          <>
            {filtered.length === 0 && (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  textAlign: "center",
                  padding: 32,
                }}
              >
                No videos match all selected tags
              </div>
            )}
            {filtered.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                activeTags={activeTags}
              />
            ))}
          </>
        )}

        {!loading &&
          activeTags.size === 0 &&
          categories.map((cat) => {
            const videos = filtered.filter((v) => v.category === cat);
            const isOpen = openCategory === cat;
            return (
              <div key={cat} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 10px",
                    background: "var(--bg-surface)",
                    border: "0.5px solid var(--border)",
                    borderRadius: isOpen
                      ? "var(--radius-md) var(--radius-md) 0 0"
                      : "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: "left",
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>
                      {videos.length} video{videos.length !== 1 ? "s" : ""}
                    </span>
                    <span
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "none",
                        display: "inline-block",
                        transition: "transform 0.15s",
                      }}
                    >
                      ▾
                    </span>
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      border: "0.5px solid var(--border)",
                      borderTop: "none",
                      borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    {videos.map((video, i) => (
                      <VideoRow
                        key={video.id}
                        video={video}
                        onSelect={onSelectVideo}
                        noBorderTop={i === 0}
                        activeTags={activeTags}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function VideoRow({ video, onSelect, noBorderTop, activeTags }) {
  return (
    <button
      onClick={() => onSelect(video)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        background: "var(--bg-surface)",
        borderTop: noBorderTop ? "none" : "0.5px solid var(--border-subtle)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 64,
          height: 42,
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-raised)",
          border: "0.5px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 4l10 5-10 5V4z" fill="var(--text-muted)" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          {video.title}
        </div>
        {video.tags && video.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 3,
            }}
          >
            {video.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: activeTags?.has(tag)
                    ? "var(--accent-ref-dim)"
                    : "var(--bg-raised)",
                  color: activeTags?.has(tag)
                    ? "var(--accent-ref)"
                    : "var(--text-muted)",
                  border: `0.5px solid ${activeTags?.has(tag) ? "var(--accent-ref)44" : "var(--border)"}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {video.duration && (
          <div
            style={{
              fontSize: 11,
              color: "var(--accent-ref)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {video.duration}
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          background: "var(--bg-raised)",
          border: "0.5px solid var(--accent-ref)55",
          borderRadius: "var(--radius-sm)",
          padding: "4px 8px",
          fontSize: 12,
          color: "var(--accent-ref)",
          fontWeight: 500,
          alignSelf: "center",
        }}
      >
        Use →
      </div>
    </button>
  );
}
