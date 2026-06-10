import { useRef, useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer.jsx";

export default function CompareScreen({
  pendingLibraryVideo,
  onLibraryVideoConsumed,
  onNavigateToLibrary,
}) {
  const athleteRef = useRef(null);
  const refRef = useRef(null);
  const [bothPlaying, setBothPlaying] = useState(false);
  const [libraryVideo, setLibraryVideo] = useState(null);
  const [fullscreenPlayer, setFullscreenPlayer] = useState(null);
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    if (pendingLibraryVideo) {
      setLibraryVideo(pendingLibraryVideo);
      onLibraryVideoConsumed?.();
    }
  }, [pendingLibraryVideo]);

  // Detect landscape/portrait changes
  useEffect(() => {
    function update() {
      setIsLandscape(window.innerWidth > window.innerHeight);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // Also listen a moment after orientationchange since dimensions update async
    function delayedUpdate() { setTimeout(update, 150); }
    window.addEventListener("orientationchange", delayedUpdate);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("orientationchange", delayedUpdate);
    };
  }, []);

  // Play both — must be called synchronously from a user-gesture tap
  function handlePlayBoth() {
    // Call play() directly and immediately on both — iOS requires sync gesture chain
    const av = athleteRef.current;
    const rv = refRef.current;
    if (av) {
      const p = av.play();
      if (p !== undefined) p.catch(() => {});
    }
    if (rv) {
      const p = rv.play();
      if (p !== undefined) p.catch(() => {});
    }
    setBothPlaying(true);
  }

  function handlePauseBoth() {
    athleteRef.current?.pause();
    refRef.current?.pause();
    setBothPlaying(false);
  }

  function handleRestartBoth() {
    athleteRef.current?.seek(0);
    refRef.current?.seek(0);
    athleteRef.current?.pause();
    refRef.current?.pause();
    setBothPlaying(false);
  }

  function handleStepBack() {
    const aT = athleteRef.current?.getCurrentTime() ?? 0;
    const rT = refRef.current?.getCurrentTime() ?? 0;
    athleteRef.current?.seek(Math.max(0, aT - 1 / 30));
    refRef.current?.seek(Math.max(0, rT - 1 / 30));
  }

  function handleStepForward() {
    const aT = athleteRef.current?.getCurrentTime() ?? 0;
    const rT = refRef.current?.getCurrentTime() ?? 0;
    athleteRef.current?.seek(aT + 1 / 30);
    refRef.current?.seek(rT + 1 / 30);
  }

  // In landscape on mobile: hide top bar (handled in App), make content scrollable
  const landscapeStyle = isLandscape ? {
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  } : {
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: `8px 8px 0`,
        gap: 6,
        ...landscapeStyle,
      }}
    >
      {/* Players */}
      <div style={{
        display: "flex",
        gap: 6,
        // In landscape allow natural height; in portrait fill available space
        flex: isLandscape ? '0 0 auto' : 1,
        minHeight: isLandscape ? 160 : 0,
        height: isLandscape ? '55vw' : undefined,
      }}>
        <VideoPlayer
          ref={athleteRef}
          label="Athlete"
          accentColor="var(--accent-athlete)"
          dimColor="var(--accent-athlete-dim)"
          onEnterFullscreen={() => setFullscreenPlayer("athlete")}
          isFullscreen={fullscreenPlayer === "athlete"}
          onExitFullscreen={() => setFullscreenPlayer(null)}
        />
        <VideoPlayer
          ref={refRef}
          label="Reference"
          accentColor="var(--accent-ref)"
          dimColor="var(--accent-ref-dim)"
          libraryVideo={libraryVideo}
          onEnterFullscreen={() => setFullscreenPlayer("ref")}
          isFullscreen={fullscreenPlayer === "ref"}
          onExitFullscreen={() => setFullscreenPlayer(null)}
          onSelectFromLibrary={onNavigateToLibrary}
        />
      </div>

      {/* Global controls bar */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexShrink: 0,
          border: "0.5px solid var(--border)",
          marginBottom: 8,
        }}
      >
        <GlobalBtn onClick={handleRestartBoth} title="Restart both">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 8a6 6 0 1 0 1.5-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </GlobalBtn>

        <GlobalBtn onClick={handleStepBack} title="Step back one frame">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 4L5 8l5 4V4z" fill="currentColor"/>
            <rect x="3" y="4" width="1.5" height="8" rx="0.75" fill="currentColor"/>
          </svg>
        </GlobalBtn>

        <button
          onClick={bothPlaying ? handlePauseBoth : handlePlayBoth}
          title={bothPlaying ? "Pause both" : "Play both"}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--accent-global)",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0,
          }}
        >
          {bothPlaying ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="4" height="12" rx="1.5" fill="white"/>
              <rect x="11" y="3" width="4" height="12" rx="1.5" fill="white"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M5 3l11 6-11 6V3z" fill="white"/>
            </svg>
          )}
        </button>

        <GlobalBtn onClick={handleStepForward} title="Step forward one frame">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l5 4-5 4V4z" fill="currentColor"/>
            <rect x="11.5" y="4" width="1.5" height="8" rx="0.75" fill="currentColor"/>
          </svg>
        </GlobalBtn>

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 2px" }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.4px" }}>
          PLAY BOTH
        </span>
      </div>

      {!isLandscape && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingBottom: 4, flexShrink: 0 }}>
          Scrub each video to your desired start point, then tap Play Both
        </div>
      )}
    </div>
  );
}

function GlobalBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "var(--bg-raised)",
        border: "0.5px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-secondary)", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
