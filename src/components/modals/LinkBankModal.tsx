import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  AlertCircle,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { motion, AnimatePresence } from 'motion/react';

interface PopularBank {
  id: string;
  name: string;
  logo: string;
  color: string;
  bgGradient: string;
  defaultAccounts: Array<{
    name: string;
    type: 'checking' | 'savings' | 'credit';
    balance: number;
    mask: string;
  }>;
}

const POPULAR_BANKS: PopularBank[] = [
  {
    id: 'chase',
    name: 'Chase Bank',
    logo: '🏛️',
    color: '#117ACA',
    bgGradient: 'from-blue-700 to-indigo-900',
    defaultAccounts: [
      { name: 'Total Checking', type: 'checking', balance: 5240.80, mask: '•••• 4892' },
      { name: 'Premier Savings', type: 'savings', balance: 12500.00, mask: '•••• 9104' },
      { name: 'Freedom Unlimited Card', type: 'credit', balance: 412.50, mask: '•••• 3319' },
    ],
  },
  {
    id: 'bofa',
    name: 'Bank of America',
    logo: '🏦',
    color: '#E31837',
    bgGradient: 'from-red-600 to-rose-900',
    defaultAccounts: [
      { name: 'Advantage Plus Checking', type: 'checking', balance: 3890.15, mask: '•••• 7183' },
      { name: 'Advantage Savings', type: 'savings', balance: 18420.00, mask: '•••• 2910' },
    ],
  },
  {
    id: 'wells',
    name: 'Wells Fargo',
    logo: '🐎',
    color: '#D71E28',
    bgGradient: 'from-amber-600 to-red-800',
    defaultAccounts: [
      { name: 'Everyday Checking', type: 'checking', balance: 2940.00, mask: '•••• 6401' },
      { name: 'Way2Save Savings', type: 'savings', balance: 8310.50, mask: '•••• 8821' },
    ],
  },
  {
    id: 'capitalone',
    name: 'Capital One',
    logo: '💳',
    color: '#004879',
    bgGradient: 'from-blue-600 to-sky-900',
    defaultAccounts: [
      { name: '360 Checking', type: 'checking', balance: 4150.20, mask: '•••• 3411' },
      { name: '360 Performance Savings', type: 'savings', balance: 22400.00, mask: '•••• 5590' },
      { name: 'Venture X Card', type: 'credit', balance: 650.00, mask: '•••• 1209' },
    ],
  },
  {
    id: 'citi',
    name: 'Citibank',
    logo: '🌐',
    color: '#003B70',
    bgGradient: 'from-sky-700 to-blue-950',
    defaultAccounts: [
      { name: 'Citibank Checking', type: 'checking', balance: 3120.00, mask: '•••• 8234' },
      { name: 'Citi Custom Cash Card', type: 'credit', balance: 210.40, mask: '•••• 7712' },
    ],
  },
  {
    id: 'apple',
    name: 'Apple Card & Savings',
    logo: '🍎',
    color: '#000000',
    bgGradient: 'from-slate-800 to-slate-950',
    defaultAccounts: [
      { name: 'Apple Card (Goldman Sachs)', type: 'credit', balance: 1240.80, mask: '•••• 9320' },
      { name: 'Apple Savings (4.4% APY)', type: 'savings', balance: 9800.00, mask: '•••• 6614' },
    ],
  },
  {
    id: 'fidelity',
    name: 'Fidelity Investments',
    logo: '📈',
    color: '#437F2C',
    bgGradient: 'from-emerald-700 to-teal-950',
    defaultAccounts: [
      { name: 'Cash Management Checking', type: 'checking', balance: 6840.00, mask: '•••• 4188' },
      { name: 'Individual Brokerage', type: 'savings', balance: 34190.00, mask: '•••• 9901' },
    ],
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    logo: '📊',
    color: '#00A0DF',
    bgGradient: 'from-cyan-700 to-blue-900',
    defaultAccounts: [
      { name: 'High Yield Investor Checking', type: 'checking', balance: 4500.00, mask: '•••• 1502' },
    ],
  },
  {
    id: 'amex',
    name: 'American Express',
    logo: '🦅',
    color: '#006FCF',
    bgGradient: 'from-blue-600 to-indigo-950',
    defaultAccounts: [
      { name: 'Amex Gold Card', type: 'credit', balance: 890.30, mask: '•••• 3001' },
      { name: 'High Yield Savings', type: 'savings', balance: 16500.00, mask: '•••• 8412' },
    ],
  },
  {
    id: 'usaa',
    name: 'USAA Federal Savings',
    logo: '⭐',
    color: '#0C2340',
    bgGradient: 'from-slate-700 to-slate-900',
    defaultAccounts: [
      { name: 'Classic Checking', type: 'checking', balance: 5120.00, mask: '•••• 9012' },
    ],
  },
];

type Step = 'select_bank' | 'credentials' | 'otp' | 'select_accounts' | 'success';

export const LinkBankModal: React.FC = () => {
  const { isLinkBankModalOpen, setIsLinkBankModalOpen, linkBankAccount, bankAccounts } = useItems();
  
  const [step, setStep] = useState<Step>('select_bank');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<PopularBank | null>(null);
  
  // Credentials form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Account selection state
  const [selectedAccountIndexes, setSelectedAccountIndexes] = useState<number[]>([0]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  if (!isLinkBankModalOpen) return null;

  const handleClose = () => {
    setIsLinkBankModalOpen(false);
    // Reset after closing animation
    setTimeout(() => {
      setStep('select_bank');
      setSelectedBank(null);
      setSearchQuery('');
      setIsAuthenticating(false);
      setIsVerifyingOtp(false);
      setIsFinalizing(false);
    }, 300);
  };

  const handleSelectBank = (bank: PopularBank) => {
    setSelectedBank(bank);
    setSelectedAccountIndexes([0]);
    setStep('credentials');
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setStep('select_accounts');
    }, 1000);
  };

  const toggleAccountSelection = (index: number) => {
    if (selectedAccountIndexes.includes(index)) {
      if (selectedAccountIndexes.length > 1) {
        setSelectedAccountIndexes(selectedAccountIndexes.filter((i) => i !== index));
      }
    } else {
      setSelectedAccountIndexes([...selectedAccountIndexes, index]);
    }
  };

  const handleConfirmAccounts = () => {
    if (!selectedBank) return;
    setIsFinalizing(true);

    setTimeout(() => {
      // Link each selected account
      selectedAccountIndexes.forEach((idx) => {
        const acc = selectedBank.defaultAccounts[idx];
        linkBankAccount({
          institutionId: selectedBank.id,
          institutionName: selectedBank.name,
          institutionLogo: selectedBank.logo,
          accountType: acc.type,
          accountName: acc.name,
          accountNumberMask: acc.mask,
          currentBalance: acc.balance,
          availableBalance: acc.balance,
          currency: 'USD',
          status: 'connected',
          color: selectedBank.bgGradient,
          isPrimary: bankAccounts.length === 0 && idx === 0,
        });
      });

      setIsFinalizing(false);
      setStep('success');
    }, 1100);
  };

  const filteredBanks = POPULAR_BANKS.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Security Badge */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {step === 'select_bank' && 'Link Bank Account'}
                  {step === 'credentials' && `Sign in to ${selectedBank?.name}`}
                  {step === 'otp' && 'Two-Factor Verification'}
                  {step === 'select_accounts' && 'Select Accounts to Link'}
                  {step === 'success' && 'Account Connected!'}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>256-bit encrypted direct connection</span>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: SELECT BANK */}
          {step === 'select_bank' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect your bank or card to pay utilities, insurance, rent, and subscriptions directly with 1 click.
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bank or credit union..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bank Grid */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Popular Institutions
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
                        {bank.logo}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {bank.name}
                        </p>
                        <p className="text-[10px] text-slate-400">Instant Linking</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security info card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Your credentials are never stored. Read-only and direct payment authorizations use tokenized bank gateways.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: CREDENTIALS */}
          {step === 'credentials' && selectedBank && (
            <form onSubmit={handleAuthenticate} className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  {selectedBank.logo}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{selectedBank.name}</h3>
                  <p className="text-[11px] text-indigo-200">Secure Direct Access Login</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter online banking ID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_bank')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating with {selectedBank.name}...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SELECT ACCOUNTS */}
          {step === 'select_accounts' && selectedBank && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Select accounts from {selectedBank.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose which accounts you wish to link for balances and 1-click bill payments.
                </p>
              </div>

              <div className="space-y-2.5">
                {selectedBank.defaultAccounts.map((acc, index) => {
                  const isSelected = selectedAccountIndexes.includes(index);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleAccountSelection(index)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {acc.type.toUpperCase()} • {acc.mask}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-display">
                          ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleConfirmAccounts}
                disabled={isFinalizing || selectedAccountIndexes.length === 0}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98 transition-all disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Establishing Tokenized Connection...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Connect {selectedAccountIndexes.length} Selected Account(s)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && selectedBank && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedBank.name} Connected!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your accounts are now linked. You can view balances and pay utility, insurance, and subscription bills directly from LifeOS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Connection Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Active & Synced</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Direct Pay Eligibility</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Enabled (Instant ACH)</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all"
              >
                Done & Return to App
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
