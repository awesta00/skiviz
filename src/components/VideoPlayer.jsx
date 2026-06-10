import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react'

const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

const VideoPlayer = forwardRef(function VideoPlayer(
  { label, accentColor, dimColor, onUpload, libraryVideo, onTimeUpdate, onEnterFullscreen, onExitFullscreen, isFullscreen, onSelectFromLibrary },
  ref
) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1.0)
  const [loop, setLoop] = useState(false)
  const [src, setSrc] = useState(null)
  const [videoTitle, setVideoTitle] = useState(null)
  const scrubbing = useRef(false)
  // Store blob URL so we can revoke it when replaced
  const blobUrlRef = useRef(null)

  // Expose controls to parent via ref
  useImperativeHandle(ref, () => ({
    // iOS Safari requires play() to be called synchronously from a user gesture
    // when "play both" is triggered. We return the promise so the caller can handle it.
    play: () => {
      const v = videoRef.current
      if (!v) return
      const p = v.play()
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(true)
      }
    },
    pause: () => {
      videoRef.current?.pause()
      setIsPlaying(false)
    },
    seek: (t) => { if (videoRef.current) videoRef.current.currentTime = t },
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    getDuration: () => videoRef.current?.duration ?? 0,
    isPlaying: () => !videoRef.current?.paused,
  }))

  // When a library video is passed in via props
  useEffect(() => {
    if (libraryVideo) {
      setSrc(libraryVideo.file)
      setVideoTitle(libraryVideo.title)
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [libraryVideo])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.loop = loop
  }, [loop])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    }
  }, [])

  function handleTimeUpdate() {
    if (!scrubbing.current && videoRef.current) {
      const t = videoRef.current.currentTime
      setCurrentTime(t)
      onTimeUpdate?.(t)
    }
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setDuration(videoRef.current.duration ?? 0)
      setCurrentTime(0)
      // Apply speed after load
      videoRef.current.playbackRate = speed
    }
  }

  function handleEnded() {
    setIsPlaying(false)
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v || !src) return
    if (v.paused) {
      const p = v.play()
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(true)
      }
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  function handleScrub(e) {
    const v = videoRef.current
    if (!v || !duration) return
    const t = parseFloat(e.target.value)
    v.currentTime = t
    setCurrentTime(t)
  }

  function handleScrubStart() { scrubbing.current = true }
  function handleScrubEnd() { scrubbing.current = false }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Revoke old blob URL if any
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setSrc(url)
    setVideoTitle(file.name.replace(/\.[^.]+$/, ''))
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    onUpload?.()
    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  function cycleSpeed() {
    const idx = SPEEDS.indexOf(speed)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    setSpeed(next)
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const isEmpty = !src

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      minWidth: 0,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: `0.5px solid ${isEmpty ? 'var(--border-subtle)' : accentColor + '55'}`,
    }}>
      {/* Player label row */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '5px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '0.5px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: accentColor
        }}>{label}</span>
        {videoTitle && (
          <span style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            maxWidth: '55%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{videoTitle}</span>
        )}
      </div>

      {/* Video area */}
      <div style={{
        flex: 1,
        background: '#000',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
      }}>
        {src ? (
          <video
            ref={videoRef}
            src={src}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            webkit-playsinline="true"
            preload="metadata"
          />
        ) : (
          label === 'Athlete' ? (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 16 }}>
              <input type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={handleFileUpload} />
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--bg-raised)',
                border: `0.5px solid ${accentColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 12V4M9 4L6 7M9 4l3 3" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 14h12" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                Tap to upload video
              </span>
            </label>
          ) : (
            <button onClick={onSelectFromLibrary} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 16, background: 'none', border: 'none', color: 'inherit', width: '100%' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--bg-raised)',
                border: `0.5px solid ${accentColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 5-10 5V4z" fill={accentColor}/>
                </svg>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                Select from library
              </span>
            </button>
          )
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '5px 6px 4px',
        flexShrink: 0,
        borderTop: '0.5px solid var(--border-subtle)',
      }}>
        {/* Scrubber */}
        <div style={{ position: 'relative', marginBottom: 3 }}>
          <div style={{
            position: 'absolute',
            left: 0, top: '50%', transform: 'translateY(-50%)',
            height: 4, borderRadius: 2,
            background: accentColor,
            width: duration ? `${(currentTime / duration) * 100}%` : '0%',
            pointerEvents: 'none',
            zIndex: 1
          }} />
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
            style={{ position: 'relative', zIndex: 2, background: 'transparent' }}
          />
        </div>

        {/* Controls row — all on one line, compact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            disabled={!src}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: src ? accentColor : 'var(--bg-raised)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              opacity: src ? 1 : 0.4,
              border: 'none',
            }}
          >
            {isPlaying
              ? <PauseIcon color={src ? '#fff' : 'var(--text-muted)'} />
              : <PlayIcon color={src ? '#fff' : 'var(--text-muted)'} />
            }
          </button>

          {/* Timecode */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-secondary)',
            flex: 1,
            minWidth: 0,
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>
            {formatTime(currentTime)}/{formatTime(duration)}
          </span>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            style={{
              background: 'var(--bg-raised)',
              border: `0.5px solid ${accentColor}55`,
              borderRadius: 4,
              padding: '2px 4px',
              fontSize: 9,
              color: accentColor,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {speed}×
          </button>

          {/* Loop */}
          <button
            onClick={() => setLoop(l => !l)}
            style={{
              background: loop ? accentColor + '22' : 'var(--bg-raised)',
              border: `0.5px solid ${loop ? accentColor : 'var(--border)'}`,
              borderRadius: 4,
              padding: '2px 5px',
              fontSize: 11,
              color: loop ? accentColor : 'var(--text-muted)',
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
                background: 'var(--bg-raised)',
                border: `0.5px solid ${accentColor}55`,
                borderRadius: 4,
                padding: '3px 4px',
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isFullscreen ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M4 1H1v3h1V2h2V1zm4 0h3v3h-1V2H8V1zM1 8v3h3v-1H2V8H1zm10 0v3H8v-1h2V8h1z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1h3v1H2v2H1V1zm7 0h3v3h-1V2H8V1zM1 8v3h3v-1H2V8H1zm10 0v3H8v-1h2V8h1z" fill="currentColor"/>
                </svg>
              )}
            </button>
          )}

          {/* Replace video (athlete only) */}
          {label === 'Athlete' && src && (
            <label style={{
              background: 'var(--bg-raised)',
              border: `0.5px solid ${accentColor}55`,
              borderRadius: 4,
              padding: '2px 5px',
              fontSize: 9,
              color: accentColor,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
              <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              ↑
            </label>
          )}
        </div>
      </div>
    </div>
  )
})

function PlayIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 2l7 4-7 4V2z" fill={color} />
    </svg>
  )
}

function PauseIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="3" height="8" rx="1" fill={color} />
      <rect x="7" y="2" width="3" height="8" rx="1" fill={color} />
    </svg>
  )
}

export default VideoPlayer
