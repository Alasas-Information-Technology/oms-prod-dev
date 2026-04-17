'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, 
    FileText, 
    User, 
    Building2, 
    Command, 
    ArrowRight, 
    Loader2,
    X,
    LayoutDashboard
} from 'lucide-react';
import { useCommand } from '@/contexts/CommandContext';
import { searchService } from '@/lib/services/searchService';

interface SearchResult {
    id: string;
    type: 'requisition' | 'candidate' | 'vendor' | 'command';
    title: string;
    subtitle?: string;
    url: string;
    metadata?: string;
}

export default function CommandPalette() {
    const { isOpen, setIsOpen } = useCommand();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const defaultCommands: SearchResult[] = [
        { id: 'cmd-dashboard', type: 'command', title: 'Go to Dashboard', subtitle: 'Overview & Metrics', url: '/operations-dashboard' },
        { id: 'cmd-reqs', type: 'command', title: 'View All Requisitions', subtitle: 'Management & Approval', url: '/requisition-management' },
        { id: 'cmd-cands', type: 'command', title: 'Candidate Database', subtitle: 'Profiles & Selection', url: '/candidates' },
        { id: 'cmd-dir', type: 'command', title: 'System Directory', subtitle: 'Vendors & Partners', url: '/system-directory' },
    ];

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const searchResults = await searchService.globalSearch(query);
                setResults(searchResults as SearchResult[]);
                setSelectedIndex(0);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        router.push(result.url);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const total = results.length > 0 ? results.length : defaultCommands.length;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % total);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + total) % total);
        } else if (e.key === 'Enter') {
            const currentItem = results.length > 0 ? results[selectedIndex] : defaultCommands[selectedIndex];
            if (currentItem) handleSelect(currentItem);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette Container */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                {/* Search Header */}
                <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-100 bg-slate-50/50">
                    <Search className="text-slate-400" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search or type a command..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-base"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {isLoading ? (
                        <Loader2 className="animate-spin text-slate-400" size={18} />
                    ) : query ? (
                        <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
                            <X size={16} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">ESC</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                    {query.length > 0 && results.length === 0 && !isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                                <Search className="text-slate-400" size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-600">No results found for &ldquo;{query}&rdquo;</p>
                            <p className="text-xs text-slate-400 mt-1">Try a different search term or command</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Render results or default commands */}
                            {(results.length > 0 ? results : defaultCommands).map((item, idx) => {
                                const isSelected = idx === selectedIndex;
                                const Icon = item.type === 'requisition' ? FileText : 
                                            item.type === 'candidate' ? User : 
                                            item.type === 'vendor' ? Building2 : LayoutDashboard;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors relative ${
                                            isSelected ? 'bg-[hsl(214,67%,32%)]/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                                                isSelected ? 'bg-white shadow-sm text-[hsl(214,67%,32%)]' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-semibold ${isSelected ? 'text-[hsl(214,67%,32%)]' : 'text-slate-700'}`}>
                                                        {item.title}
                                                    </span>
                                                    {item.metadata && (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
                                                            {item.metadata}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 truncate max-w-[400px]">
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="flex items-center gap-1.5 text-[hsl(214,67%,32%)] animate-in fade-in slide-in-from-right-2 duration-200">
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Select</span>
                                                <ArrowRight size={14} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Tips */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-sm">
                                ↑↓
                            </kbd>
                            <span className="text-[10px] font-medium text-slate-400">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-sm">
                                ↵
                            </kbd>
                            <span className="text-[10px] font-medium text-slate-400">Select</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <Command size={10} />
                        <span>Elite Navigation Engine v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
