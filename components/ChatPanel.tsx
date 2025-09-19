

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types.ts';
import { getChatResponse } from '../services/geminiService.ts';
import { SendIcon } from './Icons.tsx';
import Spinner from './Spinner.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const ChatPanel: React.FC = () => {
    const { analysisResult: analysisContext } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
      // Clear chat when context changes
      setMessages([]);
    }, [analysisContext]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const history = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        // Add the analysis context to the history for the first user message
        if (history.length === 0 && analysisContext) {
            history.unshift({
                role: 'model',
                parts: [{ text: `İşte analiz edilen belgelerin özeti: ${analysisContext}` }]
            }, {
                role: 'user',
                parts: [{ text: "Yukarıdaki analize göre..." }]
            });
        }

        const response = await getChatResponse(history, input);
        const newModelMessage: ChatMessage = { role: 'model', content: response };

        setMessages(prev => [...prev, newModelMessage]);
        setIsLoading(false);
    };

    if (!analysisContext) return null;

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-6 flex flex-col max-h-[50vh]">
            <h3 className="text-md font-bold text-slate-100 pb-3 border-b border-slate-700 mb-3">Analiz Üzerine Sohbet Et</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 text-sm p-4">
                        Analiz hakkında bir soru sorarak sohbete başlayın.
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-md p-3 rounded-lg bg-slate-700 text-slate-200 flex items-center">
                            <Spinner />
                            <span className="ml-2">Yazılıyor...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex gap-2 border-t border-slate-700 pt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Analiz hakkında soru sorun..."
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="flex-shrink-0 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Gönder"
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
