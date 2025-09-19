
import React, { useState, useEffect } from 'react';
import type { DocumentSource, SearchFilters } from '../types';
import { DS } from '../types';
import { CloseIcon, ChevronDownIcon, CheckCircleIcon } from './Icons';
import { useAppContext } from '../context/AppContext.tsx';


// Data for filters, this could come from an API in a real app
const yargitayDaireleri = ["1. Hukuk Dairesi", "2. Hukuk Dairesi", "3. Hukuk Dairesi", "4. Hukuk Dairesi", "1. Ceza Dairesi", "2. Ceza Dairesi", "3. Ceza Dairesi", "Ceza Genel Kurulu", "Hukuk Genel Kurulu"];
const danistayDaireleri = ["1. Daire", "2. Daire", "3. Daire", "Vergi Dava Daireleri Kurulu", "İdari Dava Daireleri Kurulu"];
const sayistayDaireleri = ["1. Daire", "2. Daire", "Temyiz Kurulu"];

const sourceHasFilters = (source: DocumentSource): boolean => {
    return [DS.YARGITAY, DS.DANISTAY, DS.SAYISTAY].includes(source);
}

const ALL_SOURCES = Object.values(DS);

const SourceSelectionModal: React.FC = () => {
    const {
        isSourceModalOpen: isOpen,
        closeSourceModal: onClose,
        handleSourceSelectionContinue: onContinue,
        selectedSources: currentSelection,
        filters: currentFilters
    } = useAppContext();

    const [localSelection, setLocalSelection] = useState<DocumentSource[]>([]);
    const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>({});
    const [expandedSources, setExpandedSources] = useState<DocumentSource[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLocalSelection(currentSelection);
            setLocalFilters(currentFilters);
            // Automatically expand sources that are selected and have filters
            setExpandedSources(currentSelection.filter(sourceHasFilters));
        }
    }, [isOpen, currentSelection, currentFilters]);

    if (!isOpen) return null;

    const toggleSource = (source: DocumentSource) => {
        const isSelected = localSelection.includes(source);
        const newSelection = isSelected ? localSelection.filter(s => s !== source) : [...localSelection, source];
        setLocalSelection(newSelection);

        if (sourceHasFilters(source)) {
            // Automatically expand when selected, collapse when deselected
            if (!isSelected) {
                setExpandedSources(prev => [...prev, source]);
            } else {
                setExpandedSources(prev => prev.filter(s => s !== source));
            }
        }
    };

    const handleFilterChange = (filterName: keyof SearchFilters, value: string) => {
        setLocalFilters(prev => ({ ...prev, [filterName]: value || undefined }));
    };

    const handleContinueClick = () => {
        onContinue(localSelection, localFilters);
    };

    const renderFilterSection = (source: DocumentSource) => {
        if (!localSelection.includes(source)) return null;

        let daireSelect: React.ReactNode = null;
        let daireKey: keyof SearchFilters | undefined;
        let daireOptions: string[] = [];
        let daireLabel = "";

        if (source === DS.YARGITAY) { [daireKey, daireOptions, daireLabel] = ['yargitayDaire', yargitayDaireleri, "Yargıtay Daire/Kurul"]; }
        else if (source === DS.DANISTAY) { [daireKey, daireOptions, daireLabel] = ['danistayDaire', danistayDaireleri, "Danıştay Daire/Kurul"]; }
        else if (source === DS.SAYISTAY) { [daireKey, daireOptions, daireLabel] = ['sayistayDaire', sayistayDaireleri, "Sayıştay Daire/Kurul"]; }
        
        if (!daireKey) return null; // Only render for sources with filters

        return (
            <div className="bg-slate-800/60 p-3 rounded-b-md -mt-1 transition-all duration-300 ease-in-out">
                <div className="mb-3">
                    <label htmlFor={daireKey} className="block text-xs font-medium text-slate-400 mb-1">{daireLabel}</label>
                    <select
                        id={daireKey}
                        value={localFilters[daireKey] || ''}
                        onChange={(e) => handleFilterChange(daireKey!, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tümü</option>
                        {daireOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Tarih Aralığı</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            aria-label="Başlangıç Tarihi"
                            value={localFilters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="date"
                            aria-label="Bitiş Tarihi"
                            value={localFilters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">Arama Kaynaklarını ve Filtreleri Seçin</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_SOURCES.map(source => {
                        const isSelected = localSelection.includes(source);
                        const hasFilters = sourceHasFilters(source);
                        return (
                            <div key={source}>
                                <button
                                    onClick={() => toggleSource(source)}
                                    className={`w-full text-left p-3 border rounded-md flex items-center justify-between transition-all duration-200 ${
                                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                                    } ${hasFilters && isSelected ? 'rounded-b-none' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 mr-3">
                                            {isSelected && <CheckCircleIcon className="text-white" />}
                                        </div>
                                        <span className="font-semibold">{source}</span>
                                    </div>
                                    {hasFilters && <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />}
                                </button>
                                {hasFilters && renderFilterSection(source)}
                            </div>
                        );
                    })}
                </main>

                <footer className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleContinueClick}
                        disabled={localSelection.length === 0}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Devam Et ({localSelection.length} kaynak seçildi)
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SourceSelectionModal;
