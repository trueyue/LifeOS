import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  FileText,
  Paperclip,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Shield,
  Upload,
  User,
  ExternalLink,
  Save,
  Zap,
  MapPin,
  Compass,
  Navigation,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, calculateWarrantyStatus, formatCurrency, getCategoryInfo, getPriorityBadge, getReminderLabel } from '../../utils/categoryHelpers';
import { ItemAttachment, LifeCategory, Priority, RecurringFrequency, ReminderTiming } from '../../types';
import { storage } from '../../services/storage';
import { motion, AnimatePresence } from 'motion/react';

export const ItemDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    setSelectedItemForDetail,
    setIsRouteOptimizerOpen,
    updateItem,
    deleteItem,
    toggleComplete,
    openDirectPay,
    cancelItemSubscription,
  } = useItems();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LifeCategory>('other');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [location, setLocation] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency | ''>('');
  const [autoPay, setAutoPay] = useState(false);
  const [warrantyMonths, setWarrantyMonths] = useState('');
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>('1_day');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const household = user ? storage.getHousehold(user.uid) : null;

  useEffect(() => {
    if (selectedItemForDetail) {
      setTitle(selectedItemForDetail.title);
      setDescription(selectedItemForDetail.description);
      setCategory(selectedItemForDetail.category);
      setPriority(selectedItemForDetail.priority);
      setDate(selectedItemForDetail.date || '');
      setTime(selectedItemForDetail.time || '');
      setAmount(selectedItemForDetail.amount !== null ? String(selectedItemForDetail.amount) : '');
      setVendor(selectedItemForDetail.vendor || '');
      setLocation(selectedItemForDetail.location || '');
      setLocationAddress(selectedItemForDetail.locationAddress || '');
      setRecurring(selectedItemForDetail.recurring);
      setRecurringFrequency(selectedItemForDetail.recurringFrequency || '');
      setAutoPay(Boolean(selectedItemForDetail.autoPay));
      setWarrantyMonths(selectedItemForDetail.warrantyLengthMonths ? String(selectedItemForDetail.warrantyLengthMonths) : '');
      setReminderTiming(selectedItemForDetail.reminderTiming || '1_day');
      setNotes(selectedItemForDetail.notes || '');
      setAssignedTo(selectedItemForDetail.assignedTo || '');
      setIsEditing(false);
    }
  }, [selectedItemForDetail]);

  if (!selectedItemForDetail) return null;

  const handleSaveEdits = () => {
    const wMonths = warrantyMonths ? parseInt(warrantyMonths, 10) : null;
    let warrantyExp: string | null = selectedItemForDetail.warrantyExpirationDate;
    if (wMonths) {
      const d = date ? new Date(date) : new Date();
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + wMonths);
        warrantyExp = d.toISOString().split('T')[0];
      }
    }

    const assignedMember = household?.members.find((m) => m.id === assignedTo);

    updateItem(selectedItemForDetail.id, {
      title,
      description,
      category,
      priority,
      date: date || null,
      time: time || null,
      amount: amount ? parseFloat(amount) : null,
      vendor: vendor || null,
      location: location || null,
      locationAddress: locationAddress || null,
      recurring,
      recurringFrequency: recurring ? (recurringFrequency as RecurringFrequency) : null,
      autoPay,
      warrantyLengthMonths: wMonths,
      warrantyExpirationDate: warrantyExp,
      reminderTiming,
      notes,
      assignedTo: assignedTo || null,
      assignedToName: assignedMember ? assignedMember.name : null,
    });

    setIsEditing(false);
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newAtt: ItemAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type || 'application/pdf',
        category: selectedItemForDetail.category === 'purchase' ? 'warranty' : selectedItemForDetail.category === 'bill' ? 'receipt' : 'other',
        uploadedAt: new Date().toISOString(),
      };

      const updatedAtts = [...(selectedItemForDetail.attachments || []), newAtt];
      updateItem(selectedItemForDetail.id, { attachments: updatedAtts });
      setIsUploading(false);
    }, 600);
  };

  const handleDeleteAttachment = (attId: string) => {
    const updated = (selectedItemForDetail.attachments || []).filter((a) => a.id !== attId);
    updateItem(selectedItemForDetail.id, { attachments: updated });
  };

  const catInfo = getCategoryInfo(selectedItemForDetail.category);
  const priorityBadge = getPriorityBadge(selectedItemForDetail.priority);
  const warrantyStatus = calculateWarrantyStatus(selectedItemForDetail.warrantyExpirationDate);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedItemForDetail(null)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleComplete(selectedItemForDetail.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                title={selectedItemForDetail.completed ? 'Mark as active' : 'Mark as completed'}
              >
                {selectedItemForDetail.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {catInfo.label}
                </span>
                <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display ${selectedItemForDetail.completed ? 'line-through text-slate-400' : ''}`}>
                  {selectedItemForDetail.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
                  isEditing
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">{isEditing ? 'Cancel Edit' : 'Edit'}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    deleteItem(selectedItemForDetail.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 dark:text-slate-300">
            {isEditing ? (
              /* Editable form */
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as LifeCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                      type="text"
                      value={date}
                      placeholder="e.g. 2026-09-05 or October 2026"
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input
                      type="text"
                      value={time}
                      placeholder="e.g. 2:30 PM"
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      placeholder="0.00"
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor / Store</label>
                    <input
                      type="text"
                      value={vendor}
                      placeholder="e.g. Best Buy, Netflix"
                      onChange={(e) => setVendor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue / Clinic / Place</label>
                    <input
                      type="text"
                      value={location}
                      placeholder="e.g. Bay Dental Arts, Whole Foods"
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={locationAddress}
                      placeholder="e.g. 450 Sutter St, San Francisco, CA"
                      onChange={(e) => setLocationAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Recurring Options */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">Recurring Item</label>
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                  {recurring && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Frequency</label>
                        <select
                          value={recurringFrequency}
                          onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="autoPayEdit"
                          checked={autoPay}
                          onChange={(e) => setAutoPay(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="autoPayEdit" className="text-xs text-slate-600 dark:text-slate-300">
                          Auto-Pay Enabled
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Household assignment */}
                {household && household.members.length > 0 && (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign to Member</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {household.members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & Details</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Additional context, account numbers, instructions..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Inspection View */
              <>
                {/* Description Banner */}
                {selectedItemForDetail.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {selectedItemForDetail.description}
                  </p>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Category */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Category</span>
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                      <span>{catInfo.emoji}</span>
                      <span>{catInfo.label}</span>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Priority</span>
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                      {priorityBadge.label}
                    </span>
                  </div>

                  {/* Amount / Cost */}
                  {selectedItemForDetail.amount !== null && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Amount</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(selectedItemForDetail.amount)}
                        {selectedItemForDetail.recurring && <span className="text-[10px] text-slate-400 font-normal"> /mo</span>}
                      </span>
                    </div>
                  )}

                  {/* Date & Time */}
                  {selectedItemForDetail.date && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Target Date</span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedItemForDetail.date}
                        {selectedItemForDetail.time && ` @ ${selectedItemForDetail.time}`}
                      </span>
                    </div>
                  )}

                  {/* Vendor */}
                  {selectedItemForDetail.vendor && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Vendor / Store</span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {selectedItemForDetail.vendor}
                      </span>
                    </div>
                  )}

                  {/* Reminder */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Reminder</span>
                    <span className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {getReminderLabel(selectedItemForDetail.reminderTiming)}
                    </span>
                  </div>
                </div>

                {/* Warranty Section (if applicable) */}
                {(selectedItemForDetail.warrantyLengthMonths || selectedItemForDetail.warrantyExpirationDate) && (
                  <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="font-bold text-xs text-teal-900 dark:text-teal-200">
                          Warranty Protection
                        </span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${warrantyStatus.colorClass}`}>
                        {warrantyStatus.icon} {warrantyStatus.label}
                      </span>
                    </div>
                    <p className="text-xs text-teal-800 dark:text-teal-300">
                      Duration: {selectedItemForDetail.warrantyLengthMonths} months
                      {selectedItemForDetail.warrantyExpirationDate && ` • Expires ${selectedItemForDetail.warrantyExpirationDate}`}
                    </p>
                  </div>
                )}

                {/* Location & Address Section */}
                {(selectedItemForDetail.location || selectedItemForDetail.locationAddress) && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 block">
                          {selectedItemForDetail.location || 'Designated Destination'}
                        </span>
                        {selectedItemForDetail.locationAddress && (
                          <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                            {selectedItemForDetail.locationAddress}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setSelectedItemForDetail(null);
                          setIsRouteOptimizerOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        title="Optimize circuit between errands and locations"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Route Optimizer</span>
                      </button>

                      {selectedItemForDetail.locationAddress && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            selectedItemForDetail.locationAddress
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                          title="Open address in Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {selectedItemForDetail.notes && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Notes & Instructions
                    </span>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedItemForDetail.notes}
                    </div>
                  </div>
                )}

                {/* Attachments & Documents */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      Attached Receipts & Documents ({selectedItemForDetail.attachments?.length || 0})
                    </span>

                    <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{isUploading ? 'Uploading...' : '+ Upload'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleSimulateFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {selectedItemForDetail.attachments && selectedItemForDetail.attachments.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedItemForDetail.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">({att.size})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => alert(`Opening ${att.name} preview.`)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600"
                              title="View document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-500"
                              title="Delete attachment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No receipts or warranties attached yet. Click + Upload to store documents.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>Created {new Date(selectedItemForDetail.createdAt).toLocaleDateString()}</span>
            
            <div className="flex items-center gap-2">
              {(selectedItemForDetail.category === 'subscription' || selectedItemForDetail.recurring) && !selectedItemForDetail.completed && (
                <button
                  onClick={() => {
                    if (confirm(`Cancel recurring tracking for "${selectedItemForDetail.title}"?`)) {
                      cancelItemSubscription(selectedItemForDetail.id);
                      setSelectedItemForDetail(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel Subscription
                </button>
              )}

              {!selectedItemForDetail.completed && (selectedItemForDetail.category === 'bill' || selectedItemForDetail.category === 'subscription' || (selectedItemForDetail.amount && selectedItemForDetail.amount > 0)) && (
                <button
                  onClick={() => {
                    const itemToPay = selectedItemForDetail;
                    setSelectedItemForDetail(null);
                    openDirectPay(itemToPay);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Pay Direct ({formatCurrency(selectedItemForDetail.amount || 0)})</span>
                </button>
              )}

              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
