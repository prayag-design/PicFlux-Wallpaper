import React, { useState } from 'react';
import { Search, Menu, X, User as UserIcon, BarChart, Sun, Moon, UploadCloud } from 'lucide-react';
import { WallpaperAPI } from '../services/mockBackend';
import AdminUploadModal from './AdminUploadModal';

interface NavbarProps {
  onSearch: (query: string) => void;
  onNavigate: (view: 'home' | 'admin' | 'upload' | 'premium' | 'analytics') => void;
  currentView: string;
  onOpenAI: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, onNavigate, currentView, onOpenAI, isDark, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const user = WallpaperAPI.getCurrentUser();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
    // Navigation is handled by parent onSearch to control scroll behavior
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value === '') {
      onSearch('');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer gap-2" onClick={() => onNavigate('home')}>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                PicFlux
              </span>
              <span className="hidden sm:block text-xs uppercase tracking-wider bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">Beta</span>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-full leading-5 bg-gray-100 dark:bg-surface text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-surface focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all duration-300"
                  placeholder="Search wallpapers..."
                  value={searchValue}
                  onChange={handleInputChange}
                />
              </form>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Admin Links */}
              {user?.role === 'admin' && (
                <>
                  <button onClick={() => setShowAdminUpload(true)} className="p-2 text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-full transition-colors" title="Admin Upload">
                    <UploadCloud className="w-5 h-5" />
                  </button>
                  <button onClick={() => onNavigate('analytics')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <BarChart className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Premium / User */}
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
                  {!user.isPremium && (
                    <button 
                        onClick={() => onNavigate('premium')}
                        className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 uppercase tracking-wide"
                    >
                      Go Pro
                    </button>
                  )}
                </div>
              ) : (
                <button className="text-sm font-medium text-gray-700 dark:text-white hover:text-blue-500">Login</button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="px-2 pb-2 relative">
                  <input
                    type="text"
                    className="block w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={handleInputChange}
                  />
              </form>
              <button 
                  onClick={() => { onNavigate('premium'); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-amber-500 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <UserIcon className="w-4 h-4" /> Premium Upgrade
              </button>
            </div>
          </div>
        )}
      </nav>

      {showAdminUpload && <AdminUploadModal onClose={() => setShowAdminUpload(false)} />}
    </>
  );
};

export default Navbar;