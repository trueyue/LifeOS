import React, { useState, useMemo } from 'react';
import {
  User,
  Shield,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Mail,
  Lock,
  KeyRound,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

const SECURITY_QUESTIONS = [
  'What is the name of your first school?',
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your favorite dessert?',
  'What was your childhood nickname?',
  'What is your mother’s maiden name?',
];

export const SettingsView: React.FC = () => {
  const {
    user,
    preferences,
    updatePreferences,
    updateProfile,
    logout,
    updateSecurityRecovery,
    deleteAccountWithSecurity,
  } = useAuth() as any;

  const { resetToSampleData } = useItems() as any;

  const [savedNotice, setSavedNotice] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  const [securityEmail, setSecurityEmail] = useState(user?.email || '');
  const [securityPassword, setSecurityPassword] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [confirmAnswer, setConfirmAnswer] = useState('');
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const [deleteEmail, setDeleteEmail] = useState(user?.email || '');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteQuestion, setDeleteQuestion] = useState('');
  const [deleteAnswer, setDeleteAnswer] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const [resetConfirm, setResetConfirm] = useState(false);

  React.useEffect(() => {
    if (user?.displayName) {
      setDisplayNameInput(user.displayName);
    }
    if (user?.email) {
      setSecurityEmail(user.email);
      setDeleteEmail(user.email);
    }
  }, [user?.displayName, user?.email]);

  const canUpdateSecurity = useMemo(
    () =>
      securityEmail.trim() &&
      securityPassword.trim() &&
      newQuestion.trim() &&
      newAnswer.trim() &&
      confirmAnswer.trim(),
    [securityEmail, securityPassword, newQuestion, newAnswer, confirmAnswer]
  );

  const canDeleteAccount = useMemo(
    () =>
      deleteEmail.trim() &&
      deletePassword.trim() &&
      deleteQuestion.trim() &&
      deleteAnswer.trim() &&
      confirmDelete,
    [deleteEmail, deletePassword, deleteQuestion, deleteAnswer, confirmDelete]
  );

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSaveDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = displayNameInput.trim();
    if (!clean) return;

    setIsSavingName(true);
    updateProfile({ displayName: clean });
    setIsSavingName(false);
    setNameSavedSuccess(true);
    triggerSaveNotice();
    setTimeout(() => setNameSavedSuccess(false), 3000);
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    try {
      await updateSecurityRecovery(
        securityEmail.trim(),
        securityPassword,
        newQuestion,
        newAnswer,
        confirmAnswer
      );
      setSecuritySuccess('Security question and answer updated successfully.');
      setSecurityPassword('');
      setNewAnswer('');
      setConfirmAnswer('');
      setNewQuestion('');
    } catch (err: any) {
      setSecurityError(err.message || 'Unable to update recovery settings.');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleteSuccess(null);

    if (!confirmDelete) {
      setDeleteError('Please confirm you want to delete your account.');
      return;
    }

    try {
      await deleteAccountWithSecurity(
        deleteEmail.trim(),
        deletePassword,
        deleteQuestion,
        deleteAnswer
      );
      setDeleteSuccess('Account deleted successfully.');
      setTimeout(() => logout(), 250);
    } catch (err: any) {
      setDeleteError(err.message || 'Unable to delete account.');
    }
  };

  const handleResetData = () => {
    resetToSampleData();
    setResetConfirm(false);
    triggerSaveNotice();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Preferences & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your profile, appearance, AI preferences, security, and account.
          </p>
        </div>

        {savedNotice && (
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        )}
      </div>

      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Profile</span>
          </h2>

          <button
            onClick={() => logout()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xl flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-800 shadow-md">
              {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : 'A'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {user?.displayName || 'User'}
              </h3>
              <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSaveDisplayName}
          className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Change Display Name / Username
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update how your name appears across your dashboard and AI assistant.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              placeholder="Enter your display name"
              className="flex-1 pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={isSavingName || !displayNameInput.trim() || displayNameInput.trim() === user?.displayName}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingName ? 'Saving...' : 'Save Name'}</span>
            </button>
          </div>

          {nameSavedSuccess && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Display name updated successfully.</span>
            </p>
          )}
        </form>
      </section>

      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </h2>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => {
              updatePreferences({ theme: 'light' });
              triggerSaveNotice();
            }}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              preferences.theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-600 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 mx-auto text-amber-500" />
            <span className="text-xs font-bold block">Light Theme</span>
          </button>

          <button
            onClick={() => {
              updatePreferences({ theme: 'dark' });
              triggerSaveNotice();
            }}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              preferences.theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 mx-auto text-indigo-400" />
            <span className="text-xs font-bold block">Dark Theme</span>
          </button>

          <button
            onClick={() => {
              updatePreferences({ theme: 'system' });
              triggerSaveNotice();
            }}
            className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              preferences.theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-600 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5 mx-auto text-slate-400" />
            <span className="text-xs font-bold block">System Auto</span>
          </button>
        </div>
      </section>

      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Assistant Preferences</span>
        </h2>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Daily summary email</h4>
              <p className="text-[11px] text-slate-400">Receive a daily digest of your financial priorities.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.dailySummaryEmail}
              onChange={(e) => {
                updatePreferences({ dailySummaryEmail: e.target.checked });
                triggerSaveNotice();
              }}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI suggestions</h4>
              <p className="text-[11px] text-slate-400">Enable helpful AI recommendations across the app.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoSuggest}
              onChange={(e) => {
                updatePreferences({ autoSuggest: e.target.checked });
                triggerSaveNotice();
              }}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Update Security Question
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Change your recovery question and answer.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateSecurity} className="space-y-4">
            {securityError && (
              <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {securityError}
              </div>
            )}

            {securitySuccess && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                {securitySuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={securityEmail}
                  onChange={(e) => setSecurityEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="you@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showSecurityPassword ? 'text' : 'password'}
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showSecurityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Security Question
              </label>
              <select
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Select a question</option>
                {SECURITY_QUESTIONS.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Security Answer
              </label>
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Type your answer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Security Answer
              </label>
              <input
                type="text"
                value={confirmAnswer}
                onChange={(e) => setConfirmAnswer(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Re-type your answer"
              />
            </div>

            <button
              type="submit"
              disabled={!canUpdateSecurity}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" />
                Update Recovery Settings
              </span>
            </button>
          </form>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanently remove your account and saved data.
              </p>
            </div>
          </div>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            {deleteError && (
              <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}

            {deleteSuccess && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                {deleteSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="you@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Security Question
              </label>
              <select
                value={deleteQuestion}
                onChange={(e) => setDeleteQuestion(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Select your question</option>
                {SECURITY_QUESTIONS.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Security Answer
              </label>
              <input
                type="text"
                value={deleteAnswer}
                onChange={(e) => setDeleteAnswer(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Type the answer to your security question"
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-red-600"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                I understand this will permanently delete my account and all saved data.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canDeleteAccount}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </span>
            </button>
          </form>
        </section>
      </div>

      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2 text-rose-600">
          <RotateCcw className="w-4 h-4" />
          <span>Sample & Demo Data</span>
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reset all items and restore the demonstration dataset.
        </p>

        {resetConfirm ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">Are you sure you want to reset all data?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Demonstration Data</span>
          </button>
        )}
      </section>
    </div>
  );
};