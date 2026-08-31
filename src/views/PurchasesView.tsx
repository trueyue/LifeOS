import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Receipt,
  Calendar,
  DollarSign,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { calculateWarrantyStatus, formatCurrency } from '../utils/categoryHelpers';
import { LifeItem } from '../types';
import { FeatureGateBanner } from '../components/common/FeatureGateBanner';

export const PurchasesView: React.FC = () => {
  const { items, isPro, openSubscriptionUpgrade, setIsQuickCaptureOpen, setSelectedItemForDetail } = useItems();
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Purchases & Warranties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep purchase proofs safe and monitor warranty protection deadlines
          </p>
        </div>

        <FeatureGateBanner
          title="Track Purchases & Warranties is a LifeOS Pro Feature"
          description="Never let a high-value purchase slip out of warranty unmonitored. Store digital receipts, calculate active coverage countdowns, track purchase values, and receive timely expiration alerts."
          featureName="Track Purchases & Warranties"
        />

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Unlock Warranty Tracking & Protection Deadlines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade to LifeOS Pro ($7.99/mo) to track unlimited purchases, store warranty slips, and receive automatic claim deadline reminders.
            </p>
          </div>
          <button
            onClick={() => openSubscriptionUpgrade('Track Purchases & Warranties')}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro ($7.99/mo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const purchases = items.filter(
    (i) => i.category === 'purchase' || i.category === 'warranty' || i.warrantyLengthMonths !== null
  );

  const totalValue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const withReceiptsCount = purchases.filter((p) => p.attachments?.length > 0).length;

  const filteredPurchases = purchases.filter((p) => {
    const status = calculateWarrantyStatus(p.warrantyExpirationDate).status;
    if (filter === 'active' && status !== 'active') return false;
    if (filter === 'expiring' && status !== 'warning' && status !== 'urgent') return false;
    if (filter === 'expired' && status !== 'expired') return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Purchases & Warranties
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep receipts safe and monitor warranty protection deadlines
          </p>
        </div>

        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Purchase</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-600/20 space-y-1">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Value Tracked</span>
            <Receipt className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black font-display">{formatCurrency(totalValue)}</p>
          <p className="text-[11px] opacity-80">Covered under active warranties</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Receipts Stored</span>
            <Paperclip className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {withReceiptsCount} / {purchases.length}
          </p>
          <p className="text-[11px] text-slate-400">Purchases with proof attached</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Warranties</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {purchases.length}
          </p>
          <p className="text-[11px] text-slate-400">Protection plans in effect</p>
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
          All Purchases ({purchases.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'active'
              ? 'bg-teal-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Active Coverage
        </button>
        <button
          onClick={() => setFilter('expiring')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'expiring'
              ? 'bg-amber-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Expiring Soon
        </button>
      </div>

      {/* Purchases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPurchases.map((purchase) => {
          const warrantyStatus = calculateWarrantyStatus(purchase.warrantyExpirationDate);

          return (
            <div
              key={purchase.id}
              onClick={() => setSelectedItemForDetail(purchase)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center text-xl shadow-xs">
                      🛡️
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {purchase.title}
                      </h3>
                      <p className="text-xs text-slate-400">{purchase.vendor || 'Retailer'}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${warrantyStatus.colorClass}`}>
                    {warrantyStatus.icon} {warrantyStatus.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-display">
                    {formatCurrency(purchase.amount)}
                  </span>

                  {purchase.warrantyLengthMonths && (
                    <span className="text-xs text-slate-500">
                      {purchase.warrantyLengthMonths} mos warranty
                    </span>
                  )}
                </div>

                {purchase.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {purchase.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {purchase.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Bought: {purchase.date}
                    </span>
                  )}
                  {purchase.attachments?.length > 0 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      📎 Receipt Attached
                    </span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
