import { useState, useEffect } from 'react'
import CompareScreen from './components/CompareScreen.jsx'
import LibraryScreen from './components/LibraryScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import BottomNav from './components/BottomNav.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('compare')
  const [pendingLibraryVideo, setPendingLibraryVideo] = useState(null)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('skiviz-theme')
    return saved || 'light'
  })

  useEffect(() => {
    localStorage.setItem('skiviz-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    const saved = localStorage.getItem('skiviz-theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
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
      {/* Top bar */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '0.5px solid var(--border)',
        padding: `calc(8px + var(--safe-top)) 16px 8px`,
        paddingLeft: `calc(16px + var(--safe-left))`,
        paddingRight: `calc(16px + var(--safe-right))`,
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

      {/* Screen content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: activeTab === 'compare' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <CompareScreen pendingLibraryVideo={pendingLibraryVideo} onLibraryVideoConsumed={() => setPendingLibraryVideo(null)} onNavigateToLibrary={() => setActiveTab('library')} />
        </div>
        <div style={{ display: activeTab === 'library' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <LibraryScreen onSelectVideo={handleSelectLibraryVideo} />
        </div>
        <div style={{ display: activeTab === 'settings' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SettingsScreen theme={theme} onThemeChange={setTheme} />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
