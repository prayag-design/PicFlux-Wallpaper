
export enum ResolutionType {
  Mobile = 'Mobile',
  HD = '1080p',
  QHD = '1440p',
  UHD = '4K',
  Ultrawide = 'Ultrawide',
  Original = 'Original'
}

export interface Resolution {
  type: ResolutionType;
  width: number;
  height: number;
  size: string; // e.g., "2.4 MB"
  url: string;
  isPremium?: boolean;
  format?: 'jpg' | 'png' | 'webp' | 'avif';
}

export enum LicenseType {
  CC0 = 'CC0',
  CC_BY = 'CC BY',
  Proprietary = 'Proprietary',
  AI_Generated = 'AI Generated'
}

export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isPremium: boolean;
  joinedAt: string;
}

export interface WallpaperVariant {
  key: string; // e.g., "thumb", "1080p"
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
}

export interface Wallpaper {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  originalUrl: string; // Restricted access
  resolutions: Resolution[];
  variants?: WallpaperVariant[]; // New detailed variants
  uploader: {
    id: string;
    name: string;
    avatar?: string;
  };
  license: LicenseType;
  tags: string[];
  category: string;
  views: number;
  downloads: number;
  createdAt: string;
  colors: string[];
  aspectRatio: string;
  status: 'published' | 'pending' | 'rejected' | 'flagged';
  
  // New Admin Fields
  premium?: boolean;
  folder?: 'free' | 'premium';
  hash?: string; // SHA256 for deduplication
  moderated?: boolean | { status: string; moderatorId: string; reason: string };
}

export interface Report {
  id: string;
  wallpaperId: string;
  reason: 'nsfw' | 'copyright' | 'spam' | 'other';
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface FilterState {
  category: string;
  resolution: string;
  color: string;
  sort: 'popular' | 'newest' | 'trending';
  query: string;
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  resolution: "1K" | "2K" | "4K";
}

export interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  activeUsers: number;
  revenue: number;
  topQueries: { term: string; count: number }[];
}

// Upload Workflow Types
export interface UploadFileConfig {
  file: File;
  previewUrl: string;
  id: string;
  metadata: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    license: LicenseType;
    isPremium: boolean;
    folder: 'free' | 'premium';
    stripExif: boolean;
    addWatermark: boolean;
  };
  processing: {
    crop?: { x: number; y: number; width: number; height: number };
    resizePresets: ('1080p' | '4K' | 'Mobile')[];
    quality: number;
    format: 'webp' | 'avif' | 'jpeg';
  };
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}
