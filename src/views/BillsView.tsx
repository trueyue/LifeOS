import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Check,
  Zap,
  Building2,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { calculateDateRelativeLabel, formatCurrency, getPriorityBadge } from '../utils/categoryHelpers';
import { LifeItem } from '../types';

export const BillsView: React.FC = () => {
  const {
    items,
    setIsQuickCaptureOpen,
    setSelectedItemForDetail,
    toggleComplete,
    updateItem,
    bankAccounts,
    openDirectPay,
    setIsLinkBankModalOpen,
    setActiveTab,
  } = useItems();
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'autopay' | 'manual'>('all');

  const bills = items.filter((i) => i.category === 'bill');
  const unpaidBills = bills.filter((b) => !b.completed);

  // Total cash available across linked banks
  const totalCashBalance = bankAccounts
    .filter((b) => b.accountType === 'checking' || b.accountType === 'savings')
    .reduce((sum, b) => sum + b.availableBalance, 0);

  // Financial calculations
  const monthlyTotal = bills.reduce((acc, curr) => {
    const amt = curr.amount || 0;
    if (curr.recurringFrequency === 'yearly') return acc + amt / 12;
    if (curr.recurringFrequency === 'weekly') return acc + amt * 4.33;
    if (curr.recurringFrequency === 'quarterly') return acc + amt / 3;
    return acc + amt; // default monthly
  }, 0);

  const annualTotal = monthlyTotal * 12;
  const autoPayCount = bills.filter((b) => b.autoPay).length;

  const filteredBills = bills.filter((b) => {
    if (filter === 'unpaid' && b.completed) return false;
    if (filter === 'autopay' && !b.autoPay) return false;
    if (filter === 'manual' && b.autoPay) return false;
    return true;
  });

  const handleMarkPaidForCycle = (bill: LifeItem) => {
    toggleComplete(bill.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Bills & Due Dates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track utilities, rent, insurance, and recurring obligations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openDirectPay(null, { name: 'Utility / Insurance Provider', amount: 100 })}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Direct Pay</span>
          </button>

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Bill</span>
          </button>
        </div>
      </div>

      {/* Linked Bank Accounts Quick Status Banner */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">
            <Building2 className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Linked Banking Gateway</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                ● {bankAccounts.length} Accounts Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Total Available Cash: <strong className="text-white font-display">{formatCurrency(totalCashBalance)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bankAccounts.length === 0 ? (
            <button
              onClick={() => setIsLinkBankModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Bank App</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('banking')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Manage Banking Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20 space-y-1">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Total</span>
            <Receipt className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black font-display">{formatCurrency(monthlyTotal)}</p>
          <p className="text-[11px] opacity-80">Across {bills.length} active recurring bills</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Estimated</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {formatCurrency(annualTotal)}
          </p>
          <p className="text-[11px] text-slate-400">Projected yearly expenditure</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Auto-Pay Coverage</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {autoPayCount} / {bills.length}
          </p>
          <p className="text-[11px] text-slate-400">Bills handled automatically</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          All Bills ({bills.length})
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unpaid'
              ? 'bg-rose-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Due / Unpaid ({unpaidBills.length})
        </button>
        <button
          onClick={() => setFilter('autopay')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'autopay'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Auto-Pay ({autoPayCount})
        </button>
        <button
          onClick={() => setFilter('manual')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'manual'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Manual Pay ({bills.length - autoPayCount})
        </button>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBills.map((bill) => {
          const priorityBadge = getPriorityBadge(bill.priority);

          return (
            <div
              key={bill.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center text-lg shadow-xs">
                      💰
                    </div>
                    <div>
                      <h3
                        onClick={() => setSelectedItemForDetail(bill)}
                        className={`text-base font-bold text-slate-900 dark:text-white cursor-pointer hover:underline ${
                          bill.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {bill.title}
                      </h3>
                      <p className="text-xs text-slate-400">{bill.vendor || 'Utility Provider'}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                    {priorityBadge.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-display">
                      {formatCurrency(bill.amount)}
                    </span>
                    <span className="text-xs text-slate-400"> / {bill.recurringFrequency || 'month'}</span>
                  </div>

                  {bill.autoPay ? (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      ✓ Auto-Pay Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                      ⚡ Manual Payment
                    </span>
                  )}
                </div>

                {bill.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    {bill.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: <strong>{bill.date ? calculateDateRelativeLabel(bill.date) : 'Monthly'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {!bill.completed && (
                    <button
                      onClick={() => openDirectPay(bill)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Pay Direct</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleMarkPaidForCycle(bill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      bill.completed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{bill.completed ? 'Paid' : 'Mark Paid'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
