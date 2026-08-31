import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ArrowRight,
  Zap,
  Lock,
  Flame,
  Wallet,
  Calendar,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';
import { AIBudgetPlan } from '../../types';
import { formatCurrency } from '../../utils/categoryHelpers';
import { requestAIBudgetAnalysis } from '../../services/budgetService';
import { generateLocalAIBudgetPlan } from '../../utils/budgetAnalyzer';

interface AIBudgetAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIBudgetAdvisorModal: React.FC<AIBudgetAdvisorModalProps> = ({ isOpen, onClose }) => {
  const { items, bankAccounts, isPro, openSubscriptionUpgrade, setSelectedItemForDetail } = useItems();
  const { user } = useAuth();

  const [plan, setPlan] = useState<AIBudgetPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<number>(6500);
  const [isCustomizingIncome, setIsCustomizingIncome] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'waste_audit' | 'simulator'>('overview');

  // Simulator state
  const [cutSubsPercent, setCutSubsPercent] = useState<number>(20);
  const [cutDiningPercent, setCutDiningPercent] = useState<number>(15);

  // Initialize or fetch plan
  const loadBudgetPlan = async (incomeVal?: number) => {
    setIsLoading(true);
    try {
      const targetIncome = incomeVal ?? monthlyIncomeInput;
      const result = await requestAIBudgetAnalysis(items, bankAccounts, user, targetIncome);
      setPlan(result);
      if (!monthlyIncomeInput && result.totalMonthlyIncome) {
        setMonthlyIncomeInput(result.totalMonthlyIncome);
      }
    } catch (err) {
      console.error('Error generating budget plan', err);
      const fallback = generateLocalAIBudgetPlan(items, bankAccounts, incomeVal ?? monthlyIncomeInput);
      setPlan(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBudgetPlan();
    }
  }, [isOpen, items.length, bankAccounts.length]);

  if (!isOpen) return null;

  // Simulator computations
  const currentSubs = plan?.totalFixedObligations ? plan.totalFixedObligations * 0.25 : 120;
  const currentDiscretionary = plan?.totalDiscretionarySpending || 600;
  const simSubsSavings = (currentSubs * cutSubsPercent) / 100;
  const simDiningSavings = (currentDiscretionary * cutDiningPercent) / 100;
  const totalSimMonthlySavings = simSubsSavings + simDiningSavings;
  const totalSimAnnualSavings = totalSimMonthlySavings * 12;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 text-white shrink-0 overflow-hidden">
            {/* Ambient pattern */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini 3.7 Flash Financial Intelligence</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                PRO FEATURE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span>AI Budget & Wealth Optimizer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Autonomous cash-flow envelope modeling, 50/30/20 framework audit, and subscription waste elimination.
            </p>

            {/* Navigation tabs within modal */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Financial Health', icon: PieIcon },
                { id: 'categories', label: 'Category Caps', icon: Layers },
                { id: 'waste_audit', label: 'Waste & Subscriptions', icon: Flame },
                { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => loadBudgetPlan()}
                disabled={isLoading}
                className="ml-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Re-run AI Analysis"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Analysis</span>
              </button>
            </div>
          </div>

          {/* Pro Barrier for Free Users */}
          {!isPro && (
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-amber-300/40 dark:border-amber-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Unlock Live Gemini Financial Intelligence
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You are viewing a preview. Pro members get unlimited automated cash-flow forecasts, subscription waste elimination, and real-time bank ledger sync.
                  </p>
                </div>
              </div>
              <button
                onClick={() => openSubscriptionUpgrade('AI Budgeting & Financial Forecasts')}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Upgrade to Pro ($7.99/mo)</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-900/60">
            {isLoading ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Gemini is auditing obligations, bills, and monthly cash flow...
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Calculating 50/30/20 proportions, runway longevity, and recurring subscription savings.
                </p>
              </div>
            ) : plan ? (
              <>
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Health Score */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">Health Score</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="my-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                              {plan.budgetHealthScore}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">/100</span>
                          </div>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {plan.budgetHealthStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Based on cash flow safety</p>
                      </div>

                      {/* Monthly Fixed Outflow */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">Fixed Obligations</span>
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                            {formatCurrency(plan.totalFixedObligations)}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">Bills & Subscriptions</p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {Math.round((plan.totalFixedObligations / (plan.totalMonthlyIncome || 1)) * 100)}% of income
                        </p>
                      </div>

                      {/* Projected Monthly Savings */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs opacity-90">
                          <span className="font-semibold uppercase tracking-wider">Projected Surplus</span>
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="my-2">
                          <span className="text-3xl font-black font-display">
                            {formatCurrency(plan.projectedMonthlySavings)}
                          </span>
                          <p className="text-xs opacity-90 mt-1">Available for savings & investing</p>
                        </div>
                        <p className="text-[11px] opacity-80">
                          {Math.round((plan.projectedMonthlySavings / (plan.totalMonthlyIncome || 1)) * 100)}% net savings rate
                        </p>
                      </div>

                      {/* Emergency Runway */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">Cash Runway</span>
                          <Wallet className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="my-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                              {plan.cashflowRunwayDays}
                            </span>
                            <span className="text-xs text-slate-400">days</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            ~{(plan.cashflowRunwayDays / 30).toFixed(1)} months reserve
                          </p>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Liquid cash buffer</p>
                      </div>
                    </div>

                    {/* 50 / 30 / 20 Framework Breakdown */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-emerald-600" />
                            <span>50/30/20 Budget Envelope Allocation</span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            Monthly Income Baseline: <strong>{formatCurrency(plan.totalMonthlyIncome)}</strong>
                          </p>
                        </div>

                        {/* Income customization toggle */}
                        <div className="flex items-center gap-2">
                          {isCustomizingIncome ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">$</span>
                              <input
                                type="number"
                                value={monthlyIncomeInput}
                                onChange={(e) => setMonthlyIncomeInput(Number(e.target.value))}
                                className="w-28 px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                              />
                              <button
                                onClick={() => {
                                  setIsCustomizingIncome(false);
                                  loadBudgetPlan(monthlyIncomeInput);
                                }}
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                              >
                                Apply
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsCustomizingIncome(true)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                            >
                              Edit Monthly Income
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Multi-colored Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex shadow-inner">
                          <div
                            style={{ width: `${Math.min(100, plan.framework50_30_20.needsPercent)}%` }}
                            className="bg-indigo-600 h-full transition-all"
                            title={`Needs: ${plan.framework50_30_20.needsPercent}%`}
                          />
                          <div
                            style={{ width: `${Math.min(100, plan.framework50_30_20.wantsPercent)}%` }}
                            className="bg-purple-500 h-full transition-all"
                            title={`Wants: ${plan.framework50_30_20.wantsPercent}%`}
                          />
                          <div
                            style={{ width: `${Math.min(100, plan.framework50_30_20.savingsPercent)}%` }}
                            className="bg-emerald-500 h-full transition-all"
                            title={`Savings: ${plan.framework50_30_20.savingsPercent}%`}
                          />
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                Needs (Target ≤50%)
                              </span>
                              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                {plan.framework50_30_20.needsPercent}%
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                              {formatCurrency(plan.framework50_30_20.needsAmount)}
                            </p>
                            <p className="text-[11px] text-slate-500">Rent/Mortgage, Utilities, Groceries, Transit</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                Wants (Target ≤30%)
                              </span>
                              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                                {plan.framework50_30_20.wantsPercent}%
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                              {formatCurrency(plan.framework50_30_20.wantsAmount)}
                            </p>
                            <p className="text-[11px] text-slate-500">Subscriptions, Dining, Entertainment</p>
                          </div>

                          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                Savings & Debt (Target ≥20%)
                              </span>
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                {plan.framework50_30_20.savingsPercent}%
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                              {formatCurrency(plan.framework50_30_20.savingsAmount)}
                            </p>
                            <p className="text-[11px] text-slate-500">Emergency reserve, investments</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 italic">
                        💡 {plan.framework50_30_20.analysis}
                      </p>
                    </div>

                    {/* Executive Summary Card */}
                    <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/80 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                          AI Executive Financial Summary
                        </h4>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {plan.executiveSummary}
                      </p>

                      <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Priority Action Steps:
                        </span>
                        {plan.keyActionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CATEGORY CAPS TAB */}
                {activeTab === 'categories' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                          Monthly Category Spending Limits
                        </h3>
                        <p className="text-xs text-slate-500">
                          Recommended spending caps aligned with your income envelope
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {plan.categoryBudgets.map((cat, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {cat.categoryLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {formatCurrency(cat.currentSpend)} / {formatCurrency(cat.allocatedLimit)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  cat.status === 'over_budget'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : cat.status === 'warning'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {cat.percentageUsed}% Cap
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, cat.percentageUsed)}%` }}
                              className={`h-full transition-all ${
                                cat.percentageUsed > 90
                                  ? 'bg-red-500'
                                  : cat.percentageUsed > 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. WASTE AUDIT TAB */}
                {activeTab === 'waste_audit' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>Subscription Waste & Expense Leak Audit</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Identified opportunities to reduce monthly outflow without sacrificing quality of life
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                        +
                        {formatCurrency(
                          plan.opportunities.reduce((sum, o) => sum + o.potentialMonthlySavings, 0)
                        )}
                        /mo Potential
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {plan.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{opp.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  opp.urgency === 'high'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : opp.urgency === 'medium'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                }`}
                              >
                                {opp.urgency} Urgency
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{opp.description}</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <span>Action:</span>
                              <span className="font-normal">{opp.actionableStep}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display block">
                              +{formatCurrency(opp.potentialMonthlySavings)}
                              <span className="text-xs font-normal"> /mo</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatCurrency(opp.annualSavings)}/year saved
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WHAT-IF SIMULATOR TAB */}
                {activeTab === 'simulator' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                        Interactive Cash-Flow Simulator
                      </h3>
                      <p className="text-xs text-slate-500">
                        Simulate the compound impact of trimming discretionary subscriptions and dining habits
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Controls */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                            <span>Trim Subscriptions</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                              {cutSubsPercent}% (-{formatCurrency(simSubsSavings)}/mo)
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            step="5"
                            value={cutSubsPercent}
                            onChange={(e) => setCutSubsPercent(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                          <p className="text-[11px] text-slate-400">
                            Canceling 1-2 unused digital streaming or software tools.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                            <span>Optimize Dining & Discretionary</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              {cutDiningPercent}% (-{formatCurrency(simDiningSavings)}/mo)
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="5"
                            value={cutDiningPercent}
                            onChange={(e) => setCutDiningPercent(Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <p className="text-[11px] text-slate-400">
                            Cooking 1 additional meal per week at home.
                          </p>
                        </div>
                      </div>

                      {/* Compound Output Card */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                            Simulated Surplus Growth
                          </span>
                          <div className="mt-3">
                            <span className="text-3xl font-black font-display text-emerald-400">
                              +{formatCurrency(totalSimMonthlySavings)}
                            </span>
                            <span className="text-xs text-slate-300"> / month</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 font-semibold">
                            +{formatCurrency(totalSimAnnualSavings)} additional annual wealth accumulation.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/10 text-xs text-slate-300 space-y-1">
                          <p>
                            📈 Over 5 years invested at 7% return: <strong>{formatCurrency(totalSimAnnualSavings * 5.75)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              LifeOS Financial Intelligence Engine • Updated in real time
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
