import React, { useState } from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  Plus,
  CheckSquare,
  Menu,
  X,
  Receipt,
  Building2,
  CreditCard,
  ShieldCheck,
  FileText,
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  DollarSign,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickCaptureOpen, items, isPro, openSubscriptionUpgrade } = useItems();
  const { user, isOwner, logout, theme, setTheme } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const activeItems = items.filter((i) => !i.completed);
  const billsCount = activeItems.filter((i) => i.category === 'bill').length;
  const subsCount = activeItems.filter((i) => i.category === 'subscription').length;
  const purchasesCount = activeItems.filter((i) => i.category === 'purchase' || i.warrantyLengthMonths).length;

  const baseMoreItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; count?: number }> = [
    { id: 'bills', label: 'Bills', icon: Receipt, count: billsCount },
    { id: 'banking', label: 'Banking & Pay', icon: Building2 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subsCount },
    { id: 'purchases', label: 'Purchases & Warranties', icon: ShieldCheck, count: purchasesCount },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'assistant', label: 'Ask LifeOS', icon: MessageSquare },
    { id: 'household', label: 'Household', icon: Users },
  ];

  const moreItems = [
    ...baseMoreItems,
    ...(isOwner ? [{ id: 'owner-revenue' as ActiveTab, label: 'Withdrawal', icon: DollarSign }] : []),
    { id: 'settings' as ActiveTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 pb-safe shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Home */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMoreOpen(false);
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeTab === 'dashboard' && !isMoreOpen
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* Calendar */}
          <button
            onClick={() => {
              setActiveTab('calendar');
              setIsMoreOpen(false);
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeTab === 'calendar' && !isMoreOpen
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Calendar</span>
          </button>

          {/* Prominent Center Add Button */}
          <div className="relative -top-3">
            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              aria-label="Add Anything"
              className="w-14 h-14 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Items */}
          <button
            onClick={() => {
              setActiveTab('items');
              setIsMoreOpen(false);
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
              activeTab === 'items' && !isMoreOpen
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Items</span>
            {activeItems.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* More */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              isMoreOpen || !['dashboard', 'calendar', 'items'].includes(activeTab)
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* More Sheet Overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 pb-safe max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-base text-slate-900 dark:text-white font-display">LifeOS Navigation</span>
                </div>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-2 gap-2.5 py-4">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isProFeature = ['banking', 'household', 'documents', 'purchases'].includes(item.id);

                  const handleClick = () => {
                    if (!isPro && isProFeature) {
                      setIsMoreOpen(false);
                      openSubscriptionUpgrade(item.label);
                      return;
                    }
                    setActiveTab(item.id);
                    setIsMoreOpen(false);
                  };

                  return (
                    <button
                      key={item.id}
                      onClick={handleClick}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 active:scale-[0.98]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-medium truncate">{item.label}</p>
                          {!isPro && isProFeature && (
                            <span className="text-[8px] font-bold px-1 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300">PRO</span>
                          )}
                        </div>
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span className="text-[10px] text-slate-400">{item.count} items</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Pro Upgrade Banner */}
              <div className="pb-3">
                {isPro ? (
                  <button
                    onClick={() => {
                      openSubscriptionUpgrade();
                      setIsMoreOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">⭐</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">LifeOS Pro Member</p>
                        <p className="text-[10px] text-slate-500">$7.99/mo Active • Unlimited Access</p>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Manage</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      openSubscriptionUpgrade();
                      setIsMoreOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-left flex items-center justify-between shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <div>
                        <p className="text-xs font-extrabold">Upgrade to Pro ($7.99/mo)</p>
                        <p className="text-[10px] font-medium opacity-80">Unlimited items, AI & Direct Pay</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-slate-950 text-white px-2.5 py-1 rounded-xl">Upgrade</span>
                  </button>
                )}
              </div>

              {/* Profile & Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.displayName || 'Alex'}</p>
                    <p className="text-[10px] text-slate-400">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMoreOpen(false);
                    }}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
