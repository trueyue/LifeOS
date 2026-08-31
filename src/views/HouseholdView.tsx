import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Shield,
  Calendar,
  DollarSign,
  Receipt,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Household, HouseholdMember } from '../types';
import { FeatureGateBanner } from '../components/common/FeatureGateBanner';

export const HouseholdView: React.FC = () => {
  const { user } = useAuth();
  const { items, isPro, openSubscriptionUpgrade, setSelectedItemForDetail } = useItems();
  const [copied, setCopied] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const household = user ? storage.getHousehold(user.uid) : null;

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Household & Family Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Coordinate shared expenses, family appointments, and household responsibilities
          </p>
        </div>

        <FeatureGateBanner
          title="Household & Family Sharing is a LifeOS Pro Feature"
          description="Collaborate with your spouse, family members, or roommates. Share household bills, split recurring utilities, track family appointments, and sync car maintenance across devices."
          featureName="Household & Family Hub"
        />

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Unlock Multi-User Family Collaboration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade to LifeOS Pro ($7.99/mo) to invite up to 6 household members with individual permissions and shared bill tracking.
            </p>
          </div>
          <button
            onClick={() => openSubscriptionUpgrade('Household & Family Hub')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro ($7.99/mo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleCopyInvite = () => {
    if (!household) return;
    navigator.clipboard.writeText(
      `Join my LifeOS Household with invite code: ${household.inviteCode} (https://lifeos.app.com/join/${household.inviteCode})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMemberName.trim() || !newMemberEmail.trim()) return;

    storage.addHouseholdMember(user.uid, newMemberName.trim(), newMemberEmail.trim());
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Household & Family Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Coordinate shared expenses, family appointments, and household responsibilities
          </p>
        </div>

        <button
          onClick={() => setIsAddingMember(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Invite Member</span>
        </button>
      </div>

      {/* Household Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Active Household
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display">{household?.name || 'Chen Household'}</h2>
          <p className="text-xs text-indigo-200">
            {household?.members.length || 2} members sharing life management
          </p>
        </div>

        {/* Invite Code Box */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3 backdrop-blur-md">
          <div>
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Invite Code</span>
            <span className="font-mono font-bold text-sm tracking-wider">{household?.inviteCode || 'LIFE-8842'}</span>
          </div>
          <button
            onClick={handleCopyInvite}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-all"
            title="Copy invitation link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Add Member Form Modal / Inline */}
      {isAddingMember && (
        <form
          onSubmit={handleAddMember}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invite Family or Roommate</h3>
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name (e.g. Sarah Chen)"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
          Household Members ({household?.members.length || 2})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {household?.members.map((member) => {
            const assignedCount = items.filter((i) => i.assignedTo === member.id).length;

            return (
              <div
                key={member.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{member.email}</p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {assignedCount} assigned responsibilit{assignedCount === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shared Household Items */}
      <section className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
          Shared Household Responsibilities
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-xs">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemForDetail(item)}
              className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏡</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Assigned to: <strong>{item.assignedToName || 'Alex Chen'}</strong>
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {item.date || 'Regular schedule'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
