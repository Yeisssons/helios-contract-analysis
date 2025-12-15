'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, MessageSquare, Bot, User, Trash2, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContractData } from '@/types/contract';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

interface ChatSession {
    contractId: string;
    messages: Message[];
}

interface ContractChatProps {
    contracts: ContractData[];
    initialContractId?: string;
}

export default function ContractChat({ contracts, initialContractId }: ContractChatProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<string>(initialContractId || '');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-select first contract if none selected
    useEffect(() => {
        if (!selectedContractId && contracts.length > 0) {
            setSelectedContractId(contracts[0].id);
        }
    }, [contracts, selectedContractId]);

    // Update selected contract if initialContractId changes (nav from details page)
    useEffect(() => {
        if (initialContractId) {
            setSelectedContractId(initialContractId);
            setIsOpen(true); // Auto-open if navigating with intent
        }
    }, [initialContractId]);

    // Load history from localStorage on contract change
    useEffect(() => {
        if (selectedContractId) {
            const saved = localStorage.getItem(`chat_${selectedContractId}`);
            if (saved) {
                setMessages(JSON.parse(saved));
            } else {
                setMessages([]);
            }
        }
    }, [selectedContractId]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || !selectedContractId) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        localStorage.setItem(`chat_${selectedContractId}`, JSON.stringify(updatedMessages));
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId: selectedContractId,
                    message: userMsg.content,
                    history: messages.slice(-10) // Send last 10 messages for context
                })
            });

            if (!response.ok) throw new Error('Network error');
            if (!response.body) throw new Error('No body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';

            // Create placeholder AI message
            const aiMsgId = crypto.randomUUID();

            // Stream loop
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiContent += chunk;

                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== aiMsgId);
                    return [...filtered, {
                        id: aiMsgId,
                        role: 'model',
                        content: aiContent,
                        timestamp: Date.now()
                    }];
                });
            }

            // Final save
            const finalMessages = [...updatedMessages, {
                id: aiMsgId,
                role: 'model',
                content: aiContent,
                timestamp: Date.now()
            }];
            localStorage.setItem(`chat_${selectedContractId}`, JSON.stringify(finalMessages));

        } catch (error) {
            console.error('Chat error:', error);
            // Append error message
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'model',
                content: language === 'es' ? 'Lo siento, hubo un error de conexión.' : 'Sorry, connection error occurred.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
            if (inputRef.current) inputRef.current.focus();
        }
    };

    const handleClearChat = () => {
        if (confirm(language === 'es' ? '¿Borrar historial?' : 'Clear history?')) {
            setMessages([]);
            localStorage.removeItem(`chat_${selectedContractId}`);
        }
    };

    const activeContract = contracts.find(c => c.id === selectedContractId);

    if (contracts.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 md:static md:inset-auto z-[60] md:z-auto w-full h-full md:w-[380px] md:h-[600px] md:max-h-[80vh] flex flex-col bg-zinc-900/95 backdrop-blur-xl border-none md:border md:border-white/10 rounded-none md:rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white">Helios AI</span>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleClearChat} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Clear Chat">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Contract Selector */}
                        <div className="px-4 py-2 bg-black/20 border-b border-white/5">
                            <div className="relative">
                                <select
                                    value={selectedContractId}
                                    onChange={(e) => setSelectedContractId(e.target.value)}
                                    className="w-full appearance-none bg-zinc-800 text-xs text-zinc-300 py-1.5 pl-3 pr-8 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500/50"
                                >
                                    {contracts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            📄 {c.fileName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                                    <Sparkles className="w-12 h-12 text-indigo-400 mb-4" />
                                    <p className="text-sm text-zinc-300 font-medium">
                                        {language === 'es' ? 'Pregúntame sobre este contrato' : 'Ask me about this contract'}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        {language === 'es'
                                            ? 'Puedo analizar cláusulas, fechas y riesgos.'
                                            : 'I can analyze clauses, dates, and risks.'}
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                            ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-indigo-600'}
                                        `}>
                                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className={`
                                            max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-zinc-800 text-white rounded-tr-sm'
                                                : 'bg-indigo-500/10 text-zinc-200 border border-indigo-500/20 rounded-tl-sm'}
                                        `}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-zinc-500 text-xs ml-12">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-zinc-900 border-t border-white/10">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={language === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'}
                                    className="w-full bg-black/20 text-white text-sm rounded-xl pl-4 pr-12 py-3 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none max-h-32 scrollbar-hide"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all group"
                >
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">
                        {language === 'es' ? 'Chat con IA' : 'AI Chat'}
                    </span>
                </motion.button>
            )}
        </div>
    );
}
