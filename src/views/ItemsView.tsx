import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  MoreVertical,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Zap,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { CATEGORIES, calculateDateRelativeLabel, formatCurrency, getCategoryInfo, getPriorityBadge } from '../utils/categoryHelpers';
import { LifeCategory, LifeItem, Priority } from '../types';

export const ItemsView: React.FC = () => {
  const {
    items,
    isPro,
    openSubscriptionUpgrade,
    setIsQuickCaptureOpen,
    setIsRouteOptimizerOpen,
    setSelectedItemForDetail,
    toggleComplete,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
  } = useItems();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'urgent'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'newest' | 'amount'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter items
  const filtered = items.filter((item) => {
    // Status
    if (statusFilter === 'active' && item.completed) return false;
    if (statusFilter === 'completed' && !item.completed) return false;
    if (statusFilter === 'urgent' && (item.priority !== 'high' || item.completed)) return false;

    // Category
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inVendor = item.vendor?.toLowerCase().includes(q) || false;
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inVendor && !inTags) return false;
    }

    return true;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
      return weight[b.priority] - weight[a.priority];
    }
    if (sortBy === 'amount') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Default: date
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              All Life Items
            </h1>
            {!isPro && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                {items.length}/20 Free Items
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {sorted.length} item{sorted.length === 1 ? '' : 's'} organized and managed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRouteOptimizerOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-xs"
            title="Generate fastest route between errands and locations"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Errand Route</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 text-[10px] font-extrabold">
              PRO
            </span>
          </button>

          {!isPro && items.length >= 15 && (
            <button
              onClick={() => openSubscriptionUpgrade('Unlimited Item Vault')}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400/30 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Unlock Unlimited</span>
            </button>
          )}

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Item</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Active ({items.filter((i) => !i.completed).length})
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'urgent'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Urgent ({items.filter((i) => i.priority === 'high' && !i.completed).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Completed ({items.filter((i) => i.completed).length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({items.length})
            </button>
          </div>

          {/* Search input & controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="date">Sort: Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="amount">Sort: Amount</option>
              <option value="newest">Sort: Newest</option>
            </select>

            {/* View toggle */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400'}`}
                title="List view"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
            }`}
          >
            All Categories
          </button>
          {Object.values(CATEGORIES).map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Display */}
      {sorted.length > 0 ? (
        viewMode === 'list' ? (
          /* List View */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-xs">
            {sorted.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              const priorityBadge = getPriorityBadge(item.priority);

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div
                      onClick={() => setSelectedItemForDetail(item)}
                      className="cursor-pointer min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{catInfo.emoji}</span>
                        <h3 className={`text-sm font-bold text-slate-900 dark:text-white truncate ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                          {priorityBadge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            {calculateDateRelativeLabel(item.date)}
                            {item.time && ` @ ${item.time}`}
                          </span>
                        )}
                        {item.amount !== null && (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(item.amount)}
                            {item.recurring && <span className="text-[10px] text-slate-400 font-normal"> /mo</span>}
                          </span>
                        )}
                        {item.vendor && <span>🏬 {item.vendor}</span>}
                        {(item.location || item.locationAddress) && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.location || item.locationAddress}</span>
                          </span>
                        )}
                        {item.attachments?.length > 0 && (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            📎 {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedItemForDetail(item)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              const priorityBadge = getPriorityBadge(item.priority);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{catInfo.emoji}</span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          {catInfo.label}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                        {priorityBadge.label}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm text-slate-900 dark:text-white ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.date ? calculateDateRelativeLabel(item.date) : 'No date'}</span>
                    {item.amount !== null && (
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search or category filter, or click "+ Add Item" to capture a new obligation.
          </p>
        </div>
      )}
    </div>
  );
};
