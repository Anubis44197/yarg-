import React, { useState, useEffect, useCallback } from 'react';

// Component Imports
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import AnalysisViewer from './components/AnalysisViewer';
import DocumentViewerModal from './components/DocumentViewerModal';
import SourceSelectionModal from './components/SourceSelectionModal';
import FilterPanel from './components/FilterPanel';
import ChatPanel from './components/ChatPanel';
import { InfoIcon } from './components/Icons';

// Type Imports
import type { Document, PaginatedSearchResults, SearchResultItem, SearchFilters } from './types';
import { DocumentSource, AnalysisAction } from './types';

// API Service Imports
import { searchDocuments, getDocument } from './services/mockApi';
import { summarizeDocument, compareDocuments } from './services/geminiService';

const App: React.FC = () => {
  // Search State
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PaginatedSearchResults | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Source Selection State
  const [selectedSources, setSelectedSources] = useState<DocumentSource[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false); 
  
  // Item Selection & Viewing State
  const [selectedItems, setSelectedItems] = useState<SearchResultItem[]>([]);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisAction, setAnalysisAction] = useState<AnalysisAction | null>(null);

  const performSearch = useCallback(async (searchQuery: string, page: number, newFilters: Partial<SearchFilters>) => {
    if (!searchQuery.trim() || selectedSources.length === 0) {
        setIsSourceModalOpen(true);
        return;
    };

    setIsLoadingSearch(true);
    setSearchError(null);
    if(page === 1) setSearchResults(null); 
    setQuery(searchQuery);
    setCurrentPage(page);
    setFilters(newFilters);
    setIsFilterPanelOpen(false);

    try {
      const results = await searchDocuments(selectedSources, searchQuery, newFilters, page);
      setSearchResults(results);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoadingSearch(false);
    }
  }, [selectedSources]);

  const handleSearch = (newQuery: string) => {
    performSearch(newQuery, 1, filters);
  };
  
  const handlePageChange = (newPage: number) => {
    if(query) performSearch(query, newPage, filters);
  };

  const handleSourceSelectionContinue = (sources: DocumentSource[], newFilters: Partial<SearchFilters>) => {
    setSelectedSources(sources);
    setFilters(newFilters);
    setIsSourceModalOpen(false);
    if (query) {
        performSearch(query, 1, newFilters);
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    setSelectedItems(prev => 
      prev.some(selected => selected.id === item.id)
        ? prev.filter(selected => selected.id !== item.id)
        : [...prev, item]
    );
  };

  const handleViewItem = async (item: SearchResultItem) => {
    setIsLoadingDocument(true);
    setDocumentError(null);
    setViewingDocument({ ...item, pageContent: '', court: '' }); // Show modal immediately with partial data
    try {
        const fullDoc = await getDocument(item.source, item.id);
        setViewingDocument(fullDoc);
    } catch (error) {
        setDocumentError(error instanceof Error ? error.message : 'Belge yüklenemedi.');
    } finally {
        setIsLoadingDocument(false);
    }
  };

  const handleCloseDocument = () => {
    setViewingDocument(null);
  };
  
  const performAnalysis = async (action: AnalysisAction) => {
    setAnalysisAction(action);
    setIsLoadingAnalysis(true);
    setAnalysisResult('');
    setAnalysisError(null);

    try {
        let docsToAnalyze: Document[] = [];
        // Fetch full documents for analysis
        for (const item of selectedItems) {
            docsToAnalyze.push(await getDocument(item.source, item.id));
        }

        let result = '';
        if (action === AnalysisAction.SUMMARIZE) {
            result = await summarizeDocument(docsToAnalyze[0]);
        } else if (action === AnalysisAction.COMPARE) {
            result = await compareDocuments(docsToAnalyze);
        }
        setAnalysisResult(result);

    } catch (error) {
        setAnalysisError(error instanceof Error ? error.message : 'Analiz sırasında bir hata oluştu.');
    } finally {
        setIsLoadingAnalysis(false);
    }
  };

  const handleSummarize = () => {
      if (selectedItems.length !== 1) return;
      performAnalysis(AnalysisAction.SUMMARIZE);
  };

  const handleCompare = () => {
      if (selectedItems.length < 2) return;
      performAnalysis(AnalysisAction.COMPARE);
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8 rounded-lg bg-slate-800/50 border border-slate-700 h-full mt-8">
       <InfoIcon className="h-16 w-16 text-slate-500 mb-4" />
       <h2 className="text-2xl font-bold text-slate-200">Aramaya Hoş Geldiniz</h2>
       <p className="mt-2 max-w-md">Başlamak için arama kaynaklarını seçin ve yukarıdaki arama çubuğunu kullanın.</p>
   </div>
  );

  return (
    <div className="min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-serif font-bold text-white">Hukuk Karar Arama & Analiz</h1>
                        <p className="text-sm text-slate-400 mt-1">Gemini AI destekli arama motoru ile Yüksek Mahkeme kararlarına ve daha fazlasına ulaşın.</p>
                    </div>
                    <div className="w-full max-w-3xl relative">
                        <SearchBar 
                            onSearch={handleSearch}
                            isLoading={isLoadingSearch}
                            isSourceSelectionDisabled={false}
                            onToggleFilters={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            showFiltersButton={selectedSources.length > 0}
                        />
                         {isFilterPanelOpen && (
                            <FilterPanel 
                                selectedSources={selectedSources}
                                filters={filters}
                                onFilterChange={setFilters}
                                onSearch={(newFilters) => performSearch(query, 1, newFilters)}
                                onClose={() => setIsFilterPanelOpen(false)}
                                isLoading={isLoadingSearch}
                            />
                        )}
                    </div>
                    <button 
                        onClick={() => setIsSourceModalOpen(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Kaynakları & Filtreleri Yönet ({selectedSources.length})
                    </button>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!searchResults && !isLoadingSearch && !searchError ? (
                 <div className="max-w-4xl mx-auto"><WelcomeScreen /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <ResultsList
                            results={searchResults}
                            isLoading={isLoadingSearch}
                            error={searchError}
                            selectedItems={selectedItems}
                            onSelectItem={handleSelectItem}
                            onViewItem={handleViewItem}
                            onPageChange={handlePageChange}
                            onSummarize={handleSummarize}
                            onCompare={handleCompare}
                            query={query}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <AnalysisViewer 
                            result={analysisResult}
                            isLoading={isLoadingAnalysis}
                            error={analysisError}
                            action={analysisAction}
                            selectedDocuments={selectedItems}
                        />
                        {analysisResult && !isLoadingAnalysis && !analysisError && (
                            <ChatPanel analysisContext={analysisResult} />
                        )}
                    </div>
                </div>
            )}
        </main>
        
        {isSourceModalOpen && (
            <SourceSelectionModal
                isOpen={isSourceModalOpen}
                onClose={() => setIsSourceModalOpen(false)}
                onContinue={handleSourceSelectionContinue}
                currentSelection={selectedSources}
                currentFilters={filters}
            />
        )}
        
        {viewingDocument && (
            <DocumentViewerModal 
                document={viewingDocument}
                isLoading={isLoadingDocument}
                error={documentError}
                onClose={handleCloseDocument}
            />
        )}
    </div>
  );
};

export default App;
