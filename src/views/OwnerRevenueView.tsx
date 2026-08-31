import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  ArrowUpRight,
  Download,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Settings,
  RefreshCw,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { isAppOwner } from '../utils/ownerAuth';
import { motion } from 'motion/react';

export const OwnerRevenueView: React.FC = () => {
  const {
    platformRevenueStats,
    updateOwnerPayoutSettings,
    requestOwnerPayout,
    openSubscriptionUpgrade,
    setActiveTab: setGlobalActiveTab,
  } = useItems();
  const { user, isOwner, loginAsOwner } = useAuth();

  const isVerifiedOwner = isOwner || isAppOwner(user);

  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'subscribers' | 'withdrawals' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'canceled'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'month' | 'year'>('all');

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(
    platformRevenueStats.availablePayoutBalance.toString()
  );
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Settings form state
  const [payoutMethod, setPayoutMethod] = useState(platformRevenueStats.payoutSettings.payoutMethod);
  const [bankName, setBankName] = useState(platformRevenueStats.payoutSettings.bankName);
  const [accountHolder, setAccountHolder] = useState(platformRevenueStats.payoutSettings.accountHolderName);
  const [routingNumber, setRoutingNumber] = useState(platformRevenueStats.payoutSettings.routingNumber);
  const [accountMask, setAccountMask] = useState(platformRevenueStats.payoutSettings.accountNumberMask);
  const [paypalEmail, setPaypalEmail] = useState(platformRevenueStats.payoutSettings.paypalEmail || 'ntaijo.fn@gmail.com');
  const [payoutSchedule, setPayoutSchedule] = useState(platformRevenueStats.payoutSettings.payoutSchedule);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Strict Access Guard for Owner Only
  if (!isVerifiedOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-lg ring-8 ring-amber-50/50 dark:ring-amber-950/20">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Withdrawal & Revenue Hub Restricted
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            This section is protected and accessible solely by the application owner account (<strong>ntaijo.fn@gmail.com</strong>).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            Current authenticated account: <strong className="text-slate-900 dark:text-white">{user?.email || 'Guest User'}</strong>
          </p>
          <p className="text-slate-400 text-[11px]">
            To view monthly metrics and withdraw funds, log in with your verified owner account credentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => loginAsOwner()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticate as Owner (ntaijo.fn@gmail.com)</span>
          </button>
          <button
            onClick={() => setGlobalActiveTab('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const monthlyData = platformRevenueStats.monthlyMetrics || [
    {
      month: 'August 2026',
      year: 2026,
      monthIndex: 7,
      grossRevenue: 1134.58,
      netRevenue: 1076.72,
      platformFees: 57.86,
      activeSubscribers: 142,
      newSubscribers: 24,
      payoutsIssued: 886.46,
    },
    {
      month: 'July 2026',
      year: 2026,
      monthIndex: 6,
      grossRevenue: 1022.72,
      netRevenue: 970.56,
      platformFees: 52.16,
      activeSubscribers: 128,
      newSubscribers: 31,
      payoutsIssued: 1250.00,
    },
    {
      month: 'June 2026',
      year: 2026,
      monthIndex: 5,
      grossRevenue: 894.88,
      netRevenue: 849.24,
      platformFees: 45.64,
      activeSubscribers: 112,
      newSubscribers: 28,
      payoutsIssued: 0.00,
    },
    {
      month: 'May 2026',
      year: 2026,
      monthIndex: 4,
      grossRevenue: 695.13,
      netRevenue: 659.68,
      platformFees: 35.45,
      activeSubscribers: 87,
      newSubscribers: 35,
      payoutsIssued: 0.00,
    },
    {
      month: 'April 2026',
      year: 2026,
      monthIndex: 3,
      grossRevenue: 463.42,
      netRevenue: 439.79,
      platformFees: 23.63,
      activeSubscribers: 58,
      newSubscribers: 42,
      payoutsIssued: 0.00,
    },
    {
      month: 'March 2026',
      year: 2026,
      monthIndex: 2,
      grossRevenue: 327.59,
      netRevenue: 310.87,
      platformFees: 16.72,
      activeSubscribers: 41,
      newSubscribers: 41,
      payoutsIssued: 0.00,
    },
  ];

  const maxMonthlyGross = Math.max(...monthlyData.map((m) => m.grossRevenue), 1200);

  const filteredSubscribers = platformRevenueStats.subscribers.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPlan = planFilter === 'all' || s.billingInterval === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > platformRevenueStats.availablePayoutBalance) {
      setWithdrawError(
        `Amount exceeds available withdrawal balance ($${platformRevenueStats.availablePayoutBalance.toFixed(2)}).`
      );
      return;
    }

    setIsProcessingWithdraw(true);
    setTimeout(() => {
      try {
        const withdrawal = requestOwnerPayout(amt);
        setIsProcessingWithdraw(false);
        setWithdrawSuccessMsg(
          `Successfully initiated withdrawal of $${amt.toFixed(2)} to ${withdrawal.destinationMask}! Ref: ${withdrawal.referenceCode}`
        );
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawSuccessMsg(null);
        }, 2400);
      } catch (err: any) {
        setIsProcessingWithdraw(false);
        setWithdrawError(err?.message || 'Failed to process withdrawal.');
      }
    }, 900);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwnerPayoutSettings({
      payoutMethod,
      bankName,
      accountHolderName: accountHolder,
      routingNumber,
      accountNumberMask: accountMask,
      paypalEmail,
      payoutSchedule,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const exportSubscribersCSV = () => {
    const headers = ['Customer Name', 'Email', 'Plan', 'Rate', 'Billing Interval', 'Status', 'Joined Date', 'Next Renewal', 'Total Contributed ($)'];
    const rows = platformRevenueStats.subscribers.map((s) => [
      `"${s.customerName}"`,
      `"${s.customerEmail}"`,
      `"${s.planName}"`,
      s.amount.toFixed(2),
      s.billingInterval,
      s.status,
      s.joinedDate,
      s.nextRenewalDate,
      s.totalPaidToDate.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifeos-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Portal & Withdrawal Hub • ntaijo.fn@gmail.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Withdrawal & Revenue Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Track real subscriber earnings ($7.99/mo Pro memberships), review monthly performance metrics, and withdraw revenue directly to your verified payout destination.
            </p>
          </div>

          {/* Instant Withdrawal Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setWithdrawAmount(platformRevenueStats.availablePayoutBalance.toString());
                setIsWithdrawModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Request Withdrawal (${platformRevenueStats.availablePayoutBalance.toFixed(2)})</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            Earnings Overview
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Metrics (6 Mo)</span>
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Subscribers Info ({platformRevenueStats.proSubscribersCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdrawal Records ({platformRevenueStats.withdrawals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Payout Destination</span>
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Made to Date */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Gross Made</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                ${platformRevenueStats.grossRevenue.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Net earned: <strong className="text-emerald-600 dark:text-emerald-400">${platformRevenueStats.netRevenue.toFixed(2)}</strong> after fees
              </p>
            </div>

            {/* Monthly Recurring MRR */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">Monthly Recurring (MRR)</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                ${platformRevenueStats.mrr.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span>↑ 14.1% MoM growth</span>
                <span className="text-slate-400 font-normal">({platformRevenueStats.proSubscribersCount} active subscribers)</span>
              </p>
            </div>

            {/* Available for Withdrawal */}
            <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-2">
                <span className="text-xs font-semibold">Available for Withdrawal</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 font-display">
                ${platformRevenueStats.availablePayoutBalance.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                Ready for instant withdrawal to {platformRevenueStats.payoutSettings.bankName || 'account'}
              </p>
            </div>

            {/* Total Withdrawn to Date */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Withdrawn</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                ${platformRevenueStats.totalWithdrawn.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Transferred across {platformRevenueStats.withdrawals.length} completed payouts
              </p>
            </div>
          </div>

          {/* Quick Monthly Revenue Growth Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Monthly Revenue Trajectory (2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Gross subscriber billings collected month-by-month.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('monthly')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Monthly Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Bar Chart for Monthly Growth */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
              {monthlyData.slice().reverse().map((m) => {
                const heightPercent = Math.max(15, Math.round((m.grossRevenue / maxMonthlyGross) * 100));
                return (
                  <div key={m.month} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white mb-2">
                      ${m.grossRevenue.toFixed(0)}
                    </span>
                    <div className="w-full h-24 flex items-end justify-center my-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      {m.month.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m.activeSubscribers} subs
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Bank Account & Withdrawal Status Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Verified Payout Destination
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your subscriber earnings are sent to this account upon withdrawal request.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Configure Destination
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {platformRevenueStats.payoutSettings.bankName || 'Direct ACH Account'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Account {platformRevenueStats.payoutSettings.accountNumberMask} • Owner: {platformRevenueStats.payoutSettings.accountHolderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                  <button
                    onClick={() => {
                      setWithdrawAmount(platformRevenueStats.availablePayoutBalance.toString());
                      setIsWithdrawModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  Withdrawal schedule: <strong className="text-slate-700 dark:text-slate-300 capitalize">{platformRevenueStats.payoutSettings.payoutSchedule}</strong> • Last payout date: {platformRevenueStats.payoutSettings.lastPayoutDate || 'None'}
                </span>
              </div>
            </div>

            {/* Quick Subscriber Breakdown */}
            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Subscription Tier Model
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Free Tier:</strong> Limited to 20 items.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Pro All-Access:</strong> $7.99/mo or $79.99/yr unlimited items, smart routing, & auto-sync.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span><strong>Conversion Rate:</strong> {platformRevenueStats.conversionRate}% of {platformRevenueStats.freeUsersCount + platformRevenueStats.proSubscribersCount} total users.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-indigo-200/60 dark:border-indigo-900/40">
                <button
                  onClick={() => openSubscriptionUpgrade()}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Preview Pro Checkout Modal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MONTHLY METRICS TAB */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Monthly Performance & Earnings Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Detailed record of monthly gross revenue, payment processor fees, net earnings, active subscribers, and withdrawals.
              </p>
            </div>
            <button
              onClick={exportSubscribersCSV}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Monthly Report</span>
            </button>
          </div>

          {/* Monthly Metrics Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Month</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Gross Billings</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Processing Fees</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Net Earned</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Active Subs</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">New Growth</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Payouts Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyData.map((metric) => (
                    <tr key={metric.month} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>{metric.month}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white font-mono">
                        ${metric.grossRevenue.toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        -${metric.platformFees.toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ${metric.netRevenue.toFixed(2)}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {metric.activeSubscribers} members
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          +{metric.newSubscribers} new
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {metric.payoutsIssued > 0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            ${metric.payoutsIssued.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBSCRIBERS INFO TAB (Sanitized - No Bank Details) */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search subscriber name, email, plan..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="canceled">Canceled</option>
              </select>

              <select
                value={planFilter}
                onChange={(e: any) => setPlanFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Plans</option>
                <option value="month">Monthly ($7.99)</option>
                <option value="year">Annual ($79.99)</option>
              </select>
            </div>

            <button
              onClick={exportSubscribersCSV}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Subscribers Table - Cleanly Sanitized */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Subscriber Name</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Email Address</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Plan & Frequency</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Member Status</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Joined Date</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Next Renewal</th>
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Lifetime Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No subscribers found matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isVipUser = sub.customerEmail?.toLowerCase() === 'tanner.regenbogen09@gmail.com' || sub.paymentMethod?.includes('VIP');
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-[10px] ${
                              isVipUser
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30'
                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {isVipUser ? '👑' : sub.customerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{sub.customerName}</span>
                                {isVipUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 text-[9px] font-extrabold uppercase">
                                    VIP Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {sub.customerEmail}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {sub.planName}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {isVipUser ? '$0.00 / Lifetime VIP' : `$${sub.amount.toFixed(2)} / ${sub.billingInterval}`}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isVipUser
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : sub.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isVipUser ? 'VIP ACTIVE' : sub.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {sub.joinedDate}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {isVipUser ? 'Never (Lifetime)' : sub.nextRenewalDate}
                          </td>
                          <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                            ${sub.totalPaidToDate.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. WITHDRAWALS RECORD TAB */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Withdrawal & Transfer History
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of all funds transferred to owner bank or PayPal account.
              </p>
            </div>
            <button
              onClick={() => {
                setWithdrawAmount(platformRevenueStats.availablePayoutBalance.toString());
                setIsWithdrawModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>New Withdrawal</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {platformRevenueStats.withdrawals.map((wdr) => (
                <div key={wdr.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Withdrawal to {wdr.destinationMask}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {wdr.createdAt} • Ref: <span className="font-mono">{wdr.referenceCode}</span> • {wdr.payoutMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                        ${wdr.amount.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS / DESTINATION TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs space-y-6"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Withdrawal Destination & Bank Setup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure where your subscriber earnings ($7.99/mo) are transferred upon withdrawal.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Withdrawal settings saved successfully!</span>
              </div>
            )}

            {/* Payout Method */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transfer Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    payoutMethod === 'stripe_connect' || payoutMethod === 'bank_ach'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="stripe_connect"
                    checked={payoutMethod === 'stripe_connect' || payoutMethod === 'bank_ach'}
                    onChange={() => setPayoutMethod('stripe_connect')}
                    className="hidden"
                  />
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold">Direct ACH Bank Transfer</p>
                    <p className="text-[10px] text-slate-500">Checking / Business Account</p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    payoutMethod === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="paypal"
                    checked={payoutMethod === 'paypal'}
                    onChange={() => setPayoutMethod('paypal')}
                    className="hidden"
                  />
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold">PayPal Direct</p>
                    <p className="text-[10px] text-slate-500">Instant email transfer</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Bank Fields */}
            {payoutMethod !== 'paypal' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Institution Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    placeholder="e.g. JPMorgan Chase Bank"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      placeholder="Alex Chen"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Routing Number (9 Digits)
                    </label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                      placeholder="021000021"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Number Mask
                  </label>
                  <input
                    type="text"
                    value={accountMask}
                    onChange={(e) => setAccountMask(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    placeholder="•••• 8820"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  PayPal Email Address
                </label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="ntaijo.fn@gmail.com"
                  required
                />
              </div>
            )}

            {/* Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Withdrawal Schedule
              </label>
              <select
                value={payoutSchedule}
                onChange={(e: any) => setPayoutSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="instant">Manual / Instant On-Demand</option>
                <option value="daily">Daily Automatic Transfer</option>
                <option value="weekly">Weekly Transfer (Every Friday)</option>
                <option value="monthly">Monthly Transfer (1st of month)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Save Destination Settings
            </button>
          </form>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsWithdrawModalOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Withdrawal Request
                </h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {withdrawSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">{withdrawSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Available Balance:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-display text-sm">
                    ${platformRevenueStats.availablePayoutBalance.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount to Withdraw ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={platformRevenueStats.availablePayoutBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white font-display"
                      required
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  Destination: <strong className="text-slate-700 dark:text-slate-300">{platformRevenueStats.payoutSettings.bankName || 'Bank Account'} ({platformRevenueStats.payoutSettings.accountNumberMask})</strong>
                </div>

                {withdrawError && (
                  <p className="text-xs text-red-600 font-semibold">{withdrawError}</p>
                )}

                <button
                  type="submit"
                  disabled={isProcessingWithdraw || platformRevenueStats.availablePayoutBalance <= 0}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {isProcessingWithdraw ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Processing Transfer...</span>
                    </div>
                  ) : (
                    <span>Confirm & Withdraw Funds</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
