import React from 'react';
import { Search, Plus, Bell, Sparkles, SlidersHorizontal, Zap } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setIsQuickCaptureOpen,
    setIsGlobalSearchOpen,
    setIsNotificationsOpen,
    unreadNotificationCount,
    dailySummary,
    isPro,
    openSubscriptionUpgrade,
  } = useItems();
  const { user } = useAuth();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return dailySummary.greeting;
      case 'calendar':
        return 'Calendar & Schedule';
      case 'items':
        return 'All Life Items';
      case 'bills':
        return 'Bills & Due Dates';
      case 'banking':
        return 'Banking & Direct Pay';
      case 'subscriptions':
        return 'Subscriptions & Renewals';
      case 'purchases':
        return 'Purchases & Warranties';
      case 'documents':
        return 'Document Vault';
      case 'assistant':
        return 'Ask LifeOS Assistant';
      case 'household':
        return 'Household & Family';
      case 'owner-revenue':
        return 'Owner Withdrawal & Revenue';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'LifeOS';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Title / Greeting */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base font-display text-slate-900 dark:text-white">LifeOS</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
            {getPageTitle()}
          </h1>
          {activeTab === 'dashboard' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You don’t manage your life. LifeOS manages it for you.
            </p>
          )}
        </div>
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span>Search bills, warranties, appointments...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Membership Status / Upgrade Pill */}
        {isPro ? (
          <button
            onClick={() => openSubscriptionUpgrade()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/60 dark:to-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-slate-900 dark:text-white text-xs font-bold shadow-xs hover:border-amber-400 transition-all"
            title="Manage Pro Subscription"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRO</span>
          </button>
        ) : (
          <button
            onClick={() => openSubscriptionUpgrade()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-sm active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Upgrade $7.99</span>
          </button>
        )}

        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:border-slate-800 transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>

        {/* Quick Capture Button (Desktop) */}
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Add Anything</span>
        </button>
      </div>
    </header>
  );
};

