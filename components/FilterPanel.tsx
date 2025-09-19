
import React, { useState, useEffect } from 'react';
import { DocumentSource, SearchFilters, DS } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';


// Demo data - in a real app, this would come from an API
const yargitayDaireleri = [
    "1. Hukuk Dairesi", "2. Hukuk Dairesi", "1. Ceza Dairesi", "2. Ceza Dairesi", "Hukuk Genel Kurulu", "Ceza Genel Kurulu"
];
const danistayDaireleri = [
    "1. Daire", "2. Daire", "Vergi Dava Daireleri Kurulu", "İdari Dava Daireleri Kurulu"
];
const sayistayDaireleri = [
    "1. Daire", "2. Daire", "Temyiz Kurulu"
];


const FilterPanel: React.FC = () => {
    const {
        selectedSources,
        filters,
        setFilters: onFilterChange,
        performSearch,
        toggleFilterPanel: onClose,
        isLoadingSearch: isLoading,
        isFilterPanelOpen,
        query,
    } = useAppContext();

    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleLocalFilterChange = (filterName: keyof SearchFilters, value: string) => {
        const newFilters = {...localFilters, [filterName]: value};
        setLocalFilters(newFilters);
        onFilterChange(newFilters); // Update parent state immediately
    };
    
    const showYargitayFilter = selectedSources.includes(DS.YARGITAY);
    const showDanistayFilter = selectedSources.includes(DS.DANISTAY);
    const showSayistayFilter = selectedSources.includes(DS.SAYISTAY);
    
    const showDateFilter = selectedSources.length > 0;
    
    const handleSearchClick = () => {
        performSearch(query, 1, localFilters);
        onClose();
    };

    const renderSelect = (
        id: keyof SearchFilters,
        label: string,
        options: string[],
        placeholder: string
    ) => (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <select
                id={id}
                value={localFilters[id] || ''}
                onChange={(e) => handleLocalFilterChange(id, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="">{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    const renderDateInput = (id: keyof SearchFilters, label: string) => (
        <div className="w-full">
             <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
             <input
                type="date"
                id={id}
                value={localFilters[id] || ''}
                onChange={(e) => handleLocalFilterChange(id, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
             />
        </div>
    );

    if (!isFilterPanelOpen) {
        return null;
    }

    return (
        <div className="absolute top-full mt-2 w-full max-w-xl left-1/2 -translate-x-1/2 bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-2xl z-20">
            <h2 className="text-lg font-bold text-slate-100 pb-4 border-b border-slate-700 mb-4">Detaylı Filtreleme</h2>
            
            {showYargitayFilter && renderSelect('yargitayDaire', 'Yargıtay Daire/Kurul', yargitayDaireleri, 'Tüm Daireler')}
            {showDanistayFilter && renderSelect('danistayDaire', 'Danıştay Daire/Kurul', danistayDaireleri, 'Tüm Daireler')}
            {showSayistayFilter && renderSelect('sayistayDaire', 'Sayıştay Daire/Kurul', sayistayDaireleri, 'Tüm Daireler')}

            {showDateFilter && (
                 <div className="mb-4">
                    <p className="block text-sm font-medium text-slate-300 mb-1">Tarih Aralığı</p>
                    <div className="flex gap-2">
                       {renderDateInput('startDate', 'Başlangıç')}
                       {renderDateInput('endDate', 'Bitiş')}
                    </div>
                </div>
            )}
            
            {!showYargitayFilter && !showDanistayFilter && !showSayistayFilter && !showDateFilter && (
                <p className="text-slate-400 text-sm text-center">Seçilen kaynaklar için özel bir filtre bulunmamaktadır.</p>
            )}

            <div className="flex gap-4 mt-6">
                 <button
                    onClick={onClose}
                    className="w-full bg-slate-600 text-white font-semibold py-2 rounded-md hover:bg-slate-700 transition-colors"
                >
                    İptal
                </button>
                <button
                    onClick={handleSearchClick}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Aranıyor...' : 'Filtrele ve Ara'}
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
