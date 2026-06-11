import { useState, useEffect } from "react";
import CompareScreen from "./components/CompareScreen.jsx";
import LibraryScreen from "./components/LibraryScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import BottomNav from "./components/BottomNav.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("compare");
  const [pendingLibraryVideo, setPendingLibraryVideo] = useState(null);
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight,
  );

  // detect device rotation (landscape, portrait) - support for IOS + android + laptops
  useEffect(() => {
    //computer
    function update() {
      setIsLandscape(window.innerWidth > window.innerHeight);
    }
    //android
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    //ios
    function delayedUpdate() {
      setTimeout(update, 150);
    }
    window.addEventListener("orientationchange", delayedUpdate);
    //prevent from running functions in background
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("orientationchange", delayedUpdate);
    };
  }, []);

  //Nudge browser to hide search bar (mobile)
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
        height: "100%",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}
    >
      {/* Screen content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            display: activeTab === "compare" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <CompareScreen
            pendingLibraryVideo={pendingLibraryVideo}
            onLibraryVideoConsumed={() => setPendingLibraryVideo(null)}
            onNavigateToLibrary={() => setActiveTab("library")}
          />
        </div>
        <div
          style={{
            display: activeTab === "library" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <LibraryScreen onSelectVideo={handleSelectLibraryVideo} />
        </div>
        <div
          style={{
            display: activeTab === "settings" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <SettingsScreen />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
