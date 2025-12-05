
import React, { useEffect, useState } from 'react';
import { WallpaperAPI } from '../services/mockBackend';
import { Wallpaper, Report } from '../types';
import { Check, X, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

const ModerationDashboard: React.FC = () => {
  const [queue, setQueue] = useState<Wallpaper[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [q, r] = await Promise.all([
        WallpaperAPI.getModerationQueue(),
        WallpaperAPI.getReports()
      ]);
      setQueue(q);
      setReports(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') await WallpaperAPI.approveWallpaper(id);
    else await WallpaperAPI.rejectWallpaper(id);
    // Optimistic UI update
    setQueue(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ShieldIcon className="w-8 h-8 text-blue-500" />
          Moderation Center
        </h1>
        <button onClick={fetchData} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Queue */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-400" />
              Pending Review ({queue.length})
            </h2>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Queue is empty. Good job!</div>
            ) : (
              queue.map(item => (
                <div key={item.id} className="p-4 flex gap-4">
                  <img src={item.thumbnailUrl} alt="" className="w-24 h-24 object-cover rounded-lg bg-black" />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">by {item.uploader.name}</p>
                    <div className="flex gap-2 mb-2">
                      {item.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-300">{t}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(item.id, 'approve')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-sm transition"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button 
                         onClick={() => handleAction(item.id, 'reject')}
                         className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm transition"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reports */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              User Reports ({reports.length})
            </h2>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
             {reports.length === 0 ? (
               <div className="p-8 text-center text-gray-500">No active reports.</div>
             ) : (
               reports.map(report => (
                 <div key={report.id} className="p-4 flex items-start gap-3">
                   <div className="p-2 bg-red-500/10 rounded text-red-500">
                     <AlertTriangle className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between mb-1">
                       <span className="text-sm font-bold text-red-400 uppercase">{report.reason}</span>
                       <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-gray-300 mb-2">Wallpaper ID: <span className="font-mono text-xs bg-white/10 px-1 rounded">{report.wallpaperId}</span></p>
                     <div className="flex gap-2">
                        <button className="text-xs text-blue-400 hover:underline">View Content</button>
                        <button className="text-xs text-gray-400 hover:text-white">Dismiss</button>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default ModerationDashboard;
