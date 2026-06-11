import { useState, useEffect } from "react";
import CompareScreen from "./components/CompareScreen.jsx";
import LibraryScreen from "./components/LibraryScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import BottomNav from "./components/BottomNav.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("compare");
  const [pendingLibraryVideo, setPendingLibraryVideo] = useState(null);

  // Distinguish between a phone/tablet held sideways vs a desktop computer
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    function update() {
      const landscape = window.innerWidth > window.innerHeight;
      const isMobileSize = window.innerWidth <= 1024; // Targets phones and smaller tablets
      setIsMobileLandscape(landscape && isMobileSize);
    }

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    function delayedUpdate() {
      setTimeout(update, 150);
    }
    window.addEventListener("orientationchange", delayedUpdate);

    // Run initial check
    update();

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("orientationchange", delayedUpdate);
    };
  }, []);

  // Nudge mobile browser to hide address bars
  useEffect(() => {
    if (window.scrollY === 0) {
      window.scrollTo(0, 1);
    }
  }, []);

  function handleSelectLibraryVideo(video) {
    setPendingLibraryVideo(video);
    setActiveTab("compare");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // Desktop and mobile portrait stay locked to full viewport height
        height: isMobileLandscape ? "auto" : "100vh",
        minHeight: "100vh",
        background: "var(--bg-base)",
        overflow: isMobileLandscape ? "auto" : "hidden",
      }}
    >
      {/* Screen content workspace wrapper */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: isMobileLandscape ? "none" : 1,
          overflow: isMobileLandscape ? "visible" : "hidden",
          position: "relative",
          height: isMobileLandscape ? "auto" : "100%",
        }}
      >
        <div
          style={{
            display: activeTab === "compare" ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            height: isMobileLandscape ? "auto" : "100%",
          }}
        >
          <CompareScreen
            pendingLibraryVideo={pendingLibraryVideo}
            onLibraryVideoConsumed={() => setPendingLibraryVideo(null)}
            onNavigateToLibrary={() => setActiveTab("library")}
            isMobileLandscape={isMobileLandscape}
          />
        </div>

        <div
          style={{
            display: activeTab === "library" ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            height: "100%",
          }}
        >
          <LibraryScreen onSelectVideo={handleSelectLibraryVideo} />
        </div>

        <div
          style={{
            display: activeTab === "settings" ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            height: "100%",
          }}
        >
          <SettingsScreen />
        </div>
      </div>

      {/* Stuck to the bottom on Desktop/Portrait, flows below on Mobile Landscape */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
