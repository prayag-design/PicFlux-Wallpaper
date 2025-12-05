import React, { useState, useCallback } from 'react';
import { Upload, Sparkles, Check, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { WallpaperAPI } from '../services/mockBackend';
import { CATEGORIES } from '../services/mockBackend';

const UploadWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    category: 'Uncategorized',
    license: 'CC0'
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDuplicateToast, setShowDuplicateToast] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
    setStep(2);
  };

  const generateMetadata = async () => {
    if (!metadata.description) return;
    setAnalyzing(true);
    try {
      const tags = await GeminiService.suggestTags(metadata.description);
      setMetadata(prev => ({ ...prev, tags }));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setShowDuplicateToast(false);
    try {
      const result: any = await WallpaperAPI.uploadWallpaper({
        title: metadata.title,
        description: metadata.description,
        thumbnailUrl: preview, // In real app, this is result of S3 upload
        originalUrl: preview,
        tags: metadata.tags,
        category: metadata.category,
        license: metadata.license as any
      });
      
      if (result?.status === 'duplicate') {
          setShowDuplicateToast(true);
          // Hide after 3s
          setTimeout(() => setShowDuplicateToast(false), 3000);
          setUploading(false);
          return;
      }

      setStep(3);
      setTimeout(onComplete, 2000);
    } catch (e) {
      alert('Upload failed');
    } finally {
      if (!showDuplicateToast) setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 relative">
      {/* Duplicate Toast */}
      {showDuplicateToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in z-50">
           <AlertCircle className="w-4 h-4" />
           This wallpaper already exists on PicFlux.
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 text-sm font-medium text-gray-500">
        <span className={step >= 1 ? 'text-blue-400' : ''}>1. Select File</span>
        <span className={step >= 2 ? 'text-blue-400' : ''}>2. Add Details</span>
        <span className={step >= 3 ? 'text-blue-400' : ''}>3. Review</span>
      </div>

      {step === 1 && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-white/20 rounded-2xl h-80 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="p-4 bg-blue-500/20 rounded-full mb-4 text-blue-400">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-xl font-medium text-white mb-2">Drag and drop your wallpaper</p>
          <p className="text-gray-400 text-sm mb-6">Supports JPG, PNG, WEBP (Max 50MB)</p>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="file-upload"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <label htmlFor="file-upload" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition">
            Browse Files
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <div className="flex gap-6 mb-6">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg bg-black" />
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Title</label>
                <input 
                  type="text" 
                  value={metadata.title}
                  onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. Neon Sunset"
                />
              </div>
              <div>
                 <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Category</label>
                 <select
                   value={metadata.category}
                   onChange={(e) => setMetadata({...metadata, category: e.target.value})}
                   className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-blue-500 outline-none"
                 >
                   {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
               <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Description</label>
               <textarea 
                  value={metadata.description}
                  onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                  className="w-full h-24 bg-black/20 border border-white/10 rounded p-2 text-white focus:border-blue-500 outline-none resize-none"
                  placeholder="Describe your wallpaper to auto-generate tags..."
               />
               <button 
                  onClick={generateMetadata}
                  disabled={analyzing || !metadata.description}
                  className="mt-2 text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50"
               >
                 <Sparkles className="w-3 h-3" /> {analyzing ? 'Analyzing...' : 'Auto-generate tags with AI'}
               </button>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/10 rounded text-sm text-gray-300 flex items-center gap-1">
                    #{tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setMetadata(prev => ({...prev, tags: prev.tags.filter(t => t !== tag)}))} />
                  </span>
                ))}
                {metadata.tags.length === 0 && <span className="text-gray-500 text-sm italic">No tags yet</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-white/10">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white">Cancel</button>
            <button 
               onClick={handleUpload} 
               disabled={uploading || !metadata.title}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Publish Wallpaper'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Successful!</h2>
          <p className="text-gray-400">Your wallpaper has been submitted for moderation.</p>
        </div>
      )}
    </div>
  );
};

export default UploadWizard;