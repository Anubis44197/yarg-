
import React from 'react';

// Component Imports
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import AnalysisViewer from './components/AnalysisViewer';
import DocumentViewerModal from './components/DocumentViewerModal';
import SourceSelectionModal from './components/SourceSelectionModal';
import FilterPanel from './components/FilterPanel';
import ChatPanel from './components/ChatPanel';
import { InfoIcon } from './components/Icons';

// Context Hook
import { useAppContext } from './context/AppContext.tsx';

const App: React.FC = () => {
  const {
    searchResults,
    isLoadingSearch,
    searchError,
    analysisResult,
    isLoadingAnalysis,
    analysisError,
    selectedSources,
    openSourceModal,
  } = useAppContext();

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
                        <SearchBar />
                        <FilterPanel />
                    </div>
                    <button 
                        onClick={openSourceModal}
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
                        <ResultsList />
                    </div>
                    <div className="lg:col-span-2">
                        <AnalysisViewer />
                        {analysisResult && !isLoadingAnalysis && !analysisError && (
                            <ChatPanel />
                        )}
                    </div>
                </div>
            )}
        </main>
        
        <SourceSelectionModal />
        <DocumentViewerModal />
    </div>
  );
};

export default App;
