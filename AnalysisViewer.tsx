import React from 'react';
// FIX: Corrected import path for types from root directory.
import type { AnalysisAction, SearchResultItem } from './types.ts';
// FIX: Corrected import path for types from root directory.
import { AnalysisAction as AA } from './types.ts';
// FIX: Corrected import path for Spinner component from components directory.
import Spinner from './components/Spinner.tsx';
// FIX: Corrected import path for Icon components from components directory.
import { WarningIcon, InfoIcon } from './components/Icons.tsx';

// A simple but effective markdown-to-jsx parser
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="prose prose-slate max-w-none text-slate-300 prose-headings:text-white prose-strong:text-white prose-li:marker:text-slate-500">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="font-bold mt-4 mb-2 text-lg">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="font-bold mt-6 mb-3 text-xl border-b border-slate-700 pb-2">{line.substring(3)}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="font-bold mt-8 mb-4 text-2xl">{line.substring(2)}</h1>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
                }
                 if (/^\d+\.\s/.test(line)) {
                    return <li key={index} className="ml-5 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                }
                if (line.trim() === '---') {
                    return <hr key={index} className="my-4 border-slate-700" />;
                }
                // Bold text with **text**
                const boldedLine = line.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                );

                return <p key={index}>{boldedLine}</p>;
            })}
        </div>
    );
};

interface AnalysisViewerProps {
  result: string;
  isLoading: boolean;
  error: string | null;
  action: AnalysisAction | null;
  selectedDocuments: SearchResultItem[];
}

const AnalysisViewer: React.FC<AnalysisViewerProps> = ({ result, isLoading, error, action, selectedDocuments }) => {
  const getLoadingMessage = (): string => {
    if (action === AA.SUMMARIZE) {
      return `"${selectedDocuments[0]?.title}" başlıklı belge özetleniyor...`;
    }
    if (action === AA.COMPARE) {
      return `${selectedDocuments.length} adet belge karşılaştırılıyor...`;
    }
    return 'Analiz yapılıyor, lütfen bekleyin...';
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 sticky top-24 min-h-[60vh] flex flex-col">
      <h2 className="text-lg font-bold text-slate-100 pb-4 border-b border-slate-700 mb-4">Gemini Analizi</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <Spinner />
            <p className="mt-4 font-semibold">{getLoadingMessage()}</p>
            <p className="text-sm text-slate-500">Bu işlem birkaç saniye sürebilir.</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
             <WarningIcon className="h-12 w-12 text-red-500 mb-4"/>
            <p className="font-bold text-lg">Bir Hata Oluştu</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && result && (
            <SimpleMarkdown content={result} />
        )}
        {!isLoading && !error && !result && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 bg-slate-800 p-4 rounded-lg">
            <InfoIcon className="h-12 w-12 text-slate-500 mb-4"/>
            <p className="font-bold">Analiz Sonuçları Burada Görüntülenir</p>
            <p className="mt-2 text-sm">Lütfen soldaki listeden bir veya daha fazla belge seçip "Özetle" veya "Karşılaştır" butonlarına tıklayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisViewer;