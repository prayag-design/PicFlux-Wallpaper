
import React from 'react';
import { CATEGORIES } from '../services/mockBackend';
import { FilterState } from '../types';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  return (
    <div className="w-full border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-md py-4 sticky top-16 z-40 transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        
        {/* Categories Scrollable Area */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-2 -my-2 px-1">
          <div className="flex space-x-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 border font-medium ${
                  filters.category === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                    : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Filters */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
              className="appearance-none bg-gray-100 dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 pl-4 pr-10 py-2 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
