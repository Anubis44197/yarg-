
import React, { useEffect } from 'react';
// FIX: Add file extension to type import.
import type { Document } from '../types.ts';
// FIX: Add file extension to icon import.
import { CloseIcon, WarningIcon } from './Icons.tsx';
// FIX: Add file extension to component import.
import Spinner from './Spinner.tsx';

interface DocumentViewerModalProps {
    document: Document | null;
    isLoading: boolean;
    onClose: () => void;
    error: string | null;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, isLoading, onClose, error }) => {
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    {document && !isLoading && (
                        <div className="flex-1 min-w-0">
                            <h2 id="modal-title" className="text-lg font-bold text-white truncate">{document.title}</h2>
                            <p className="text-sm text-slate-400">{document.court} - {document.date}</p>
                        </div>
                    )}
                     {isLoading && <h2 className="text-lg font-bold text-white">Belge Yükleniyor...</h2>}
                     {error && <h2 className="text-lg font-bold text-red-400">Hata</h2>}
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                            <Spinner />
                            <p className="mt-4 font-semibold">Belge içeriği getiriliyor...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                            <WarningIcon className="h-12 w-12 text-red-500 mb-4"/>
                            <p className="font-bold text-lg">Belge Getirilemedi</p>
                            <p className="mt-2 text-sm">{error}</p>
                         </div>
                    )}
                    {!isLoading && !error && document && (
                        <div className="prose prose-slate max-w-none text-slate-300 whitespace-pre-wrap">
                            {document.pageContent}
                        </div>
                    )}
                </main>
            </div>
             {/* Simple fadeIn animation */}
            <style>
            {`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn {
                animation: fadeIn 0.2s ease-in-out;
            }
            `}
            </style>
        </div>
    );
};

export default DocumentViewerModal;