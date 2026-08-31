import React from 'react';
import {
  Sparkles,
  Home,
  Calendar as CalendarIcon,
  CheckSquare,
  Receipt,
  Building2,
  CreditCard,
  ShieldCheck,
  FileText,
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  Plus,
  Moon,
  Sun,
  LogOut,
  Bell,
  DollarSign,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';

interface NavIconProps {
  className?: string;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<NavIconProps>;
  count?: number;
}

interface SidebarItemLike {
  completed?: boolean;
  category?: string;
  warrantyLengthMonths?: number | null;
  attachments?: Array<unknown>;
}

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsQuickCaptureOpen,
    items,
    unreadNotificationCount,
    setIsNotificationsOpen,
    isPro,
    openSubscriptionUpgrade,
  } = useItems();
  const { user, isOwner, logout, theme, setTheme } = useAuth();

  const activeItems = items.filter((i: SidebarItemLike) => !i.completed);
  const billsCount = activeItems.filter((i: SidebarItemLike) => i.category === 'bill').length;
  const subsCount = activeItems.filter((i: SidebarItemLike) => i.category === 'subscription').length;
  const purchasesCount = activeItems.filter((i: SidebarItemLike) => i.category === 'purchase' || i.warrantyLengthMonths).length;
  const docsCount = activeItems.filter((i: SidebarItemLike) => i.category === 'document' || (i.attachments?.length ?? 0) > 0).length;

  const baseNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'items', label: 'Items', icon: CheckSquare, count: activeItems.length },
    { id: 'bills', label: 'Bills', icon: Receipt, count: billsCount },
    { id: 'banking', label: 'Banking & Pay', icon: Building2 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subsCount },
    { id: 'purchases', label: 'Purchases', icon: ShieldCheck, count: purchasesCount },
    { id: 'documents', label: 'Documents', icon: FileText, count: docsCount },
    { id: 'assistant', label: 'Ask LifeOS', icon: MessageSquare },
    { id: 'household', label: 'Household', icon: Users },
  ];

  // Owner Withdrawal tab is only visible to the verified app owner (ntaijo.fn@gmail.com)
  const navItems: NavItem[] = [
    ...baseNavItems,
    ...(isOwner ? [{ id: 'owner-revenue' as ActiveTab, label: 'Withdrawal', icon: DollarSign }] : []),
    { id: 'settings' as ActiveTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-display">LifeOS</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Life, managed.</p>
          </div>
        </button>

        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10 transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Anything</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isProFeature = ['banking', 'household', 'documents', 'purchases'].includes(item.id);

          const handleClick = () => {
            if (!isPro && isProFeature) {
              openSubscriptionUpgrade(item.label);
              return;
            }
            setActiveTab(item.id);
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {!isPro && isProFeature && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300">
                    PRO
                  </span>
                )}
              </div>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Membership Plan Pill Card */}
      <div className="px-3 pb-2">
        {isPro ? (
          <button
            onClick={() => openSubscriptionUpgrade()}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-600/10 to-amber-500/10 border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                ⭐
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  LifeOS Pro
                </p>
                <p className="text-[10px] text-slate-400">$7.99/mo Active</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() => openSubscriptionUpgrade()}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between text-left group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span className="text-xs font-bold text-amber-300">Upgrade to Pro</span>
              </div>
              <p className="text-[10px] text-indigo-200">
                {items.length}/20 items used • $7.99/mo
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.displayName || 'Alex'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'alex@lifeos.app'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
