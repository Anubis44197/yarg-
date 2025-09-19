
import React, { useState } from 'react';
// FIX: Add file extension to icon import.
import { SearchIcon, FilterIcon } from './Icons.tsx';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  isSourceSelectionDisabled: boolean;
  onToggleFilters: () => void;
  showFiltersButton: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, isSourceSelectionDisabled, onToggleFilters, showFiltersButton }) => {
  const [query, setQuery] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4 bg-[#1E293B] border border-slate-700 rounded-lg p-2 shadow-lg">
        <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"e.g., adil yargılanma hakkı ihlali"}
                className="w-full h-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 placeholder-slate-500 disabled:placeholder-slate-600"
                disabled={isLoading || isSourceSelectionDisabled}
            />
        </div>
         {showFiltersButton && (
            <button
                type="button"
                onClick={onToggleFilters}
                className="flex items-center justify-center w-auto text-slate-300 font-semibold px-4 py-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={isLoading || isSourceSelectionDisabled}
                aria-label="Filtreleri göster/gizle"
            >
                <FilterIcon className="h-5 w-5" />
            </button>
         )}
        <button
            type="submit"
            className="flex items-center justify-center w-auto bg-[#6366F1] text-white font-semibold px-8 py-2 rounded-md hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#6366F1] disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isLoading || isSourceSelectionDisabled || !query.trim()}
        >
            <span>{isLoading ? 'Aranıyor...' : 'Ara'}</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;