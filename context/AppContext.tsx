
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import type { Document, PaginatedSearchResults, SearchResultItem, SearchFilters } from '../types';
import { DocumentSource, AnalysisAction } from '../types';
import { searchDocuments, getDocument } from '../services/mockApi';
import { summarizeDocument, compareDocuments } from '../services/geminiService';


interface AppContextState {
  // Search State
  query: string;
  searchResults: PaginatedSearchResults | null;
  isLoadingSearch: boolean;
  searchError: string | null;
  currentPage: number;
  filters: Partial<SearchFilters>;
  isFilterPanelOpen: boolean;
  
  // Source Selection State
  selectedSources: DocumentSource[];
  isSourceModalOpen: boolean; 
  
  // Item Selection & Viewing State
  selectedItems: SearchResultItem[];
  viewingDocument: Document | null;
  isLoadingDocument: boolean;
  documentError: string | null;

  // Analysis State
  analysisResult: string;
  isLoadingAnalysis: boolean;
  analysisError: string | null;
  analysisAction: AnalysisAction | null;

  // Handler Functions
  performSearch: (searchQuery: string, page: number, newFilters: Partial<SearchFilters>) => Promise<void>;
  handleSearch: (newQuery: string) => void;
  handlePageChange: (newPage: number) => void;
  handleSourceSelectionContinue: (sources: DocumentSource[], newFilters: Partial<SearchFilters>) => void;
  handleSelectItem: (item: SearchResultItem) => void;
  handleViewItem: (item: SearchResultItem) => Promise<void>;
  handleCloseDocument: () => void;
  performAnalysis: (action: AnalysisAction) => Promise<void>;
  handleSummarize: () => void;
  handleCompare: () => void;
  toggleFilterPanel: () => void;
  openSourceModal: () => void;
  closeSourceModal: () => void;
  setFilters: React.Dispatch<React.SetStateAction<Partial<SearchFilters>>>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const toggleFilterPanel = () => setIsFilterPanelOpen(prev => !prev);
  const openSourceModal = () => setIsSourceModalOpen(true);
  const closeSourceModal = () => setIsSourceModalOpen(false);


  const value: AppContextState = {
    query,
    searchResults,
    isLoadingSearch,
    searchError,
    currentPage,
    filters,
    isFilterPanelOpen,
    selectedSources,
    isSourceModalOpen,
    selectedItems,
    viewingDocument,
    isLoadingDocument,
    documentError,
    analysisResult,
    isLoadingAnalysis,
    analysisError,
    analysisAction,
    performSearch,
    handleSearch,
    handlePageChange,
    handleSourceSelectionContinue,
    handleSelectItem,
    handleViewItem,
    handleCloseDocument,
    performAnalysis,
    handleSummarize,
    handleCompare,
    toggleFilterPanel,
    openSourceModal,
    closeSourceModal,
    setFilters
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
