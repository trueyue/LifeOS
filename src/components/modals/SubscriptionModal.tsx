import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  CreditCard,
  Zap,
  Receipt,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { motion, AnimatePresence } from 'motion/react';

export const SubscriptionModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeFeatureTrigger,
    subscription,
    isPro,
    tier,
    subscribeToPro,
    cancelSubscription,
    reactivateSubscription,
  } = useItems();

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'card' | 'apple_pay' | 'google_pay'
  >('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [activeTab, setModalTab] = useState<'plans' | 'invoices'>('plans');
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [cancelReason, setCancelReason] = useState('not_using_enough');
  const [cancelImmediate, setCancelImmediate] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const monthlyPrice = 7.99;
  const annualPrice = 79.99;
  const annualMonthlyEquivalent = (annualPrice / 12).toFixed(2);
  const savingsPercent = 17;

  const handleCheckout = async () => {
    if (selectedPaymentMethod === 'card') {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      if (cleanDigits.length < 12) {
        alert('Please enter a valid card number.');
        return;
      }
      if (!cardExpiry.trim()) {
        alert('Please enter your card expiration date (MM/YY).');
        return;
      }
      if (!cardCvc.trim()) {
        alert('Please enter your card CVC security code.');
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      const planId = billingInterval === 'year' ? 'pro_annual_7999' : 'pro_monthly_799';
      const cleanDigits = cardNumber.replace(/\D/g, '');
      const last4 = cleanDigits.length >= 4 ? cleanDigits.slice(-4) : '0000';

      subscribeToPro(planId, {
        brand: 'Visa',
        last4,
      });

      setIsProcessing(false);
      setIsUpgradeModalOpen(false);
    }, 700);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsUpgradeModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shrink-0 overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-32 bottom-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LifeOS All-Access Membership</span>
              </div>
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium">
                  <Check className="w-3 h-3" /> Active Plan
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              {upgradeFeatureTrigger ? (
                <>Unlock {upgradeFeatureTrigger} with LifeOS Pro</>
              ) : isPro ? (
                <>Manage Your LifeOS Pro Subscription</>
              ) : (
                <>Automate your entire life for just $7.99/mo</>
              )}
            </h2>

            <p className="mt-1.5 text-sm text-indigo-200/90 max-w-xl">
              Free plan covers basic tasks. Pro gives you unlimited capacity, AI planning, and upgraded automations.
            </p>

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setModalTab('plans')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'plans'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Pricing & Checkout
              </button>

              {isPro && (
                <button
                  onClick={() => setModalTab('invoices')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'invoices'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  Billing & Receipts ({subscription.invoices.length})
                </button>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'plans' && (
              <>
                {!isPro && (
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setBillingInterval('month')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          billingInterval === 'month'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Monthly Billing ($7.99/mo)
                      </button>
                      <button
                        onClick={() => setBillingInterval('year')}
                        className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          billingInterval === 'year'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span>Annual Billing ($79.99/yr)</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold">
                          Save {savingsPercent}%
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    !isPro
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 ring-2 ring-slate-400/20'
                      : 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-90'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Starter
                        </span>
                        {!isPro && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            Current Plan
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">$0</span>
                        <span className="text-xs text-slate-500">/ forever</span>
                      </div>

                      <div className="mt-6 space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Basic planning and task tracking</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Limited active items and reminders</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Default billing amount is $0.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-3xl p-6 border-2 transition-all relative flex flex-col justify-between ${
                    isPro
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xl'
                  }`}>
                    <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md">
                      MOST POPULAR
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Pro All-Access
                        </span>
                        {isPro && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                          ${billingInterval === 'year' ? annualMonthlyEquivalent : monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500">
                          / month {billingInterval === 'year' && '(billed $79.99/yr)'}
                        </span>
                      </div>

                      <div className="mt-6 space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>Unlimited items, tasks, and reminders</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>AI budget assistant and advanced planning</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>Priority support and next-gen automation</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {isPro ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active Pro
                            </span>
                            <span>Valid to: {subscription.currentPeriodEnd}</span>
                          </div>

                          {subscription.cancelAtPeriodEnd ? (
                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Auto-Renewal Cancelled</span>
                              </div>
                              <button
                                onClick={() => reactivateSubscription()}
                                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                              >
                                Reactivate Auto-Renewal
                              </button>
                            </div>
                          ) : showCancelOptions ? (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                Cancel LifeOS Pro Subscription
                              </h4>
                              <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-500 block">Reason for leaving:</label>
                                <select
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                >
                                  <option value="not_using_enough">Not using features enough</option>
                                  <option value="too_expensive">Too expensive / budget constraint</option>
                                  <option value="missing_features">Missing a specific feature</option>
                                  <option value="temporary_pause">Taking a temporary break</option>
                                  <option value="other">Other reason</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowCancelOptions(false)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                  Keep Pro
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    cancelSubscription(cancelImmediate, cancelReason);
                                    setShowCancelOptions(false);
                                  }}
                                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                                >
                                  Confirm Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowCancelOptions(true)}
                              className="w-full py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all"
                            >
                              Cancel Subscription
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('card')}
                              className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                                selectedPaymentMethod === 'card'
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <CreditCard className="w-4 h-4 mx-auto mb-0.5" />
                              Card
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('apple_pay')}
                              className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                                selectedPaymentMethod === 'apple_pay'
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              🍎 Pay
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('google_pay')}
                              className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                                selectedPaymentMethod === 'google_pay'
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              G Pay
                            </button>
                          </div>

                          {selectedPaymentMethod === 'card' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                                  placeholder="1234 5678 9012 3456"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Expires
                                  </label>
                                  <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                                    placeholder="MM/YY"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    CVC
                                  </label>
                                  <input
                                    type="text"
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                                    placeholder="CVC"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                          >
                            {isProcessing ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Activating LifeOS Pro...</span>
                              </div>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                                <span>
                                  Subscribe for ${billingInterval === 'year' ? '79.99/year' : '7.99/month'}
                                </span>
                              </>
                            )}
                          </button>

                          <p className="text-[11px] text-center text-slate-400">
                            🔒 256-bit encrypted checkout. Cancel anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Subscription Invoices & Receipts
                  </h3>
                  <span className="text-xs text-slate-500">
                    Billed to {subscription.paymentMethodBrand} •••• {subscription.paymentMethodLast4}
                  </span>
                </div>

                {subscription.invoices.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                    No past invoices yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {subscription.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {inv.planName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {inv.invoiceNumber} • {inv.date} • {inv.paymentMethodMask}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              ${inv.amount.toFixed(2)}
                            </span>
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Paid
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              alert(`LifeOS Receipt #${inv.invoiceNumber}\nAmount: $${inv.amount.toFixed(2)}\nPeriod: ${inv.periodStart} to ${inv.periodEnd}\nStatus: PAID`);
                            }}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                            title="Download Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};