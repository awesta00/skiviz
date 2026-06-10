import { useState, useEffect } from 'react'
import CompareScreen from './components/CompareScreen.jsx'
import LibraryScreen from './components/LibraryScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import BottomNav from './components/BottomNav.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('compare')
  const [pendingLibraryVideo, setPendingLibraryVideo] = useState(null)
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  )

  useEffect(() => {
    function update() {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    function delayedUpdate() { setTimeout(update, 150) }
    window.addEventListener("orientationchange", delayedUpdate)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
      window.removeEventListener("orientationchange", delayedUpdate)
    }
  }, [])

  // Nudge browser to hide the URL bar when app loads (PWA / mobile)
  useEffect(() => {
    if (window.scrollY === 0) {
      window.scrollTo(0, 1)
    }
  }, [])

  function handleSelectLibraryVideo(video) {
    setPendingLibraryVideo(video)
    setActiveTab('compare')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-base)',
      overflow: 'hidden'
    }}>
      {/* Top bar — hidden in landscape to save space */}
      {!isLandscape && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '0.5px solid var(--border)',
          padding: `calc(8px + var(--safe-top)) 16px 8px`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 3L4 10l6 7M10 3l6 7-6 7" stroke="var(--accent-ref)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px' }}>SkiViz</span>
        </div>
      )}

      {/* Screen content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: activeTab === 'compare' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <CompareScreen
            pendingLibraryVideo={pendingLibraryVideo}
            onLibraryVideoConsumed={() => setPendingLibraryVideo(null)}
            onNavigateToLibrary={() => setActiveTab('library')}
          />
        </div>
        <div style={{ display: activeTab === 'library' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <LibraryScreen onSelectVideo={handleSelectLibraryVideo} />
        </div>
        <div style={{ display: activeTab === 'settings' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SettingsScreen />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
