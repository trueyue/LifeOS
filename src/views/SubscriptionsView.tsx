import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  XCircle,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { calculateDateRelativeLabel, formatCurrency, getPriorityBadge } from '../utils/categoryHelpers';
import { LifeItem } from '../types';

export const SubscriptionsView: React.FC = () => {
  const {
    items,
    setIsQuickCaptureOpen,
    setSelectedItemForDetail,
    openSubscriptionUpgrade,
    openAIBudgetAdvisor,
    cancelItemSubscription,
    isPro,
    subscription,
  } = useItems();

  const subscriptions = items.filter((i) => i.category === 'subscription');

  const monthlyTotal = subscriptions.reduce((sum, item) => {
    const amt = item.amount || 0;
    if (item.recurringFrequency === 'yearly') return sum + amt / 12;
    return sum + amt;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Identify trial cancellations
  const freeTrials = subscriptions.filter(
    (s) => s.title.toLowerCase().includes('trial') || s.description.toLowerCase().includes('trial')
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Subscriptions & Recurring Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit monthly recurring fees, renew dates, and cancel subscriptions seamlessly
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAIBudgetAdvisor}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>AI Budget & Waste Audit</span>
          </button>

          <button
            onClick={() => openSubscriptionUpgrade('LifeOS Pro Subscription Hub')}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Manage LifeOS Plan</span>
          </button>

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Service</span>
          </button>
        </div>
      </div>

      {/* Pro Membership Banner */}
      {isPro && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              PRO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">LifeOS Pro All-Access Membership</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {subscription.cancelAtPeriodEnd ? 'Canceling at period end' : 'Active Auto-Renew'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ${subscription.price}/mo • Valid until {subscription.currentPeriodEnd}
              </p>
            </div>
          </div>
          <button
            onClick={() => openSubscriptionUpgrade('Cancel / Modify Plan')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            {subscription.cancelAtPeriodEnd ? 'Reactivate Subscription' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/20 space-y-1">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Outflow</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black font-display">{formatCurrency(monthlyTotal)} /mo</p>
          <p className="text-[11px] opacity-80">{subscriptions.length} active digital services</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Yearly Outflow</span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {formatCurrency(yearlyTotal)} /yr
          </p>
          <p className="text-[11px] text-slate-400">Annual cost if maintained</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Trials & Audits</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
            {freeTrials.length}
          </p>
          <p className="text-[11px] text-slate-400">Free trials needing cancellation</p>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div
                onClick={() => setSelectedItemForDetail(sub)}
                className="space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center text-xl shadow-xs">
                      💳
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-400">{sub.vendor || 'Subscription'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-display">
                    {formatCurrency(sub.amount)}
                    <span className="text-xs text-slate-400 font-normal"> /mo</span>
                  </span>

                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/60">
                    {sub.recurringFrequency || 'Monthly'}
                  </span>
                </div>

                {sub.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {sub.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Renews: <strong>{sub.date ? calculateDateRelativeLabel(sub.date) : 'Monthly'}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Cancel and remove subscription for "${sub.title}"?`)) {
                        cancelItemSubscription(sub.id);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors cursor-pointer"
                    title="Cancel subscription"
                  >
                    Cancel
                  </button>
                  <ChevronRight
                    onClick={() => setSelectedItemForDetail(sub)}
                    className="w-4 h-4 text-slate-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

