import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Mic,
  MicOff,
  Check,
  Edit2,
  Calendar,
  DollarSign,
  Shield,
  Tag,
  Clock,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { parseLifeInputWithAI } from '../../services/geminiClient';
import { CATEGORIES, getCategoryInfo, getPriorityBadge } from '../../utils/categoryHelpers';
import { LifeCategory, ParsedLifeInput, Priority, RecurringFrequency, ReminderTiming } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const QuickCaptureModal: React.FC = () => {
  const { isQuickCaptureOpen, setIsQuickCaptureOpen, quickCapturePrefill, setQuickCapturePrefill, addItem } = useItems();

  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedLifeInput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Editable fields state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<LifeCategory>('other');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editVendor, setEditVendor] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editFrequency, setEditFrequency] = useState<RecurringFrequency | ''>('');
  const [editWarranty, setEditWarranty] = useState('');
  const [editReminder, setEditReminder] = useState<ReminderTiming>('1_day');
  const [editNotes, setEditNotes] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize prefill
  useEffect(() => {
    if (isQuickCaptureOpen) {
      setIsSavedSuccess(false);
      setIsEditing(false);
      setParsedResult(null);
      if (quickCapturePrefill) {
        setInput(quickCapturePrefill);
        handleParse(quickCapturePrefill);
        setQuickCapturePrefill('');
      } else {
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isQuickCaptureOpen, quickCapturePrefill]);

  // Speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        if (input.trim()) {
          handleParse(input);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleParse = async (textToParse = input) => {
    const trimmed = textToParse.trim();
    if (!trimmed) return;

    setIsParsing(true);
    setIsEditing(false);
    try {
      const result = await parseLifeInputWithAI(trimmed);
      setParsedResult(result);

      // Populate edit fields
      setEditTitle(result.title);
      setEditCategory(result.category);
      setEditPriority(result.priority);
      setEditDate(result.date || '');
      setEditAmount(result.amount ? String(result.amount) : '');
      setEditVendor(result.vendor || '');
      setEditLocation(result.location || '');
      setEditLocationAddress(result.locationAddress || '');
      setEditRecurring(result.recurring);
      setEditFrequency(result.recurringFrequency || '');
      setEditWarranty(result.warrantyLengthMonths ? String(result.warrantyLengthMonths) : '');
      setEditReminder('1_day');
      setEditNotes(result.description);
    } catch (error) {
      console.error('Error parsing:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (!parsedResult && !editTitle) return;

    const titleToSave = isEditing ? editTitle : parsedResult?.title || input;
    const categoryToSave = isEditing ? editCategory : parsedResult?.category || 'other';
    const priorityToSave = isEditing ? editPriority : parsedResult?.priority || 'medium';
    const dateToSave = isEditing ? (editDate || null) : parsedResult?.date || null;
    const amountToSave = isEditing ? (editAmount ? parseFloat(editAmount) : null) : parsedResult?.amount || null;
    const vendorToSave = isEditing ? (editVendor || null) : parsedResult?.vendor || null;
    const locationToSave = isEditing ? (editLocation || null) : parsedResult?.location || null;
    const locationAddressToSave = isEditing ? (editLocationAddress || null) : parsedResult?.locationAddress || null;
    const recurringToSave = isEditing ? editRecurring : Boolean(parsedResult?.recurring);
    const freqToSave = isEditing ? (editFrequency ? (editFrequency as RecurringFrequency) : null) : parsedResult?.recurringFrequency || null;
    const warrantyMonths = isEditing ? (editWarranty ? parseInt(editWarranty, 10) : null) : parsedResult?.warrantyLengthMonths || null;

    let warrantyExp: string | null = null;
    if (warrantyMonths) {
      const d = dateToSave ? new Date(dateToSave) : new Date();
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + warrantyMonths);
        warrantyExp = d.toISOString().split('T')[0];
      }
    }

    addItem({
      title: titleToSave,
      description: isEditing ? editNotes : parsedResult?.description || input,
      category: categoryToSave,
      priority: priorityToSave,
      date: dateToSave,
      time: parsedResult?.time || null,
      reminderDate: parsedResult?.reminderDate || null,
      reminderTiming: editReminder,
      amount: amountToSave,
      vendor: vendorToSave,
      location: locationToSave,
      locationAddress: locationAddressToSave,
      recurring: recurringToSave,
      recurringFrequency: freqToSave,
      warrantyLengthMonths: warrantyMonths,
      warrantyExpirationDate: warrantyExp,
      tags: parsedResult?.tags || [],
      completed: false,
      completedAt: null,
      attachments: [],
      notes: isEditing ? editNotes : (parsedResult?.reasoning || ''),
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsQuickCaptureOpen(false);
      setIsSavedSuccess(false);
      setParsedResult(null);
      setInput('');
    }, 1200);
  };

  const samplePrompts = [
    'My car needs an oil change in October.',
    'My electric bill is $143 due on September 5 every month.',
    'I bought a $700 TV from Best Buy today with a two-year warranty.',
    'Remind me to cancel my free trial before September 20.',
    'Dentist cleaning scheduled for Friday at 2:30 PM.',
    'Driver\'s license renewal due next year.',
  ];

  if (!isQuickCaptureOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsQuickCaptureOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Quick Capture</h2>
                <p className="text-xs text-slate-400">Tell LifeOS anything in normal language</p>
              </div>
            </div>

            <button
              onClick={() => setIsQuickCaptureOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {isSavedSuccess ? (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-8 h-8 stroke-[3]" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Added to LifeOS ✓</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Organized and placed right where it matters.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Input Area */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleParse();
                    }
                  }}
                  placeholder="Tell LifeOS anything… (e.g. 'My car needs an oil change in October' or '$143 electric bill due Sep 5 every month')"
                  rows={3}
                  className="w-full p-4 pr-12 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                    }`}
                    title={isListening ? 'Stop listening' : 'Speak to LifeOS'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sample Chips */}
              {!parsedResult && !isParsing && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Try these examples
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInput(prompt);
                          handleParse(prompt);
                        }}
                        className="text-xs text-left py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    LifeOS is understanding your request...
                  </span>
                </div>
              )}

              {/* Parsed Result Box (The Core Capture Experience) */}
              {parsedResult && !isParsing && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      I found this:
                    </span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Edit2 className="w-3 h-3" />
                      {isEditing ? 'View summary' : 'Edit details'}
                    </button>
                  </div>

                  {!isEditing ? (
                    /* Clean Summary Card */
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{getCategoryInfo(parsedResult.category).emoji}</span>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {parsedResult.title}
                            </h4>
                            <p className="text-xs text-slate-500 capitalize">
                              Category: {getCategoryInfo(parsedResult.category).label}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            getPriorityBadge(parsedResult.priority).badgeClass
                          }`}
                        >
                          {getPriorityBadge(parsedResult.priority).label} Priority
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        {parsedResult.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Date: <strong>{parsedResult.date}</strong></span>
                          </div>
                        )}
                        {parsedResult.amount !== null && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span>Amount: <strong>${parsedResult.amount}</strong></span>
                          </div>
                        )}
                        {parsedResult.recurring && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <span>Repeats: <strong>{parsedResult.recurringFrequency || 'Monthly'}</strong></span>
                          </div>
                        )}
                        {parsedResult.warrantyLengthMonths && (
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-teal-500" />
                            <span>Warranty: <strong>{parsedResult.warrantyLengthMonths} mos</strong></span>
                          </div>
                        )}
                        {(parsedResult.location || parsedResult.locationAddress) && (
                          <div className="flex items-center gap-1.5 col-span-2 text-emerald-600 dark:text-emerald-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Location: <strong>{parsedResult.location || ''}</strong>
                              {parsedResult.locationAddress && ` (${parsedResult.locationAddress})`}
                            </span>
                          </div>
                        )}
                        {parsedResult.reminderDate && (
                          <div className="flex items-center gap-1.5 col-span-2 text-indigo-600 dark:text-indigo-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reminder: <strong>{parsedResult.reminderDate}</strong></span>
                          </div>
                        )}
                      </div>

                      {parsedResult.reasoning && (
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          "{parsedResult.reasoning}"
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Detailed Edit Form */
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as LifeCategory)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          >
                            {Object.values(CATEGORIES).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.emoji} {c.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date / Month</label>
                          <input
                            type="text"
                            value={editDate}
                            placeholder="e.g. 2026-09-05 or October 2026"
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            placeholder="e.g. 143.00"
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor / Store</label>
                          <input
                            type="text"
                            value={editVendor}
                            placeholder="e.g. Best Buy, PG&E"
                            onChange={(e) => setEditVendor(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Warranty (Months)</label>
                          <input
                            type="number"
                            value={editWarranty}
                            placeholder="e.g. 24"
                            onChange={(e) => setEditWarranty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Place / Venue</label>
                          <input
                            type="text"
                            value={editLocation}
                            placeholder="e.g. Bay Dental Clinic"
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                          <input
                            type="text"
                            value={editLocationAddress}
                            placeholder="e.g. 450 Sutter St, SF"
                            onChange={(e) => setEditLocationAddress(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCaptureOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                {!parsedResult ? (
                  <button
                    type="button"
                    disabled={!input.trim() || isParsing}
                    onClick={() => handleParse()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <span>Analyze with LifeOS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save to LifeOS</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
