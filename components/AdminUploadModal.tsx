import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Maximize2, Scissors, Type, Check, AlertCircle, Loader2, Save, Trash2, ShieldCheck, Crown } from 'lucide-react';
import { AdminAPI, CATEGORIES } from '../services/mockBackend';
import { UploadFileConfig, LicenseType, Wallpaper } from '../types';

interface AdminUploadModalProps {
  onClose: () => void;
}

const AdminUploadModal: React.FC<AdminUploadModalProps> = ({ onClose }) => {
  const [files, setFiles] = useState<UploadFileConfig[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: UploadFileConfig[] = Array.from(e.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        metadata: {
          title: file.name.split('.')[0],
          description: '',
          category: 'Uncategorized',
          tags: [],
          license: LicenseType.CC0,
          isPremium: false,
          folder: 'free',
          stripExif: true,
          addWatermark: false
        },
        processing: {
          resizePresets: ['4K', '1080p'],
          quality: 90,
          format: 'webp'
        },
        status: 'idle',
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
      if (!selectedFileId && newFiles.length > 0) setSelectedFileId(newFiles[0].id);
    }
  };

  const handleBatchUpload = async () => {
    // 1. Init Uploads
    const pendingFiles = files.filter(f => f.status === 'idle');
    if (pendingFiles.length === 0) return;

    // Update statuses
    setFiles(prev => prev.map(f => f.status === 'idle' ? { ...f, status: 'uploading' } : f));

    // Simulate concurrent uploads
    for (const fileConfig of pendingFiles) {
      try {
        // Init
        await AdminAPI.initUpload([{ name: fileConfig.file.name, size: fileConfig.file.size, type: fileConfig.file.type }]);
        
        // Simulate Progress
        for (let i = 10; i <= 100; i += 20) {
          await new Promise(r => setTimeout(r, 200));
          setFiles(prev => prev.map(f => f.id === fileConfig.id ? { ...f, progress: i } : f));
        }

        // Processing
        setFiles(prev => prev.map(f => f.id === fileConfig.id ? { ...f, status: 'processing', progress: 100 } : f));
        
        // Complete
        const result = await AdminAPI.completeUpload(fileConfig);
        
        if (result.status === 'duplicate') {
           setFiles(prev => prev.map(f => f.id === fileConfig.id ? { ...f, status: 'error', error: 'Duplicate image detected' } : f));
        } else {
           setFiles(prev => prev.map(f => f.id === fileConfig.id ? { ...f, status: 'completed' } : f));
        }

      } catch (e: any) {
        setFiles(prev => prev.map(f => f.id === fileConfig.id ? { ...f, status: 'error', error: e.message } : f));
      }
    }
  };

  const activeFile = files.find(f => f.id === selectedFileId);

  const updateMetadata = (key: string, value: any) => {
    if (!activeFile) return;
    setFiles(prev => prev.map(f => f.id === activeFile.id ? {
      ...f,
      metadata: { ...f.metadata, [key]: value }
    } : f));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  const completedCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
           <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-blue-500" /> Admin Upload
             </h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: File List */}
          <div className="w-80 bg-black/20 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 cursor-pointer transition">
                <Upload className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-xs text-gray-400 font-medium">Add Images (JPG, PNG, WEBP)</span>
                <input type="file" multiple accept="image/*" onChange={handleDeviceUpload} className="hidden" />
              </label>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
               {files.map(file => (
                 <div 
                   key={file.id} 
                   onClick={() => setSelectedFileId(file.id)}
                   className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                     selectedFileId === file.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-transparent border-transparent hover:bg-white/5'
                   }`}
                 >
                   <img src={file.previewUrl} className="w-12 h-12 rounded object-cover bg-black" />
                   <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-white truncate">{file.metadata.title}</div>
                     <div className="text-xs text-gray-500 flex justify-between">
                       <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                       <span className={`capitalize ${file.status === 'completed' ? 'text-green-400' : file.status === 'error' ? 'text-red-400' : ''}`}>{file.status}</span>
                     </div>
                     {file.status === 'uploading' && (
                       <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                       </div>
                     )}
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="text-gray-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                 </div>
               ))}
               {files.length === 0 && <div className="text-center text-gray-500 text-sm mt-10">No files selected</div>}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{files.length} Files</span>
                <span>Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button 
                onClick={handleBatchUpload}
                disabled={files.filter(f => f.status === 'idle').length === 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition shadow-lg"
              >
                Upload All ({files.filter(f => f.status === 'idle').length})
              </button>
            </div>
          </div>

          {/* Center: Editor */}
          <div className="flex-1 flex flex-col bg-[#121212] relative">
            {activeFile ? (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Preview & Crop Area */}
                <div className="flex gap-8 mb-8">
                  <div className="flex-1 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center p-4 relative min-h-[400px]">
                    <img src={activeFile.previewUrl} className="max-w-full max-h-[500px] object-contain shadow-2xl" />
                    {/* Simulated Crop Overlay (Visual only for mock) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                       <button className="p-2 bg-black/60 text-white rounded hover:bg-blue-600" title="Crop"><Scissors className="w-5 h-5" /></button>
                       <button className="p-2 bg-black/60 text-white rounded hover:bg-blue-600" title="Resize"><Maximize2 className="w-5 h-5" /></button>
                    </div>
                    {activeFile.metadata.addWatermark && (
                      <div className="absolute bottom-8 right-8 text-white/50 font-bold text-2xl uppercase tracking-widest pointer-events-none">PicFlux Preview</div>
                    )}
                  </div>

                  {/* Metadata Form */}
                  <div className="w-96 space-y-6">
                    <div className="bg-surface border border-white/10 rounded-xl p-5">
                       <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                         <Type className="w-4 h-4" /> Metadata
                       </h3>
                       <div className="space-y-4">
                         <div>
                           <label className="text-xs text-gray-500 block mb-1">Title</label>
                           <input 
                             type="text" 
                             value={activeFile.metadata.title}
                             onChange={(e) => updateMetadata('title', e.target.value)}
                             className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" 
                           />
                         </div>
                         <div>
                           <label className="text-xs text-gray-500 block mb-1">Category</label>
                           <select 
                             value={activeFile.metadata.category}
                             onChange={(e) => updateMetadata('category', e.target.value)}
                             className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                           >
                             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="text-xs text-gray-500 block mb-1">Tags (comma separated)</label>
                           <input 
                              type="text" 
                              placeholder="nature, dark, 4k..."
                              className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" 
                           />
                         </div>
                       </div>
                    </div>

                    <div className="bg-surface border border-white/10 rounded-xl p-5">
                       <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                         <Crown className="w-4 h-4" /> Settings
                       </h3>
                       <div className="space-y-4">
                         <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5">
                           <span className="text-sm text-gray-300">Premium Asset</span>
                           <input 
                             type="checkbox" 
                             checked={activeFile.metadata.isPremium} 
                             onChange={(e) => {
                                updateMetadata('isPremium', e.target.checked);
                                updateMetadata('folder', e.target.checked ? 'premium' : 'free');
                             }}
                             className="w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-600" 
                           />
                         </label>
                         
                         <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5">
                           <span className="text-sm text-gray-300">Strip EXIF Data</span>
                           <input 
                              type="checkbox" 
                              checked={activeFile.metadata.stripExif}
                              onChange={(e) => updateMetadata('stripExif', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-600" 
                           />
                         </label>

                         <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white/5">
                           <span className="text-sm text-gray-300">Add Watermark</span>
                           <input 
                              type="checkbox" 
                              checked={activeFile.metadata.addWatermark}
                              onChange={(e) => updateMetadata('addWatermark', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-600" 
                           />
                         </label>
                       </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 font-mono bg-black/40 p-3 rounded border border-white/5">
                       Target: /wallpapers/{activeFile.metadata.folder}/{activeFile.id}.webp
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>Select an image to edit metadata</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadModal;