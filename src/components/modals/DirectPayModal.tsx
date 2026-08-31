import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  DollarSign,
  Building2,
  CreditCard,
  Zap,
  Calendar,
  FileText,
  Download,
  Check,
  ArrowRight,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCategoryInfo } from '../../utils/categoryHelpers';
import { BankAccount, LifeItem, PaymentTransaction } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const DirectPayModal: React.FC = () => {
  const {
    isDirectPayModalOpen,
    setIsDirectPayModalOpen,
    directPayTargetItem,
    directPayCustomPayee,
    bankAccounts,
    setIsLinkBankModalOpen,
    processDirectPayment,
    addItem,
  } = useItems();
  const { user } = useAuth();

  const [amount, setAmount] = useState<string>('');
  const [selectedFundingId, setSelectedFundingId] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'instant_ach' | 'scheduled'>('instant_ach');
  const [memo, setMemo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentTransaction | null>(null);
  const [savedToDocs, setSavedToDocs] = useState(false);

  // Initialize data when opened
  useEffect(() => {
    if (isDirectPayModalOpen) {
      setCompletedPayment(null);
      setSavedToDocs(false);
      setIsProcessing(false);

      if (directPayTargetItem) {
        setAmount(directPayTargetItem.amount ? String(directPayTargetItem.amount) : '50.00');
        setMemo(
          directPayTargetItem.vendor
            ? `Payment for ${directPayTargetItem.title} (${directPayTargetItem.vendor})`
            : `Payment for ${directPayTargetItem.title}`
        );
      } else if (directPayCustomPayee) {
        setAmount(directPayCustomPayee.amount ? String(directPayCustomPayee.amount) : '100.00');
        setMemo(directPayCustomPayee.memo || `Direct payment to ${directPayCustomPayee.name}`);
      } else {
        setAmount('100.00');
        setMemo('Direct bill payment');
      }

      // Default funding source: primary account or first checking account
      if (bankAccounts.length > 0) {
        const primary = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
        setSelectedFundingId(primary.id);
      } else {
        setSelectedFundingId('');
      }
    }
  }, [isDirectPayModalOpen, directPayTargetItem, directPayCustomPayee, bankAccounts]);

  if (!isDirectPayModalOpen) return null;

  const payeeName =
    directPayTargetItem?.vendor ||
    directPayTargetItem?.title ||
    directPayCustomPayee?.name ||
    'Service Provider';

  const category = directPayTargetItem?.category || directPayCustomPayee?.category || 'bill';
  const catInfo = getCategoryInfo(category);

  const selectedBank = bankAccounts.find((b) => b.id === selectedFundingId);
  const numAmount = parseFloat(amount) || 0;
  const hasInsufficientFunds =
    selectedBank && selectedBank.accountType !== 'credit' && selectedBank.availableBalance < numAmount;

  const handleClose = () => {
    setIsDirectPayModalOpen(false);
    setTimeout(() => {
      setCompletedPayment(null);
      setIsProcessing(false);
      setSavedToDocs(false);
    }, 300);
  };

  const handleOpenLinkBank = () => {
    setIsLinkBankModalOpen(true);
  };

  const handleAuthorizePayment = async () => {
    if (!selectedBank || numAmount <= 0) return;

    setIsProcessing(true);

    try {
      // Simulate real-time payment gateway network delay
      await new Promise((resolve) => setTimeout(resolve, 1600));

      const recorded = await processDirectPayment({
        itemId: directPayTargetItem ? directPayTargetItem.id : null,
        payeeName,
        billerCategory: category,
        amount: numAmount,
        currency: 'USD',
        fundingSourceId: selectedBank.id,
        fundingSourceName: `${selectedBank.institutionName} ${selectedBank.accountName}`,
        fundingSourceMask: selectedBank.accountNumberMask,
        fundingSourceType: selectedBank.accountType === 'credit' ? 'credit_card' : 'bank_account',
        status: 'completed',
        paymentDate: new Date().toISOString().split('T')[0],
        deliveryMethod,
        memo: memo || undefined,
      });

      setCompletedPayment(recorded);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReceiptToDocuments = () => {
    if (!completedPayment || savedToDocs) return;

    const receiptDate = new Date().toISOString().split('T')[0];
    addItem({
      title: `Payment Receipt: ${completedPayment.payeeName}`,
      description: `Official direct payment receipt for $${completedPayment.amount.toFixed(2)} paid via ${completedPayment.fundingSourceName}. Confirmation: ${completedPayment.confirmationCode}`,
      category: 'document',
      priority: 'low',
      date: receiptDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reminderDate: null,
      reminderTiming: 'none',
      amount: completedPayment.amount,
      vendor: completedPayment.payeeName,
      recurring: false,
      recurringFrequency: null,
      warrantyLengthMonths: null,
      warrantyExpirationDate: null,
      tags: ['receipt', 'paid-direct', 'banking', 'tax-record'],
      completed: true,
      completedAt: new Date().toISOString(),
      attachments: [
        {
          id: `att-receipt-${Date.now()}`,
          name: `Receipt_${completedPayment.confirmationCode}.pdf`,
          size: '142 KB',
          type: 'application/pdf',
          category: 'receipt',
          uploadedAt: new Date().toISOString(),
        },
      ],
      notes: `Authorization Code: ${completedPayment.confirmationCode}\nFunding Account: ${completedPayment.fundingSourceName} (${completedPayment.fundingSourceMask})\nProcessed: ${completedPayment.createdAt}`,
    });

    setSavedToDocs(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {completedPayment ? 'Payment Successful' : 'Direct Pay Hub'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Zero-Fee Instant Electronic Settlement</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!completedPayment ? (
            <div className="space-y-5">
              {/* Payee Target Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
                    {catInfo.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                      Biller / Payee
                    </span>
                    <h3 className="text-base font-bold">{payeeName}</h3>
                    {directPayTargetItem?.date && (
                      <p className="text-[11px] text-slate-300">
                        Due Date: {directPayTargetItem.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                    Verified Biller
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                    ACH Direct
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Amount ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold font-display text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Funding Source Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pay From (Funding Source)
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenLinkBank}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link New Bank</span>
                  </button>
                </div>

                {bankAccounts.length === 0 ? (
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No linked banking apps or accounts found yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenLinkBank}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Connect Bank via Plaid / OpenBanking</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((acc) => {
                      const isSelected = acc.id === selectedFundingId;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedFundingId(acc.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-xs">
                              {acc.institutionLogo || '🏛️'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {acc.institutionName} {acc.accountName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {acc.accountNumberMask} • {acc.accountType.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-900 dark:text-white font-display">
                              ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Available
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delivery Speed Options */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setDeliveryMethod('instant_ach')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === 'instant_ach'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Instant ACH</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Direct 0-fee settlement</p>
                </div>

                <div
                  onClick={() => setDeliveryMethod('scheduled')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === 'scheduled'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">On Due Date</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated on scheduled day</p>
                </div>
              </div>

              {/* Memo field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Memo / Account # Reference
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="e.g. Policy #, Acct # or Note"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Insufficient Funds warning */}
              {hasInsufficientFunds && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Warning: The selected bank balance (${selectedBank?.availableBalance.toFixed(2)}) is less than the payment amount.
                  </span>
                </div>
              )}

              {/* Authorize Button */}
              <button
                type="button"
                onClick={handleAuthorizePayment}
                disabled={isProcessing || !selectedBank || numAmount <= 0}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Direct Authorization with Bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Payment of {formatCurrency(numAmount)}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STEP 2: PAYMENT RECEIPT & CONFIRMATION */
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                  Payment Confirmed!
                </h3>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {formatCurrency(completedPayment.amount)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transferred to <strong>{completedPayment.payeeName}</strong>
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Confirmation Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {completedPayment.confirmationCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Paid From</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {completedPayment.fundingSourceName} ({completedPayment.fundingSourceMask})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Delivery Speed</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ⚡ Instant ACH (Settled)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Timestamp</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(completedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
                {completedPayment.memo && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>Memo</span>
                    <span className="italic text-slate-700 dark:text-slate-300">{completedPayment.memo}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveReceiptToDocuments}
                  disabled={savedToDocs}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    savedToDocs
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{savedToDocs ? '✓ Saved to Documents Vault' : 'Save Receipt to Documents'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
