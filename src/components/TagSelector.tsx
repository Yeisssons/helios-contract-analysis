'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Tag, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TAG_PRESETS, TAG_COLOR_CLASSES, TagId } from '@/constants/tags';

interface TagSelectorProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    maxTags?: number;
}

export default function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }: TagSelectorProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter(t => t !== tagId));
        } else if (selectedTags.length < maxTags) {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    const removeTag = (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onTagsChange(selectedTags.filter(t => t !== tagId));
    };

    const getTagLabel = (tagId: string) => {
        const preset = TAG_PRESETS.find(t => t.id === tagId);
        return preset ? (language === 'es' ? preset.labelEs : preset.labelEn) : tagId;
    };

    const getTagColor = (tagId: string) => {
        const preset = TAG_PRESETS.find(t => t.id === tagId);
        return preset ? TAG_COLOR_CLASSES[preset.color] : TAG_COLOR_CLASSES.gray;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm text-slate-300 transition-colors"
            >
                <Tag className="w-4 h-4" />
                <span>{language === 'es' ? 'Etiquetas' : 'Tags'}</span>
                {selectedTags.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        {selectedTags.length}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map(tagId => {
                        const colors = getTagColor(tagId);
                        return (
                            <motion.div
                                key={tagId}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                                {getTagLabel(tagId)}
                                <button
                                    onClick={(e) => removeTag(tagId, e)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-2">
                            <p className="text-xs text-slate-500 px-2 py-1">
                                {language === 'es' ? `Seleccionar (máx. ${maxTags})` : `Select (max ${maxTags})`}
                            </p>
                            <div className="space-y-1 mt-2">
                                {TAG_PRESETS.map(tag => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    const colors = TAG_COLOR_CLASSES[tag.color];
                                    const isDisabled = !isSelected && selectedTags.length >= maxTags;

                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => !isDisabled && toggleTag(tag.id)}
                                            disabled={isDisabled}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isSelected
                                                    ? `${colors.bg} ${colors.text} ${colors.border} border`
                                                    : isDisabled
                                                        ? 'text-slate-600 cursor-not-allowed'
                                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${isSelected ? colors.bg : 'bg-slate-700'}`} />
                                            {language === 'es' ? tag.labelEs : tag.labelEn}
                                            {isSelected && <span className="ml-auto">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
