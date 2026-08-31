import React from 'react';
import { Sparkles, Lock, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';

interface FeatureGateBannerProps {
  title?: string;
  description?: string;
  featureName?: string;
  compact?: boolean;
}

export const FeatureGateBanner: React.FC<FeatureGateBannerProps> = ({
  title = 'Upgrade to LifeOS Pro for All-Access',
  description = 'Unlock unlimited items, Gemini AI intelligence, 1-Click Direct Pay, and family household sharing for just $7.99/mo.',
  featureName,
  compact = false,
}) => {
  const { openSubscriptionUpgrade, isPro } = useItems();

  if (isPro) return null;

  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50/50 dark:from-indigo-950/40 dark:to-amber-950/20 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {featureName ? `Unlock ${featureName} with Pro ($7.99/mo)` : 'Free Tier: 10 item cap'}
          </span>
        </div>
        <button
          onClick={() => openSubscriptionUpgrade(featureName)}
          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 shrink-0"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 border border-indigo-700/50 p-6 text-white shadow-xl overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-24 bottom-0 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold">
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>Pro All-Access Feature</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold font-display text-white">
            {title}
          </h4>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openSubscriptionUpgrade(featureName)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>Upgrade for $7.99/mo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
