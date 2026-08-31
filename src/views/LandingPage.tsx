import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Receipt,
  CreditCard,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export const LandingPage: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Nav */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              Life<span className="text-indigo-600 dark:text-indigo-400">OS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuth('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => loginAsDemo()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            Try Live Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12 sm:py-20 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Personal Life Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.1]">
          You don’t manage your life. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
            LifeOS manages it for you.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Tell LifeOS anything in normal human language — bills, oil changes, subscriptions, and TV warranties.
          It extracts dates, priorities, and schedules them before you even realize.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => loginAsDemo()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Demo (Explore)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAuth('signup')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-800 transition-colors"
          >
            Create Free Account
          </button>
        </div>

        {/* Live Simulation Card */}
        <div className="pt-8 max-w-2xl mx-auto text-left">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Natural Language Input Demo
            </span>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
              "My electric bill is $143 due on September 5 every month"
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Electric Bill ($143.00)</p>
                  <p className="text-[11px] text-slate-400">Scheduled: Sep 5, Monthly recurring</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                Auto-Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bills & Due Dates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-calculate monthly totals, flag auto-pay coverage, and track payment deadlines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Warranties & Receipts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never lose a purchase receipt again. Real-time warranty expiration alerts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Direct Pay & Banking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Link checking and credit accounts to settle utility bills & insurances with 1 click.
            </p>
          </div>
        </div>

        {/* Pricing & Membership Plans */}
        <div className="pt-16 max-w-4xl mx-auto text-left space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Simple, transparent pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Start free with core features, or unlock complete peace of mind with Pro All-Access for $7.99/mo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Free Starter Tier */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Starter
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    Free Forever
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-display">$0</span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Essential reminders and calendar tracking for individuals.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to 20 active life items & tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automated recurring rollover on completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Calendar timeline & daily overview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Status tagging & category filters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Smart email updates (1 week & 1 day before due dates)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openAuth('signup')}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors"
                >
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Pro All-Access Tier */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-900 to-slate-900 border-2 border-indigo-500 text-white shadow-2xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md">
                RECOMMENDED
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Pro All-Access
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                    Cancel Anytime
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-white font-display">$7.99</span>
                    <span className="text-xs text-indigo-200">/ month</span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1 font-medium">
                    Automate your entire life with unlimited items, AI intelligence, and Direct Pay.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-indigo-800/80 text-xs text-indigo-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Unlimited items, tasks, bills, appointments & warranties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1-Click Direct Pay & real-time bank ledger sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Automated routing for errands & appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Receipt/warranty tracking & OCR document vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>AI Budget Advisor & liquidity forecasting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Family household multi-member collaboration & task assignees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Fund availability alerts (1 week & 1 day before due dates)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-indigo-800/80">
                <button
                  onClick={() => loginAsDemo()}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Pro Access ($7.99/mo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        LifeOS. You don’t manage your life. LifeOS manages it for you.
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
