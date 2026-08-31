import { LifeCategory, Priority, ReminderTiming } from '../types';

export interface CategoryInfo {
  id: LifeCategory;
  label: string;
  emoji: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textColor: string;
}

export const CATEGORIES: Record<LifeCategory, CategoryInfo> = {
  appointment: {
    id: 'appointment',
    label: 'Appointments',
    emoji: '📅',
    color: '#3b82f6', // blue
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800/60',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  bill: {
    id: 'bill',
    label: 'Bills',
    emoji: '💰',
    color: '#ef4444', // red
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-800/60',
    textColor: 'text-rose-700 dark:text-rose-300',
  },
  car: {
    id: 'car',
    label: 'Car',
    emoji: '🚗',
    color: '#f97316', // orange
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800/60',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  home: {
    id: 'home',
    label: 'Home',
    emoji: '🏠',
    color: '#10b981', // emerald
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800/60',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
  package: {
    id: 'package',
    label: 'Packages',
    emoji: '📦',
    color: '#eab308', // amber
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/60',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  subscription: {
    id: 'subscription',
    label: 'Subscriptions',
    emoji: '💳',
    color: '#8b5cf6', // purple
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-800/60',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  purchase: {
    id: 'purchase',
    label: 'Purchases',
    emoji: '🧾',
    color: '#06b6d4', // cyan
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-800/60',
    textColor: 'text-cyan-700 dark:text-cyan-300',
  },
  warranty: {
    id: 'warranty',
    label: 'Warranties',
    emoji: '🛡️',
    color: '#14b8a6', // teal
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800/60',
    textColor: 'text-teal-700 dark:text-teal-300',
  },
  document: {
    id: 'document',
    label: 'Documents',
    emoji: '📄',
    color: '#64748b', // slate
    bgLight: 'bg-slate-100',
    bgDark: 'dark:bg-slate-800/60',
    borderLight: 'border-slate-300',
    borderDark: 'dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    emoji: '✈️',
    color: '#0284c7', // sky
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800/60',
    textColor: 'text-sky-700 dark:text-sky-300',
  },
  school: {
    id: 'school',
    label: 'School',
    emoji: '🎓',
    color: '#6366f1', // indigo
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800/60',
    textColor: 'text-indigo-700 dark:text-indigo-300',
  },
  work: {
    id: 'work',
    label: 'Work',
    emoji: '💼',
    color: '#475569', // slate dark
    bgLight: 'bg-zinc-100',
    bgDark: 'dark:bg-zinc-800/60',
    borderLight: 'border-zinc-300',
    borderDark: 'dark:border-zinc-700',
    textColor: 'text-zinc-700 dark:text-zinc-300',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    emoji: '📝',
    color: '#ec4899', // pink
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-950/40',
    borderLight: 'border-pink-200',
    borderDark: 'dark:border-pink-800/60',
    textColor: 'text-pink-700 dark:text-pink-300',
  },
  other: {
    id: 'other',
    label: 'Other',
    emoji: '⭐',
    color: '#a855f7', // purple
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800/60',
    textColor: 'text-violet-700 dark:text-violet-300',
  },
};

export function getCategoryInfo(category?: LifeCategory | string): CategoryInfo {
  if (!category || !(category in CATEGORIES)) {
    return CATEGORIES.other;
  }
  return CATEGORIES[category as LifeCategory];
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPriorityBadge(priority: Priority): { label: string; dotColor: string; badgeClass: string } {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        dotColor: 'bg-red-500',
        badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60',
      };
    case 'medium':
      return {
        label: 'Medium',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      };
    case 'low':
    default:
      return {
        label: 'Low',
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      };
  }
}

export function getReminderLabel(timing?: ReminderTiming): string {
  switch (timing) {
    case 'same_day':
      return 'Same day';
    case '1_day':
      return '1 day before';
    case '3_days':
      return '3 days before';
    case '7_days':
      return '7 days before';
    case '30_days':
      return '30 days before';
    case 'none':
    default:
      return 'No reminder';
  }
}

export function calculateWarrantyStatus(expirationDateStr?: string | null): {
  status: 'active' | 'warning' | 'urgent' | 'expired';
  label: string;
  colorClass: string;
  icon: string;
} {
  if (!expirationDateStr) {
    return {
      status: 'active',
      label: 'Warranty active',
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: '🟢',
    };
  }

  const exp = new Date(expirationDateStr);
  const now = new Date();
  if (isNaN(exp.getTime())) {
    return {
      status: 'active',
      label: 'Warranty active',
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: '🟢',
    };
  }

  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Warranty expired',
      colorClass: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      icon: '⚪',
    };
  }
  if (diffDays <= 7) {
    return {
      status: 'urgent',
      label: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      colorClass: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
      icon: '🔴',
    };
  }
  if (diffDays <= 30) {
    return {
      status: 'warning',
      label: `Expires in ${diffDays} days`,
      colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      icon: '🟡',
    };
  }
  return {
    status: 'active',
    label: `Active (${Math.round(diffDays / 30)} mos left)`,
    colorClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    icon: '🟢',
  };
}

export function calculateDateRelativeLabel(dateStr?: string | null): string {
  if (!dateStr) return '';
  // Check if it's a standard YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return dateStr;
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (diffDays === -1) return 'Yesterday';
    return `${Math.abs(diffDays)} days ago`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 6) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[target.getDay()];
  }
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: y !== now.getFullYear() ? 'numeric' : undefined });
}
