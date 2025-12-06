import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import WallpaperModal from './components/WallpaperModal';
import GenerateModal from './components/GenerateModal';
import ModerationDashboard from './components/ModerationDashboard';
import UploadWizard from './components/UploadWizard';
import PremiumModal from './components/PremiumModal';
import { Wallpaper, FilterState } from './types';
import { WallpaperAPI } from './services/mockBackend';
import { Loader2, AlertCircle, BarChart, LayoutGrid, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// UI-only: added Back-to-Library button (in Navbar); logic preserved.

type ViewState = 'home' | 'admin' | 'upload' | 'premium' | 'analytics';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
useEffect(() => {
  async function loadFromPexels() {
    try {
      setLoading(true);

      const res = await fetch(
        'https://api.pexels.com/v1/search?query=wallpapers&per_page=30&page=1',
        {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY || '',
          },
        }
      );

      if (!res.ok) {
        console.error('Pexels API error', res.status, await res.text());
        setWallpapers([]);
        return;
      }

      const data = await res.json();

      const mapped: Wallpaper[] = (data.photos ?? []).map((photo: any) => ({
        id: String(photo.id),
        title: photo.alt || 'Pexels Wallpaper',
        category: 'Pexels',
        url: photo.src?.large2x || photo.src?.large || photo.src?.original,
        thumbnail: photo.src?.medium || photo.src?.small,
        isPremium: false,
        tags: photo.alt ? photo.alt.split(' ') : [],
      }));

      setWallpapers(mapped);
    } catch (err) {
      console.error('Error loading Pexels wallpapers', err);
      setWallpapers([]);
    } finally {
      setLoading(false);
    }
  }

  loadFromPexels();
}, []); 
  const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadFromPexels() {
    try {
      setLoading(true);

      const res = await fetch(
        'https://api.pexels.com/v1/search?query=wallpapers&per_page=30&page=1',
        {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY || '',
          },
        }
      );

      if (!res.ok) {
        console.error('Pexels API error', res.status, await res.text());
        setWallpapers([]);
        return;
      }

      const data = await res.json();

      const mapped: Wallpaper[] = (data.photos ?? []).map((photo: any) => ({
        id: String(photo.id),
        title: photo.alt || 'Pexels Wallpaper',
        category: 'Pexels',
        url: photo.src?.large2x || photo.src?.large || photo.src?.original,
        thumbnail: photo.src?.medium || photo.src?.small,
        isPremium: false,
        tags: photo.alt ? photo.alt.split(' ') : [],
      }));

      setWallpapers(mapped);
    } catch (err) {
      console.error('Error loading Pexels wallpapers', err);
      setWallpapers([]);
    } finally {
      setLoading(false);
    }
  }

  loadFromPexels();
}, []); 
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Theme state
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
  async function loadFromPexels() {
    try {
      setLoading(true);

      const res = await fetch(
        'https://api.pexels.com/v1/search?query=wallpapers&per_page=30&page=1',
        {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY || '',
          },
        }
      );

      const data = await res.json();

      const mapped: Wallpaper[] = (data.photos ?? []).map((photo: any) => ({
        id: String(photo.id),
        title: photo.alt || 'Pexels Wallpaper',
        category: 'Pexels',
        url: photo.src?.large2x || photo.src?.large || photo.src?.original,
        thumbnail:
          photo.src?.medium || photo.src?.small || photo.src?.tiny || '',
        isPremium: false,
        tags: photo.alt ? photo.alt.split(' ') : [],
      }));

      setWallpapers(mapped);
    } catch (err) {
      console.error('Error loading Pexels wallpapers', err);
    } finally {
      setLoading(false);
    }
  }

  loadFromPexels();
}, []);
  useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [isDark]);
// Pagination State
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // UI-only state for AI Assistant
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('Photorealistic');
  const [aiRes, setAiRes] = useState('4K');
  const [aiTags, setAiTags] = useState('');

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    resolution: 'All',
    color: 'All',
    sort: 'popular',
    query: ''
  });

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const fetchWallpapers = useCallback(async () => {
    if (currentView !== 'home') return;
    setLoading(true);
    try {
      const response = await WallpaperAPI.getWallpapers(filters, page, itemsPerPage);
      // Handle both old array format (just in case) and new object format
      if (Array.isArray(response)) {
         setWallpapers(response);
         setTotalItems(response.length);
      } else {
         setWallpapers(response.wallpapers);
         setTotalItems(response.total);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentView, page]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  // View Routing Handlers
  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
    if (view === 'premium') setShowPremiumModal(true);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      // Reset all filters when search is cleared to show "All wallpapers"
      setFilters({
        category: 'All',
        resolution: 'All',
        color: 'All',
        sort: 'popular',
        query: ''
      });
      setPage(1);
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFilters(prev => ({ ...prev, query }));
      setCurrentView('home');
      window.scrollTo(0, 0);
    }
  };

  const handleExploreTrending = () => {
    setFilters(prev => ({ ...prev, sort: 'trending', category: 'All', query: '' }));
    setPage(1);
    setCurrentView('home');
    window.scrollTo({ top: document.getElementById('filter-bar')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleAIGenerate = () => {
    const payload = {
      prompt: aiPrompt,
      style: aiStyle,
      resolution: aiRes,
      tags: aiTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if ((window as any).invokeAIAssistant) {
      (window as any).invokeAIAssistant(payload);
    } else {
      // Presentational Success Toast / Fallback
      alert(`Request ready! Integrate 'window.invokeAIAssistant' to process:\n\n${JSON.stringify(payload, null, 2)}`);
    }
    setAiModalOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return <ModerationDashboard />;
      case 'upload':
        return <UploadWizard onComplete={() => handleNavigate('home')} />;
      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
             <BarChart className="w-16 h-16 text-blue-500 mb-6" />
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-md">Real-time data visualization is simulated in the console logs for this demo. In production, this would connect to PostHog/GA4.</p>
             <button onClick={() => handleNavigate('home')} className="mt-8 px-6 py-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white">Back to Home</button>
          </div>
        );
      case 'home':
      default:
        return (
          <>
            {!filters.query && <Hero onExplore={handleExploreTrending} />}
            <div id="filter-bar">
               <FilterBar filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} />
            </div>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {filters.query ? `Results for "${filters.query}"` : `${filters.sort === 'trending' ? 'Trending' : filters.category} Wallpapers`}
                </h2>
                <span className="text-sm text-gray-500">{totalItems} items</span>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading assets...</p>
                </div>
              )}

              {!loading && wallpapers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                  <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">No wallpapers found</p>
                  <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors mt-4 text-white"
                  >
                    Generate AI Wallpaper
                  </button>
                </div>
              )}

              {!loading && wallpapers.length > 0 && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {wallpapers.map((wallpaper) => (
                      <div 
                        key={wallpaper.id} 
                        className="group relative bg-surface rounded-xl overflow-hidden cursor-pointer border border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1"
                        onClick={() => setSelectedWallpaper(wallpaper)}
                      >
                        <div className={`aspect-[${wallpaper.aspectRatio.replace(':', '/')}] overflow-hidden bg-gray-200 dark:bg-gray-800`}>
                          <img
                            src={wallpaper.thumbnailUrl}
                            alt={wallpaper.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                          <h3 className="text-white font-medium truncate">{wallpaper.title}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-300">
                                {wallpaper.resolutions.some(r => r.type === '4K') ? '4K UHD' : 'HD'}
                            </span>
                            <span className="text-xs text-gray-400">{wallpaper.views > 1000 ? (wallpaper.views/1000).toFixed(1)+'k' : wallpaper.views} views</span>
                          </div>
                        </div>
                        
                        {wallpaper.license === 'AI Generated' && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/80 backdrop-blur text-[10px] font-bold rounded text-white uppercase tracking-wider">
                            AI
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-4 mt-12">
                     <button
                       onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
                       disabled={page === 1}
                       className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                       <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
                     </button>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                       Page {page} of {Math.ceil(totalItems / itemsPerPage)}
                     </span>
                     <button
                       onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                       disabled={page * itemsPerPage >= totalItems}
                       className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                       <ChevronRight className="w-5 h-5 text-gray-700 dark:text-white" />
                     </button>
                  </div>
                </>
              )}
            </main>
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-background text-gray-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navbar 
        onSearch={handleSearch} 
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenAI={() => setAiModalOpen(true)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      
      {renderContent()}

      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-modal-title"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setAiModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-surface border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-900/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="ai-modal-title" className="font-bold text-gray-900 dark:text-white text-lg">AI Designer</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini 3 Pro</p>
                </div>
              </div>
              <button 
                onClick={() => setAiModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <LayoutGrid className="w-5 h-5 rotate-45" /> {/* Close Icon */}
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your wallpaper..."
                  className="w-full h-28 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:border-violet-500 outline-none resize-none transition-all"
                  autoFocus
                />
               <button
                  onClick={handleAIGenerate}
                  className="w-full px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-lg shadow-lg transition-all"
                >
                  Generate
                </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-gray-200 dark:border-white/10 mt-20 bg-surface py-12 pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">PicFlux</h2>
          <div className="flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-500 dark:hover:text-white">Terms</a>
            <a href="#" className="hover:text-blue-500 dark:hover:text-white">Privacy</a>
            <a href="#" className="hover:text-blue-500 dark:hover:text-white">DMCA</a>
            <a href="#" className="hover:text-blue-500 dark:hover:text-white">API</a>
          </div>
          <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">© 2024 PicFlux Wallpapers. Production Build v2.0</p>
        </div>
      </footer>

      {selectedWallpaper && (
        <WallpaperModal 
          wallpaper={selectedWallpaper} 
          onClose={() => setSelectedWallpaper(null)} 
          onOpenPremium={() => { setSelectedWallpaper(null); setShowPremiumModal(true); }}
        />
      )}

      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={(w) => { setWallpapers(p => [w, ...p]); setSelectedWallpaper(w); }}
        />
      )}

      {showPremiumModal && (
        <PremiumModal onClose={() => { setShowPremiumModal(false); setCurrentView('home'); }} />
      )}
    </div>
  );
};

export default App;
