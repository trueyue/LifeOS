import React from 'react';
import {
  Sparkles,
  Plus,
  ArrowRight,
  AlertCircle,
  Calendar as CalendarIcon,
  Receipt,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Building2,
  Zap,
  MapPin,
  Compass,
  Wallet,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import {
  calculateDateRelativeLabel,
  formatCurrency,
  getCategoryInfo,
  getPriorityBadge,
} from '../utils/categoryHelpers';
import { LifeCategory, LifeItem } from '../types';

export const DashboardView: React.FC = () => {
  const {
    items,
    dailySummary,
    setIsQuickCaptureOpen,
    setIsRouteOptimizerOpen,
    openAIBudgetAdvisor,
    openQuickCaptureWithPrompt,
    setSelectedItemForDetail,
    toggleComplete,
    setActiveTab,
    setSelectedCategoryFilter,
  } = useItems();
  const { user } = useAuth();

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  // Group items by timeframes
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const todayItems = activeItems.filter((i) => i.date === todayStr);
  const tomorrowItems = activeItems.filter((i) => i.date === tomorrowStr);
  const upcomingThisWeekItems = activeItems.filter(
    (i) => i.date && i.date !== todayStr && i.date !== tomorrowStr && !i.date.includes('202')
  );
  const otherActiveItems = activeItems.filter(
    (i) => !todayItems.includes(i) && !tomorrowItems.includes(i) && !upcomingThisWeekItems.includes(i)
  );

  const sampleQuickCaptures = [
    'Car oil change in October',
    'Cancel Netflix trial on Friday',
    'Dentist at 2:30 PM Friday',
    'Electric bill $143 due Sep 5',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Top Greeting & Quick Capture Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Daily Life Overview
                </span>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                {dailySummary.greeting}
              </h1>
              <p className="text-sm text-slate-300 max-w-xl mt-1">
                {dailySummary.summaryText}
              </p>
            </div>

            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Tell LifeOS Anything</span>
            </button>
          </div>

          {/* Prompt chips */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 shrink-0">Quick capture:</span>
            {sampleQuickCaptures.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => openQuickCaptureWithPrompt(prompt)}
                className="text-xs py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 shrink-0 border border-white/10 transition-colors"
              >
                + "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Things Worth Knowing (Prioritized 3-5 alerts) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Things worth knowing
            </h2>
          </div>
          <span className="text-xs text-slate-400">Prioritized for your attention</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {dailySummary.worthKnowing.map((item) => {
            const catInfo = getCategoryInfo(item.category);
            const targetItem = items.find((i) => i.id === item.itemId);

            const urgencyStyles = {
              urgent: 'border-l-4 border-l-red-500 bg-red-50/40 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/40',
              warning: 'border-l-4 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40',
              info: 'border-l-4 border-l-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/40',
            }[item.urgency];

            const dotEmoji = item.urgency === 'urgent' ? '🔴' : item.urgency === 'warning' ? '🟡' : '🟢';

            return (
              <div
                key={item.id}
                onClick={() => targetItem && setSelectedItemForDetail(targetItem)}
                className={`p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2 ${urgencyStyles}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>{catInfo.emoji}</span>
                      <span>{catInfo.label}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {dotEmoji} {item.dateLabel}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Metric Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Urgent Actions */}
        <div
          onClick={() => setActiveTab('items')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Urgent Attention</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {dailySummary.stats.urgentCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">High priority obligations</p>
        </div>

        {/* Due Today */}
        <div
          onClick={() => setActiveTab('calendar')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Due Today</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {dailySummary.stats.upcomingToday}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Deliveries & schedules</p>
        </div>

        {/* Monthly Bills */}
        <div
          onClick={() => setActiveTab('bills')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Monthly Bills</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {formatCurrency(dailySummary.stats.monthlyBillsTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active recurring utilities</p>
        </div>

        {/* Active Warranties */}
        <div
          onClick={() => setActiveTab('purchases')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Warranties Active</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {dailySummary.stats.activeWarranties}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tracked purchases & claims</p>
        </div>
      </div>

      {/* 4. Upcoming Timeline & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timeline Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Upcoming Timeline
            </h2>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Today's section */}
            {todayItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Today
                  </span>
                  <span className="text-xs text-slate-400">{todayItems.length} item(s)</span>
                </div>
                <div className="space-y-2">
                  {todayItems.map((item) => (
                    <ItemRow key={item.id} item={item} onSelect={setSelectedItemForDetail} onToggle={toggleComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Tomorrow's section */}
            {tomorrowItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Tomorrow
                  </span>
                  <span className="text-xs text-slate-400">{tomorrowItems.length} item(s)</span>
                </div>
                <div className="space-y-2">
                  {tomorrowItems.map((item) => (
                    <ItemRow key={item.id} item={item} onSelect={setSelectedItemForDetail} onToggle={toggleComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Later this month / scheduled */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Upcoming Schedules
                </span>
                <span className="text-xs text-slate-400">
                  {otherActiveItems.length + upcomingThisWeekItems.length} items
                </span>
              </div>
              <div className="space-y-2">
                {[...upcomingThisWeekItems, ...otherActiveItems].slice(0, 5).map((item) => (
                  <ItemRow key={item.id} item={item} onSelect={setSelectedItemForDetail} onToggle={toggleComplete} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Quick Hub Column */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Life Hub Shortcuts
          </h2>

          <div className="space-y-2.5">
            {/* Bills & Utilities */}
            <button
              onClick={() => setActiveTab('bills')}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bills & Due Dates</h4>
                  <p className="text-[11px] text-slate-400">Never miss a payment deadline</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>

            {/* Banking & Direct Pay */}
            <button
              onClick={() => setActiveTab('banking')}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Banking & Direct Pay</h4>
                  <p className="text-[11px] text-slate-400">Link banks & pay bills directly</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>

            {/* Subscriptions */}
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Subscriptions</h4>
                  <p className="text-[11px] text-slate-400">Cancel trials & avoid renewals</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>

            {/* Warranties */}
            <button
              onClick={() => setActiveTab('purchases')}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Purchases & Warranties</h4>
                  <p className="text-[11px] text-slate-400">Track coverage & receipt proofs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            </button>

            {/* Smart Route Optimizer (Pro Feature) */}
            <button
              onClick={() => setIsRouteOptimizerOpen(true)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 text-left flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Errand Route Optimizer</h4>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-extrabold">PRO</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Generate fastest path between locations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" />
            </button>

            {/* AI Budget & Spending Advisor (Pro Feature) */}
            <button
              onClick={openAIBudgetAdvisor}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-left flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Budget Advisor</h4>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-extrabold">PRO</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">50/30/20 breakdown & subscription leak audit</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
            </button>

            {/* AI Assistant Banner */}
            <div
              onClick={() => setActiveTab('assistant')}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-800/60 cursor-pointer hover:border-indigo-300 transition-all space-y-2"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Ask LifeOS Assistant
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                "What do I need to worry about this week?" Ask questions about your personal life anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemRow: React.FC<{
  item: LifeItem;
  onSelect: (item: LifeItem) => void;
  onToggle: (id: string) => void;
}> = ({ item, onSelect, onToggle }) => {
  const catInfo = getCategoryInfo(item.category);
  const priorityBadge = getPriorityBadge(item.priority);

  return (
    <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800/40 group">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className="p-1 rounded text-slate-400 hover:text-emerald-600 shrink-0"
        >
          {item.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>

        <div onClick={() => onSelect(item)} className="cursor-pointer min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs shrink-0">{catInfo.emoji}</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {item.title}
            </p>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
              {priorityBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
            {item.date && <span>📅 {calculateDateRelativeLabel(item.date)}</span>}
            {item.amount && <span>💵 {formatCurrency(item.amount)}</span>}
            {item.vendor && <span>🏬 {item.vendor}</span>}
            {(item.location || item.locationAddress) && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <MapPin className="w-2.5 h-2.5" />
                <span>{item.location || item.locationAddress}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelect(item)}
        className="p-1 text-slate-400 group-hover:text-indigo-600 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
