import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FilterBar from "./components/FilterBar";
import WallpaperModal from "./components/WallpaperModal";
import GenerateModal from "./components/GenerateModal";
import ModerationDashboard from "./components/ModerationDashboard";
import UploadWizard from "./components/UploadWizard";
import PremiumModal from "./components/PremiumModal";
import { Wallpaper, FilterState } from "./types";
import { WallpaperAPI } from "./services/mockBackend";

type ViewState = "home" | "admin" | "upload" | "premium" | "analytics";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] =
    useState<Wallpaper | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    async function loadMockData() {
      try {
        const data = await WallpaperAPI.getWallpapers();
        setWallpapers(data);
      } catch (error) {
        console.error("Mock backend load failed", error);
      } finally {
        setLoading(false);
      }
    }
    loadMockData();
  }, []);

  return (
    <div className="min-h-screen bg-surface text-primary transition">
      <Navbar onNavigate={setCurrentView} isDark={isDark} setIsDark={setIsDark} />
      {currentView === "home" && (
        <>
          <Hero />
          <FilterBar
            wallpapers={wallpapers}
            setWallpapers={setWallpapers}
            loading={loading}
            setSelectedWallpaper={setSelectedWallpaper}
          />
        </>
      )}

      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
        />
      )}

      {showGenerateModal && (
        <GenerateModal onClose={() => setShowGenerateModal(false)} />
      )}
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}
    </div>
  );
};

export default App;
