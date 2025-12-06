import { Wallpaper } from "../types";

const MOCK_WALLPAPERS: Wallpaper[] = [
  {
    id: "1",
    title: "Mountain View",
    category: "Nature",
    url: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg",
    author: "Demo",
    premium: false,
  },
  {
    id: "2",
    title: "Ocean Waves",
    category: "Nature",
    url: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
    author: "Demo",
    premium: false,
  }
];

export const WallpaperAPI = {
  async getWallpapers(): Promise<Wallpaper[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_WALLPAPERS), 500);
    });
  }
};
