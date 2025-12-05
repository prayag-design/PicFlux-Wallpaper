import React, { useState, useEffect } from 'react';
import { X, Download, Eye, Calendar, ShieldCheck, Flag, Lock, Loader2, Settings, Sliders, Check } from 'lucide-react';
import { Wallpaper, ResolutionType } from '../types';
import { WallpaperAPI } from '../services/mockBackend';

interface WallpaperModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  onOpenPremium: () => void;
}

const WallpaperModal: React.FC<WallpaperModalProps> = ({ wallpaper, onClose, onOpenPremium }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  // Custom Download State
  const [customConfig, setCustomConfig] = useState({
    width: 1920,
    height: 1080,
    quality: 90,
    format: 'jpg' as 'jpg' | 'webp' | 'avif'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Quick Download Handler (Existing)
  const handleQuickDownload = async (res: any) => {
    try {
      setDownloading(res.type);
      const url = await WallpaperAPI.getDownloadUrl(wallpaper.id, res.type);
      await WallpaperAPI.trackDownload(wallpaper.id, res.type);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `picflux-${wallpaper.id}-${res.type}.jpg`;
      link.click();
    } catch (error: any) {
      if (error.message.includes('Premium')) {
        onOpenPremium();
      } else {
        alert("Download failed: " + error.message);
      }
    } finally {
      setDownloading(null);
    }
  };

  // Custom Download Handler (New)
  const handleCustomDownload = async () => {
    // Validate
    if (customConfig.width > 8000 || customConfig.height > 8000) {
      alert("Max dimension is 8000px");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Call API (Simulated or Real)
      const blob = await WallpaperAPI.downloadCustomWallpaper(
        wallpaper.id, 
        customConfig.width, 
        customConfig.height, 
        customConfig.quality, 
        customConfig.format
      );

      // 2. Create Object URL
      const url = URL.createObjectURL(blob);

      // 3. Trigger Download
      const a = document.createElement('a');
      a.href = url;
      a.download = `picflux-${wallpaper.title.replace(/\s+/g, '-').toLowerCase()}-${customConfig.width}x${customConfig.height}.${customConfig.format}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      alert("Processing failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPreset = (type: 'Mobile' | 'HD' | '2K' | '4K' | 'Original') => {
    const originalRes = wallpaper.resolutions.find(r => r.type === ResolutionType.Original);
    const aspect = parseInt(wallpaper.aspectRatio.split(':')[0]) / parseInt(wallpaper.aspectRatio.split(':')[1]);
    
    switch (type) {
      case 'Mobile': setCustomConfig(p => ({ ...p, width: 1080, height: 2400 })); break;
      case 'HD': setCustomConfig(p => ({ ...p, width: 1920, height: 1080 })); break;
      case '2K': setCustomConfig(p => ({ ...p, width: 2560, height: 1440 })); break;
      case '4K': setCustomConfig(p => ({ ...p, width: 3840, height: 2160 })); break;
      case 'Original': 
        if (originalRes) setCustomConfig(p => ({ ...p, width: originalRes.width, height: originalRes.height })); 
        break;
    }
  };

  const handleReport = () => {
    const reason = prompt("Why are you reporting this wallpaper? (nsfw, copyright, spam)");
    if (reason) {
      WallpaperAPI.reportWallpaper(wallpaper.id, reason);
      alert("Report submitted. Thank you for helping keep PicFlux safe.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-backdrop-enter" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-surface rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 animate-modal-enter transform-gpu">
        
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black flex items-center justify-center relative group">
          <img 
            src={wallpaper.originalUrl} 
            alt={wallpaper.title}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs text-white backdrop-blur flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>{wallpaper.aspectRatio}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>Original Quality</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto bg-surface border-l border-white/10 flex flex-col">
           {/* Header */}
           <div className="p-6 border-b border-white/10 flex justify-between items-start">
             <div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{wallpaper.title}</h2>
               <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                 <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {wallpaper.uploader.name.charAt(0)}
                 </div>
                 <span>by {wallpaper.uploader.name}</span>
               </div>
             </div>
             <button 
                onClick={onClose}
                className="hidden md:block p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
             </button>
           </div>

           {/* Stats */}
           <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 dark:border-white/10">
             <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <Eye className="w-3 h-3" /> Views
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{wallpaper.views.toLocaleString()}</div>
             </div>
             <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <Download className="w-3 h-3" /> Downloads
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{wallpaper.downloads.toLocaleString()}</div>
             </div>
             <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
                  <Calendar className="w-3 h-3" /> Date
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(wallpaper.createdAt).toLocaleDateString()}</div>
             </div>
           </div>

           {/* Downloads Tabs */}
           <div className="flex border-b border-gray-200 dark:border-white/10">
             <button 
               onClick={() => setActiveTab('quick')}
               className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'quick' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
             >
               Quick Download
             </button>
             <button 
               onClick={() => setActiveTab('custom')}
               className={`flex-1 py-3 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'custom' ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
             >
               <Sliders className="w-3 h-3" /> Resize & Convert
             </button>
           </div>

           {/* Downloads Content */}
           <div className="p-6 flex-1 overflow-y-auto">
             
             {/* Quick Tab */}
             {activeTab === 'quick' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Available Resolutions</h3>
                  {wallpaper.resolutions.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickDownload(res)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group relative overflow-hidden ${
                        res.isPremium 
                          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/50' 
                          : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border-gray-200 dark:border-white/5 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                           res.type === ResolutionType.UHD ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                           {res.type === ResolutionType.UHD ? '4K' : res.type === ResolutionType.HD ? 'HD' : 'M'}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {res.width} x {res.height}
                            {res.isPremium && <CrownIcon className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </div>
                          <div className="text-xs text-gray-500">{res.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">{res.size}</span>
                        {downloading === res.type ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : res.isPremium ? (
                          <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
             )}

             {/* Custom Tab */}
             {activeTab === 'custom' && (
               <div className="space-y-6 animate-fade-in">
                 
                 {/* Presets */}
                 <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Presets</label>
                   <div className="grid grid-cols-3 gap-2">
                     {['Mobile', 'HD', '2K', '4K', 'Original'].map(p => (
                       <button 
                          key={p} 
                          onClick={() => applyPreset(p as any)}
                          className="px-2 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Dimensions */}
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Width (px)</label>
                     <input 
                       type="number" 
                       value={customConfig.width}
                       onChange={(e) => setCustomConfig({...customConfig, width: Number(e.target.value)})}
                       className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Height (px)</label>
                     <input 
                       type="number" 
                       value={customConfig.height}
                       onChange={(e) => setCustomConfig({...customConfig, height: Number(e.target.value)})}
                       className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors"
                     />
                   </div>
                 </div>

                 {/* Format & Quality */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Format</label>
                      <select 
                        value={customConfig.format}
                        onChange={(e) => setCustomConfig({...customConfig, format: e.target.value as any})}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="jpg">JPEG</option>
                        <option value="webp">WEBP</option>
                        <option value="avif">AVIF</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Quality ({customConfig.quality}%)</label>
                       <input 
                          type="range" 
                          min="10" max="100" 
                          value={customConfig.quality}
                          onChange={(e) => setCustomConfig({...customConfig, quality: Number(e.target.value)})}
                          className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                       />
                    </div>
                 </div>

                 {/* Download Button */}
                 <button 
                   onClick={handleCustomDownload}
                   disabled={isProcessing}
                   className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {isProcessing ? (
                     <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                     </>
                   ) : (
                     <>
                        <Settings className="w-4 h-4" /> Resize & Download
                     </>
                   )}
                 </button>

                 <p className="text-xs text-center text-gray-500">
                    Processed on server. High-res files may take a moment.
                 </p>
               </div>
             )}

           </div>

           {/* Footer Actions */}
           <div className="p-6 bg-gray-100 dark:bg-black/20 text-sm border-t border-gray-200 dark:border-white/5">
             <div className="flex items-start gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">License: {wallpaper.license}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                    Free to use under {wallpaper.license}.
                  </div>
                </div>
             </div>
             
             <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="flex flex-wrap gap-2">
                  {wallpaper.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/50 dark:bg-white/5 rounded text-xs text-gray-500 dark:text-gray-400">#{tag}</span>
                  ))}
                </div>
                <button onClick={handleReport} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Report
                </button>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M2 24h20v-4H2v4zm2-20c-1.104 0-2 .896-2 2v2h2v-2h2v2h2v-2c0-1.104-.896-2-2-2H4zm16 0c-1.104 0-2 .896-2 2v2h2v-2h2v2h2v-2c0-1.104-.896-2-2-2h-2zM12 2c-1.104 0-2 .896-2 2v2h2V4h2v2h2V4c0-1.104-.896-2-2-2h-2z" opacity="0.5"/><path d="M19 10l-4-2-3 5-3-5-4 2v9h14V10z"/></svg>
);

export default WallpaperModal;