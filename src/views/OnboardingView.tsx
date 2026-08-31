import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Plus, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const { addItemFromNaturalLanguage } = useItems();

  const [step, setStep] = useState(1);
  const [firstInput, setFirstInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedItems, setCapturedItems] = useState<string[]>([]);

  const sampleStarters = [
    'Car oil change in October',
    'Rent is $1,850 due on the 1st of every month',
    'Cancel Spotify trial next Monday',
    'Doctor appointment at 10 AM on March 15',
  ];

  const handleCapture = async (textToCapture = firstInput) => {
    const text = textToCapture.trim();
    if (!text) return;

    setIsProcessing(true);
    try {
      await addItemFromNaturalLanguage(text);
      setCapturedItems((prev) => [...prev, text]);
      setFirstInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                Welcome, {user?.displayName || 'Friend'}!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                LifeOS is designed around one core principle: <br />
                <strong className="text-indigo-600 dark:text-indigo-400">
                  You don’t manage your life. LifeOS manages it for you.
                </strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                <span>✨ What LifeOS handles:</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Automatic bill calculations and payment reminders</li>
                <li>• Car maintenance, oil changes, and registration schedules</li>
                <li>• Free trial cancellations and subscription audits</li>
                <li>• Warranty expiration tracking and receipts vault</li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: First Quick Capture */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Step 2 of 3
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                Tell LifeOS your first obligation
              </h2>
              <p className="text-xs text-slate-400">
                Type naturally. Our AI extracts due dates, costs, vendors, and priorities automatically.
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={firstInput}
                  onChange={(e) => setFirstInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                  placeholder="e.g. Electric bill is $143 due on the 5th of every month..."
                  className="w-full pl-4 pr-12 py-3.5 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => handleCapture()}
                  disabled={!firstInput.trim() || isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Starter chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">Or pick an example:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCapture(starter)}
                      disabled={isProcessing}
                      className="text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700 transition-colors"
                    >
                      + {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Added list */}
            {capturedItems.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>Captured & Parsed ({capturedItems.length})</span>
                </div>
                {capturedItems.map((item, idx) => (
                  <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    • "{item}"
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                You're all set!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your personal LifeOS dashboard is ready. Add items anytime by tapping the "+ Tell LifeOS" button or speaking your thoughts.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25"
            >
              Enter My LifeOS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
