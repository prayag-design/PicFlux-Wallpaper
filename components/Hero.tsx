
import React from 'react';
import { ArrowDown, Star } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-300 mb-6">
          <Star className="w-3 h-3 fill-current" />
          <span>Daily Feature: "Alpine Dreams"</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
          Elevate Your Screen.
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
          Explore the ultimate collection of free 4K, AMOLED, Nature, Abstract, Minimal, and Space wallpapers. Premium quality, crafted for every device.
        </p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={onExplore}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Explore Trending
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
