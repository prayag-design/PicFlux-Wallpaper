import React, { useState } from 'react';
import { X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { Wallpaper } from '../types';

interface GenerateModalProps {
  onClose: () => void;
  onGenerated: (wallpaper: Wallpaper) => void;
}

const GenerateModal: React.FC<GenerateModalProps> = ({ onClose, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await GeminiService.generateWallpaper({
        prompt,
        aspectRatio,
        resolution: "1K" // Using 1K for speed/demo, Pro allows up to 4K
      });

      if (result) {
        onGenerated(result);
        onClose();
      }
    } catch (e) {
      setError('Failed to generate image. Please try again or check API limits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Generator
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city floating in the clouds, cyberpunk style, neon lights..."
              className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
             <div className="grid grid-cols-3 gap-2">
               {['16:9', '9:16', '1:1'].map((ratio) => (
                 <button
                   key={ratio}
                   onClick={() => setAspectRatio(ratio as any)}
                   className={`py-2 rounded-lg text-sm border ${
                     aspectRatio === ratio 
                     ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                     : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                   }`}
                 >
                   {ratio}
                 </button>
               ))}
             </div>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Dreaming...' : 'Generate Wallpaper'}
          </button>
          
          <div className="text-xs text-gray-600 text-center">
             Powered by Gemini 3 Pro Vision. Generations are transient.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateModal;
