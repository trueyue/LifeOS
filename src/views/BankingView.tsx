import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Zap,
  ShieldCheck,
  CreditCard,
  Receipt,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  DollarSign,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { formatCurrency, getCategoryInfo } from '../utils/categoryHelpers';
import { BankAccount, LifeCategory, LifeItem, PaymentTransaction } from '../types';
import { FeatureGateBanner } from '../components/common/FeatureGateBanner';

export const BankingView: React.FC = () => {
  const {
    bankAccounts,
    paymentTransactions,
    items,
    isPro,
    openSubscriptionUpgrade,
    setIsLinkBankModalOpen,
    openDirectPay,
    refreshBankBalance,
    unlinkBankAccount,
    setSelectedItemForDetail,
  } = useItems();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [refreshingBankId, setRefreshingBankId] = useState<string | null>(null);

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Banking & 1-Click Direct Pay
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Secure bank ledger synchronization, liquidity forecasts, and automated bill payments
          </p>
        </div>

        <FeatureGateBanner
          title="Banking Sync & 1-Click Direct Pay is a LifeOS Pro Feature"
          description="Connect your checking and credit card accounts securely with 256-bit encryption. Monitor real-time account balances, forecast cash runway against upcoming obligations, and pay utility/rent bills in one click."
          featureName="Banking & 1-Click Direct Pay"
        />

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Connect Unlimited Bank Accounts & Credit Cards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade to LifeOS Pro ($7.99/mo) to unlock instant account sync, live transaction ledger, and automated payment receipts.
            </p>
          </div>
          <button
            onClick={() => openSubscriptionUpgrade('Banking & Direct Pay')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade to Pro ($7.99/mo)</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Financial calculations
  const totalCashBalance = bankAccounts
    .filter((b) => b.accountType === 'checking' || b.accountType === 'savings')
    .reduce((sum, b) => sum + b.availableBalance, 0);

  const totalCreditBalance = bankAccounts
    .filter((b) => b.accountType === 'credit')
    .reduce((sum, b) => sum + b.currentBalance, 0);

  // Unpaid bills, insurances, subscriptions
  const unpaidItems = items.filter(
    (i) => !i.completed && (i.category === 'bill' || i.category === 'subscription' || (i.amount && i.amount > 0))
  );

  const totalDue = unpaidItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  const filteredUnpaidItems = unpaidItems.filter((i) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'insurance') {
      return (
        i.title.toLowerCase().includes('insurance') ||
        i.description.toLowerCase().includes('insurance') ||
        i.tags.some((t) => t.toLowerCase().includes('insurance'))
      );
    }
    if (filterCategory === 'utility') {
      return (
        i.title.toLowerCase().includes('electric') ||
        i.title.toLowerCase().includes('gas') ||
        i.title.toLowerCase().includes('water') ||
        i.title.toLowerCase().includes('internet') ||
        i.title.toLowerCase().includes('wifi') ||
        i.title.toLowerCase().includes('coned')
      );
    }
    if (filterCategory === 'subscription') return i.category === 'subscription';
    return true;
  });

  const handleRefresh = (bankId: string) => {
    setRefreshingBankId(bankId);
    setTimeout(() => {
      refreshBankBalance(bankId);
      setRefreshingBankId(null);
    }, 800);
  };

  const filteredHistory = paymentTransactions.filter((p) =>
    p.payeeName.toLowerCase().includes(historySearch.toLowerCase()) ||
    p.confirmationCode.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Banking & Direct Pay
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Live Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Link financial accounts to pay utility bills, insurance premiums, and subscriptions directly
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLinkBankModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Link Bank Account</span>
          </button>

          <button
            onClick={() => openDirectPay(null, { name: 'Custom Biller / Landlord / Provider', amount: 100 })}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Pay Custom Biller</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-600/20 space-y-1">
          <div className="flex items-center justify-between opacity-85">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Liquid Cash</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black font-display">{formatCurrency(totalCashBalance)}</p>
          <p className="text-[11px] opacity-80">Across {bankAccounts.filter(b => b.accountType !== 'credit').length} linked bank accounts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Unpaid Obligations Due</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display">
            {formatCurrency(totalDue)}
          </p>
          <p className="text-[11px] text-slate-400">{unpaidItems.length} bills & premiums waiting for direct pay</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Direct Payment Security</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            256-Bit SSL
          </p>
          <p className="text-[11px] text-slate-400">Instant ACH Settlement (0% Platform Fee)</p>
        </div>
      </div>

      {/* Linked Bank Accounts Carousel / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Linked Banking Apps & Accounts</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {bankAccounts.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized balances ready for 1-touch direct payment
            </p>
          </div>

          <button
            onClick={() => setIsLinkBankModalOpen(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Another Bank</span>
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Linked Financial Accounts</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Connect your checking account, credit card, or savings to enable 1-click direct bill pay with zero manual entry.
              </p>
            </div>
            <button
              onClick={() => setIsLinkBankModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Link Bank via Plaid / OpenBanking</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => {
              const isRefreshing = refreshingBankId === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`p-5 rounded-3xl bg-gradient-to-br ${acc.color} text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{acc.institutionLogo || '🏛️'}</span>
                      <div>
                        <p className="text-xs font-bold tracking-tight opacity-90">{acc.institutionName}</p>
                        <p className="text-[11px] opacity-75">{acc.accountName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRefresh(acc.id)}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Refresh Balance"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => unlinkBankAccount(acc.id)}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                        title="Unlink Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                      Available Balance
                    </p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-black font-display tracking-tight">
                        {formatCurrency(acc.availableBalance)}
                      </p>
                      <span className="text-xs font-mono opacity-80">{acc.accountNumberMask}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] opacity-75">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Connected & Ready
                    </span>
                    <span>Synced {new Date(acc.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Pay Station: Bills & Obligations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Direct Pay Hub: Bills, Insurance & Obligations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pay insurance premiums, utility bills, and loans directly with 1-click
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              All Due ({unpaidItems.length})
            </button>
            <button
              onClick={() => setFilterCategory('insurance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'insurance'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              Insurance
            </button>
            <button
              onClick={() => setFilterCategory('utility')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'utility'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              Utilities
            </button>
          </div>
        </div>

        {filteredUnpaidItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Obligations Paid</h3>
            <p className="text-xs text-slate-400">
              No unpaid bills or insurance premiums found matching this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredUnpaidItems.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                      {catInfo.emoji}
                    </div>
                    <div className="truncate">
                      <h3
                        onClick={() => setSelectedItemForDetail(item)}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                      >
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.vendor || catInfo.label} {item.date ? `• Due: ${item.date}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                        {formatCurrency(item.amount)}
                      </p>
                      <span className="text-[10px] text-rose-500 font-semibold">Unpaid</span>
                    </div>

                    <button
                      onClick={() => openDirectPay(item)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Pay Direct</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Payment History & Receipts Ledger */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Direct Payment History & Receipts</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete electronic transaction trail with instant receipt vault
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search payments or confirmation #"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
            No payment history recorded yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {txn.payeeName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Paid via {txn.fundingSourceName} ({txn.fundingSourceMask}) • {txn.paymentDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-display">
                        {formatCurrency(txn.amount)}
                      </p>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {txn.confirmationCode}
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                      Settled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
