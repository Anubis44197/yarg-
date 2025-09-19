
import React from 'react';
import type { SearchResultItem } from '../types.ts';
import { InfoIcon, WarningIcon } from './Icons.tsx';
import Spinner from './Spinner.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const ResultsListItem: React.FC<{ 
    item: SearchResultItem; 
    isSelected: boolean; 
    onSelect: () => void;
    onView: () => void;
}> = ({ item, isSelected, onSelect, onView }) => {
    return (
        <li className="bg-slate-800 border border-slate-700 rounded-lg p-4 transition-shadow hover:shadow-lg hover:border-slate-600">
            <div className="flex items-start gap-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                    <button onClick={onView} className="text-left w-full">
                        <h3 className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">{item.title}</h3>
                    </button>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                        <span>{item.documentId}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-2" dangerouslySetInnerHTML={{ __html: item.snippet }} />
                </div>
            </div>
        </li>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    
    return (
        <nav className="flex justify-center items-center gap-2 mt-6">
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === number 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {number}
                </button>
            ))}
        </nav>
    );
};

const ResultsList: React.FC = () => {
    const {
        searchResults: results,
        isLoadingSearch: isLoading,
        searchError: error,
        selectedItems,
        handleSelectItem: onSelectItem,
        handleViewItem: onViewItem,
        handlePageChange: onPageChange,
        handleSummarize: onSummarize,
        handleCompare: onCompare,
        query,
    } = useAppContext();

    const canSummarize = selectedItems.length === 1;
    const canCompare = selectedItems.length > 1;

    if (isLoading && !results) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Spinner />
                <p className="mt-4 font-semibold">Sonuçlar aranıyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-400 bg-red-900/50 p-4 rounded-lg">
                <WarningIcon className="h-12 w-12 text-red-500 mb-4"/>
                <p className="font-bold text-lg">Arama Başarısız</p>
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }
    
    if (!results?.items.length && query) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <InfoIcon className="h-12 w-12 text-slate-500 mb-4"/>
                <p className="font-bold">Aramanızla Eşleşen Sonuç Bulunamadı</p>
                <p className="mt-2 text-sm">Farklı anahtar kelimelerle tekrar deneyin veya filtrelerinizi kontrol edin.</p>
            </div>
        );
    }
    
    if (!results) {
        return null;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-400">Toplam {results.total} sonuç bulundu.</p>
                <div className="flex gap-2">
                    <button 
                        onClick={onSummarize}
                        disabled={!canSummarize || isLoading}
                        className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Özetle (1)
                    </button>
                    <button 
                        onClick={onCompare}
                        disabled={!canCompare || isLoading}
                        className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-md hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Karşılaştır ({selectedItems.length})
                    </button>
                </div>
            </div>
            <ul className="space-y-4">
                {results.items.map(item => (
                    <ResultsListItem 
                        key={item.id} 
                        item={item}
                        isSelected={selectedItems.some(selected => selected.id === item.id)}
                        onSelect={() => onSelectItem(item)}
                        onView={() => onViewItem(item)}
                    />
                ))}
            </ul>
            <Pagination 
                currentPage={results.page}
                totalPages={results.pages}
                onPageChange={onPageChange}
            />
        </div>
    );
};

export default ResultsList;
