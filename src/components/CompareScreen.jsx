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
  const [athleteVideo, setAthleteVideo] = useState(null);
  const [fullscreenPlayer, setFullscreenPlayer] = useState(null);

  useEffect(() => {
    if (pendingLibraryVideo) {
      setLibraryVideo(pendingLibraryVideo);
      onLibraryVideoConsumed?.();
    }
  }, [pendingLibraryVideo]);

  useEffect(() => {
    if (!fullscreenPlayer && athleteVideo) {
      athleteRef.current?.restoreVideo(athleteVideo)
    }
  }, [fullscreenPlayer, athleteVideo]);

  function handlePlayBoth() {
    athleteRef.current?.play();
    refRef.current?.play();
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

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: fullscreenPlayer ? `0 var(--safe-left) 0 var(--safe-right)` : `8px calc(8px + var(--safe-left)) 0 calc(8px + var(--safe-right))`,
        gap: fullscreenPlayer ? 0 : 6,
      }}
    >
      {fullscreenPlayer ? (
        <VideoPlayer
          ref={fullscreenPlayer === "athlete" ? athleteRef : refRef}
          label={fullscreenPlayer === "athlete" ? "Athlete" : "Reference"}
          accentColor={fullscreenPlayer === "athlete" ? "var(--accent-athlete)" : "var(--accent-ref)"}
          dimColor={fullscreenPlayer === "athlete" ? "var(--accent-athlete-dim)" : "var(--accent-ref-dim)"}
          libraryVideo={fullscreenPlayer === "ref" ? libraryVideo : fullscreenPlayer === "athlete" ? athleteVideo : undefined}
          onExitFullscreen={() => setFullscreenPlayer(null)}
          isFullscreen={true}
        />
      ) : (
        <>
          <div style={{ flex: 1, display: "flex", gap: 6, minHeight: 0 }}>
            <VideoPlayer
              ref={athleteRef}
              label="Athlete"
              accentColor="var(--accent-athlete)"
              dimColor="var(--accent-athlete-dim)"
              onEnterFullscreen={() => setFullscreenPlayer("athlete")}
              onVideoChange={(video) => setAthleteVideo({ file: video.src, title: video.videoTitle })}
            />
            <VideoPlayer
              ref={refRef}
              label="Reference"
              accentColor="var(--accent-ref)"
              dimColor="var(--accent-ref-dim)"
              libraryVideo={libraryVideo}
              onEnterFullscreen={() => setFullscreenPlayer("ref")}
              onSelectFromLibrary={onNavigateToLibrary}
            />
          </div>

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
          marginBottom: fullscreenPlayer ? 0 : 8,
          marginTop: fullscreenPlayer ? 8 : 0,
        }}
      >
        <GlobalBtn onClick={handleRestartBoth} title="Restart both">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 8a6 6 0 1 0 1.5-3.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M2 4v4h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </GlobalBtn>

        <GlobalBtn onClick={handleStepBack} title="Step back one frame">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 4L5 8l5 4V4z" fill="currentColor" />
            <rect
              x="3"
              y="4"
              width="1.5"
              height="8"
              rx="0.75"
              fill="currentColor"
            />
          </svg>
        </GlobalBtn>

        <button
          onClick={bothPlaying ? handlePauseBoth : handlePlayBoth}
          title={bothPlaying ? "Pause both" : "Play both"}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--accent-global)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {bothPlaying ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="4" height="12" rx="1.5" fill="white" />
              <rect x="11" y="3" width="4" height="12" rx="1.5" fill="white" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path d="M5 3l11 6-11 6V3z" fill="white" />
            </svg>
          )}
        </button>

        <GlobalBtn onClick={handleStepForward} title="Step forward one frame">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 4l5 4-5 4V4z" fill="currentColor" />
            <rect
              x="11.5"
              y="4"
              width="1.5"
              height="8"
              rx="0.75"
              fill="currentColor"
            />
          </svg>
        </GlobalBtn>

        <div
          style={{
            width: 1,
            height: 24,
            background: "var(--border)",
            margin: "0 2px",
          }}
        />

        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.4px",
          }}
        >
          PLAY BOTH
        </span>
      </div>

      </>
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
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--bg-raised)",
        border: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
