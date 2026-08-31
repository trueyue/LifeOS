import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, DollarSign, ArrowRight, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { CATEGORIES, getCategoryInfo, getPriorityBadge } from '../../utils/categoryHelpers';
import { LifeCategory, LifeItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalSearchModal: React.FC = () => {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen, items, setSelectedItemForDetail, toggleComplete, setActiveTab } = useItems();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setQuery('');
      setSelectedCategory('all');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isGlobalSearchOpen]);

  // Handle ⌘K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;

    const inTitle = item.title.toLowerCase().includes(q);
    const inDesc = item.description.toLowerCase().includes(q);
    const inVendor = item.vendor?.toLowerCase().includes(q) || false;
    const inNotes = item.notes?.toLowerCase().includes(q) || false;
    const inTags = item.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && (inTitle || inDesc || inVendor || inNotes || inTags);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsGlobalSearchOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[80vh]"
        >
          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all life items, bills, warranties, notes..."
              className="flex-1 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              All Items ({items.length})
            </button>
            {Object.values(CATEGORIES).map((cat) => {
              const count = items.filter((i) => i.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const catInfo = getCategoryInfo(item.category);
                const priorityBadge = getPriorityBadge(item.priority);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItemForDetail(item);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{catInfo.emoji}</span>
                          <p className={`text-sm font-semibold text-slate-900 dark:text-white truncate ${item.completed ? 'line-through text-slate-400' : ''}`}>
                            {item.title}
                          </p>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          {item.date && <span>📅 {item.date}</span>}
                          {item.amount && <span>💵 ${item.amount}</span>}
                          {item.vendor && <span>🏬 {item.vendor}</span>}
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedItemForDetail(item);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-indigo-600 hover:text-indigo-700 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm">
                No items match "{query}". Try a different term or search category.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
