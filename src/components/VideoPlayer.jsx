import {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const VideoPlayer = forwardRef(function VideoPlayer(
  {
    label,
    accentColor,
    dimColor,
    onUpload,
    libraryVideo,
    onTimeUpdate,
    onEnterFullscreen,
    onExitFullscreen,
    isFullscreen,
    onSelectFromLibrary,
    onVideoChange,
    isMobile,
  },
  ref,
) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [src, setSrc] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);
  const scrubbing = useRef(false);

  // Expose controls to parent via ref
  useImperativeHandle(ref, () => ({
    play: () => {
      const v = videoRef.current;
      if (!v) return Promise.resolve();
      const p = v.play();
      if (p) {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return p ?? Promise.resolve();
    },
    pause: () => {
      videoRef.current?.pause();
      setIsPlaying(false);
    },
    seek: (t) => {
      if (videoRef.current) videoRef.current.currentTime = t;
    },
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    getDuration: () => videoRef.current?.duration ?? 0,
    isPlaying: () => !videoRef.current?.paused,
    getSrc: () => src,
    getVideoTitle: () => videoTitle,
    restoreVideo: (video) => {
      if (video?.file && video?.title) {
        setSrc(video.file);
        setVideoTitle(video.title);
      }
    },
  }));

  // When a library video is passed in via props
  useEffect(() => {
    if (libraryVideo) {
      setSrc(libraryVideo.file);
      setVideoTitle(libraryVideo.title);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [libraryVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = loop;
  }, [loop]);

  // Safari black video fix: when exiting/entering fullscreen, force a repaint
  // by briefly toggling the src or seeking to current time after a tick.
  const prevFullscreen = useRef(isFullscreen);
  useEffect(() => {
    const changed = prevFullscreen.current !== isFullscreen;
    prevFullscreen.current = isFullscreen;
    if (!changed) return;
    const v = videoRef.current;
    if (!v || !src) return;

    const wasPlaying = !v.paused;
    const savedTime = v.currentTime;

    // Small delay lets the DOM re-layout before we poke the video
    setTimeout(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = savedTime;
      // Force a repaint on Safari by toggling display
      videoRef.current.style.display = "none";
      // eslint-disable-next-line no-unused-expressions
      videoRef.current.offsetHeight; // trigger reflow
      videoRef.current.style.display = "";
      if (wasPlaying) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }, 80);
  }, [isFullscreen, src]);

  function handleTimeUpdate() {
    if (!scrubbing.current && videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
    }
  }

  function handleLoadedMetadata() {
    setDuration(videoRef.current?.duration ?? 0);
    setCurrentTime(0);
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }

  function stepFrame(direction) {
    const v = videoRef.current;
    if (!v || !src) return;
    if (!v.paused) {
      v.pause();
      setIsPlaying(false);
    }
    const frameTime = 1 / 30;
    let newTime = v.currentTime + direction * frameTime;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    v.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate?.(newTime);
  }

  function handleScrub(e) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = parseFloat(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  }

  function handleScrubStart() {
    scrubbing.current = true;
  }
  function handleScrubEnd() {
    scrubbing.current = false;
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setVideoTitle(file.name.replace(/\.[^.]+$/, ""));
    setIsPlaying(false);
    setCurrentTime(0);
    onUpload?.();
  }

  function cycleSpeed() {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  }

  const isEmpty = !src;

  // On mobile shrink compact buttons to keep them all visible
  const btnSize = isMobile ? 20 : 22;
  const iconSize = isMobile ? 10 : 12;
  const playBtnSize = isMobile ? 24 : 28;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        minWidth: 0,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: `0.5px solid ${isEmpty ? "var(--border-subtle)" : accentColor + "55"}`,
      }}
    >
      {/* Player label row */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "5px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: accentColor,
          }}
        >
          {label}
        </span>
        {videoTitle && (
          <span
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {videoTitle}
          </span>
        )}
      </div>

      {/* Video area */}
      <div
        style={{
          flex: 1,
          background: "#000",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        {src ? (
          <video
            ref={videoRef}
            src={src}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            playsInline
            preload="metadata"
            // Safari: prevent native fullscreen takeover
            x-webkit-airplay="deny"
          />
        ) : (
          <>
            {label === "Athlete" ? (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: 16,
                }}
              >
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--bg-raised)",
                    border: `0.5px solid ${accentColor}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 12V4M9 4L6 7M9 4l3 3"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 14h12"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  Tap to upload video
                </span>
              </label>
            ) : (
              <button
                onClick={onSelectFromLibrary}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: 16,
                  background: "none",
                  border: "none",
                  color: "inherit",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--bg-raised)",
                    border: `0.5px solid ${accentColor}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 12V4M9 4L6 7M9 4l3 3"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 14h12"
                      stroke={accentColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  Select from library
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "6px 8px 5px",
          flexShrink: 0,
          borderTop: "0.5px solid var(--border-subtle)",
        }}
      >
        {/* Scrubber */}
        <div style={{ position: "relative", marginBottom: 4 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: 4,
              borderRadius: 2,
              background: accentColor,
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={handleScrub}
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            onMouseUp={handleScrubEnd}
            onTouchEnd={handleScrubEnd}
            style={{
              position: "relative",
              zIndex: 2,
              background: "transparent",
            }}
          />
        </div>

        {/* Time + buttons row — horizontally scrollable on mobile so nothing gets clipped */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 4 : 6,
            overflowX: isMobile ? "auto" : "visible",
            // Hide scrollbar visually but keep it functional
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            disabled={!src}
            style={{
              width: playBtnSize,
              height: playBtnSize,
              borderRadius: "50%",
              background: src ? accentColor : "var(--bg-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              opacity: src ? 1 : 0.4,
            }}
          >
            {isPlaying ? (
              <PauseIcon
                color={src ? "#000" : "var(--text-muted)"}
                size={isMobile ? 10 : 12}
              />
            ) : (
              <PlayIcon
                color={src ? "#000" : "var(--text-muted)"}
                size={isMobile ? 10 : 12}
              />
            )}
          </button>

          {/* Individual Frame Step Back */}
          <button
            onClick={() => stepFrame(-1)}
            disabled={!src}
            title="Step back 1 frame"
            style={{
              width: btnSize,
              height: btnSize,
              background: "var(--bg-raised)",
              border: `0.5px solid ${accentColor}55`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
              opacity: src ? 1 : 0.4,
              cursor: src ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <svg
              width={iconSize}
              height={iconSize}
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
          </button>

          {/* Individual Frame Step Forward */}
          <button
            onClick={() => stepFrame(1)}
            disabled={!src}
            title="Step forward 1 frame"
            style={{
              width: btnSize,
              height: btnSize,
              background: "var(--bg-raised)",
              border: `0.5px solid ${accentColor}55`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
              opacity: src ? 1 : 0.4,
              cursor: src ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            <svg
              width={iconSize}
              height={iconSize}
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
          </button>

          {/* Timecode */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: isMobile ? 9 : 10,
              color: "var(--text-secondary)",
              flex: 1,
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
              minWidth: isMobile ? 64 : "auto",
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            style={{
              background: "var(--bg-raised)",
              border: `0.5px solid ${accentColor}55`,
              borderRadius: 4,
              padding: isMobile ? "2px 4px" : "2px 6px",
              fontSize: isMobile ? 9 : 10,
              color: accentColor,
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {speed}×
          </button>

          {/* Loop */}
          <button
            onClick={() => setLoop((l) => !l)}
            style={{
              background: loop ? dimColor + "55" : "var(--bg-raised)",
              border: `0.5px solid ${loop ? accentColor : "var(--border)"}`,
              borderRadius: 4,
              padding: isMobile ? "2px 4px" : "2px 6px",
              fontSize: isMobile ? 9 : 10,
              color: loop ? accentColor : "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            ↻
          </button>

          {/* Fullscreen */}
          {src && (
            <button
              onClick={isFullscreen ? onExitFullscreen : onEnterFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              style={{
                background: "var(--bg-raised)",
                border: `0.5px solid ${accentColor}55`,
                borderRadius: 4,
                padding: isMobile ? "2px 4px" : "2px 6px",
                fontSize: isMobile ? 9 : 10,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isFullscreen ? (
                <svg
                  width={isMobile ? 8 : 10}
                  height={isMobile ? 8 : 10}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2h3v1H3v2H2V2zm5 0h3v3h-1V3h-2V2zM2 7v2h2v1H2v-3zm7 0v3H7v-1h2V7h1z"
                    fill={accentColor}
                  />
                </svg>
              ) : (
                <svg
                  width={isMobile ? 8 : 10}
                  height={isMobile ? 8 : 10}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1h4v1H2v3H1V1zm6 0h4v4h-1V2h-3V1zM1 7v3h3v-1H2v-2H1zm10 0v2h-2v1h3V7h-1z"
                    fill={accentColor}
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Upload button for athlete panel */}
        {label === "Athlete" && (
          <label
            style={{
              display: "block",
              marginTop: 5,
              textAlign: "center",
              fontSize: 10,
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px 0",
            }}
          >
            <input
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            {src ? "↑ replace video" : ""}
          </label>
        )}
      </div>
    </div>
  );
});

function PlayIcon({ color, size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 2l7 4-7 4V2z" fill={color} />
    </svg>
  );
}

function PauseIcon({ color, size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="3" height="8" rx="1" fill={color} />
      <rect x="7" y="2" width="3" height="8" rx="1" fill={color} />
    </svg>
  );
}

export default VideoPlayer;
