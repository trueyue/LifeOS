import {
  BankAccount,
  ChatMessage,
  Household,
  HouseholdMember,
  LifeItem,
  LifeNotification,
  OwnerPayoutSettings,
  OwnerPayoutWithdrawal,
  ParsedLifeInput,
  PaymentTransaction,
  PlatformRevenueStats,
  SubscriberInvoice,
  SubscriberRecord,
  SubscriptionTier,
  UserProfile,
  UserSubscription,
} from '../types';
import { isPermanentProUser } from '../utils/ownerAuth';

const STORAGE_KEY_PREFIX = 'lifeos_v1_';
const PLATFORM_REVENUE_KEY = 'lifeos_v1_platform_revenue_stats';

const LIFETIME_VIP_EMAILS = [
  'tanner.regenbogen09@gmail.com',
  'ntaijo.fn@gmail.com',
];

function normalizeEmail(email?: string | null): string {
  return (email ?? '').trim().toLowerCase();
}

function hasLifetimeProAccess(userId?: string | null, email?: string | null): boolean {
  const normalizedUserId = (userId ?? '').trim().toLowerCase();
  const normalizedEmail = normalizeEmail(email);

  return (
    LIFETIME_VIP_EMAILS.includes(normalizedEmail) ||
    normalizedUserId.includes('tanner_regenbogen09') ||
    normalizedUserId.includes('ntaijo.fn@gmail.com')
  );
}

const zeroPlatformRevenueStats = (): PlatformRevenueStats => ({
  mrr: 0,
  grossRevenue: 0,
  netRevenue: 0,
  platformFees: 0,
  totalSubscribers: 0,
  freeUsersCount: 0,
  proSubscribersCount: 0,
  conversionRate: 0,
  availablePayoutBalance: 0,
  pendingPayoutBalance: 0,
  totalWithdrawn: 0,
  payoutSettings: {
    payoutMethod: 'stripe_connect',
    accountHolderName: 'Alex Chen (App Owner)',
    bankName: 'JPMorgan Chase Bank, N.A.',
    routingNumber: '021000021',
    accountNumberMask: '•••• 8820',
    paypalEmail: 'ntaijo.fn@gmail.com',
    stripeAccountId: 'acct_1N4820xLifeOSOwner',
    payoutSchedule: 'weekly',
    autoPayoutThreshold: 100,
    isConfigured: true,
    lastPayoutDate: undefined,
  },
  monthlyMetrics: [],
  subscribers: [
    {
      id: 'sub-rec-vip-tanner',
      userId: 'user_tanner_regenbogen09_gmail_com',
      customerName: 'Tanner Regenbogen',
      customerEmail: 'tanner.regenbogen09@gmail.com',
      tier: 'pro',
      planName: 'LifeOS Pro (Lifetime VIP Complimentary)',
      amount: 0,
      billingInterval: 'year',
      status: 'active',
      joinedDate: '2026-08-29',
      nextRenewalDate: '2099-12-31',
      totalPaidToDate: 0,
      paymentMethod: 'Lifetime VIP Pass ($0.00 / Free)',
    },
    {
      id: 'sub-rec-vip-michael',
      userId: 'user_ntaijo_fn_gmail_com',
      customerName: 'Michael',
      customerEmail: 'ntaijo.fn@gmail.com',
      tier: 'pro',
      planName: 'LifeOS Pro (Lifetime VIP Complimentary)',
      amount: 0,
      billingInterval: 'year',
      status: 'active',
      joinedDate: '2026-08-29',
      nextRenewalDate: '2099-12-31',
      totalPaidToDate: 0,
      paymentMethod: 'Lifetime VIP Pass ($0.00 / Free)',
    },
  ],
  withdrawals: [],
});

export const INITIAL_DEMO_USER: UserProfile = {
  uid: 'demo-user-1',
  email: 'alex.chen@example.com',
  phoneNumber: '+1 (555) 234-8890',
  displayName: 'Alex',
  photoURL:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  theme: 'light',
  notificationsEnabled: true,
  defaultReminder: '1_day',
  aiPreferences: {
    autoSuggest: true,
    summaryFrequency: 'daily',
    conciseSummary: true,
  },
  isOwner: false,
  isDemo: true,
  householdId: 'house-1',
  householdName: 'Chen Household',
  onboardingCompleted: true,
  selectedFocusAreas: ['bills', 'appointments', 'car', 'subscriptions', 'warranties'],
  createdAt: new Date().toISOString(),
};

export const INITIAL_HOUSEHOLD: Household = {
  id: 'house-1',
  name: 'Chen Household',
  ownerId: 'demo-user-1',
  inviteCode: 'LIFE-8842',
  createdAt: new Date().toISOString(),
  members: [
    {
      id: 'demo-user-1',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'owner',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: new Date().toISOString(),
    },
    {
      id: 'demo-user-2',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'member',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      joinedAt: new Date().toISOString(),
    },
  ],
};

function getIsoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayString = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayString}`;
}

export function calculateNextRecurringDate(
  currentDateStr: string | null,
  frequency: string | null
): string {
  const base = currentDateStr ? new Date(currentDateStr) : new Date();
  const d = Number.isNaN(base.getTime()) ? new Date() : new Date(base);

  if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (frequency === 'quarterly') {
    d.setMonth(d.getMonth() + 3);
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class LifeOSStorageService {
  private getUserKey(userId: string, suffix: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}_${suffix}`;
  }

  getUserProfile(userId: string): UserProfile {
    const raw = localStorage.getItem(this.getUserKey(userId, 'profile'));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (isPermanentProUser(parsed.email) || hasLifetimeProAccess(userId, parsed.email))) {
          parsed.isPermanentPro = true;
          parsed.isVip = true;
        }
        return parsed;
      } catch (e) {
        console.warn('Failed to parse profile', e);
      }
    }

    if (userId === INITIAL_DEMO_USER.uid) {
      this.saveUserProfile(INITIAL_DEMO_USER);
      return INITIAL_DEMO_USER;
    }

    if (hasLifetimeProAccess(userId)) {
      const lifetimeProfile: UserProfile = {
        uid: userId,
        email: 'ntaijo.fn@gmail.com',
        displayName: 'Michael',
        theme: 'light',
        notificationsEnabled: true,
        defaultReminder: '1_day',
        aiPreferences: {
          autoSuggest: true,
          summaryFrequency: 'daily',
          conciseSummary: true,
        },
        isOwner: false,
        isPermanentPro: true,
        isVip: true,
        onboardingCompleted: true,
        selectedFocusAreas: ['bills', 'appointments', 'subscriptions', 'warranties', 'car'],
        createdAt: new Date().toISOString(),
      };
      this.saveUserProfile(lifetimeProfile);
      return lifetimeProfile;
    }

    if (userId.toLowerCase().includes('tanner_regenbogen09')) {
      const tannerProfile: UserProfile = {
        uid: userId,
        email: 'tanner.regenbogen09@gmail.com',
        displayName: 'Tanner Regenbogen',
        theme: 'light',
        notificationsEnabled: true,
        defaultReminder: '1_day',
        aiPreferences: {
          autoSuggest: true,
          summaryFrequency: 'daily',
          conciseSummary: true,
        },
        isOwner: false,
        isPermanentPro: true,
        isVip: true,
        onboardingCompleted: true,
        selectedFocusAreas: ['bills', 'appointments', 'subscriptions', 'warranties', 'car'],
        createdAt: new Date().toISOString(),
      };
      this.saveUserProfile(tannerProfile);
      return tannerProfile;
    }

    const defaultProfile: UserProfile = {
      uid: userId,
      email: `${userId}@lifeos.app`,
      displayName: 'Alex',
      theme: 'light',
      notificationsEnabled: true,
      defaultReminder: '1_day',
      aiPreferences: {
        autoSuggest: true,
        summaryFrequency: 'daily',
        conciseSummary: true,
      },
      onboardingCompleted: false,
      selectedFocusAreas: ['bills', 'appointments', 'subscriptions'],
      createdAt: new Date().toISOString(),
    };

    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.getUserKey(profile.uid, 'profile'), JSON.stringify(profile));
  }

  getItems(userId: string): LifeItem[] {
    const raw = localStorage.getItem(this.getUserKey(userId, 'items'));
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse items for user', userId, e);
      return [];
    }
  }

  saveItems(userId: string, items: LifeItem[]): void {
    localStorage.setItem(this.getUserKey(userId, 'items'), JSON.stringify(items));
  }

  getHousehold(userId: string): Household | null {
    const raw = localStorage.getItem(this.getUserKey(userId, 'household'));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          return parsed as Household;
        }
      } catch (e) {
        console.warn('Failed to parse household for user', userId, e);
      }
    }

    if (userId === INITIAL_DEMO_USER.uid) {
      this.saveHousehold(userId, INITIAL_HOUSEHOLD);
      return INITIAL_HOUSEHOLD;
    }

    const profile = this.getUserProfile(userId);
    const defaultHousehold: Household = {
      id: `house-${userId}`,
      name: `${profile.displayName || 'Your'} Household`,
      ownerId: userId,
      inviteCode: 'LIFE-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      members: [
        {
          id: userId,
          name: profile.displayName || 'User',
          email: profile.email || `${userId}@lifeos.app`,
          role: 'owner',
          avatar:
            profile.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    this.saveHousehold(userId, defaultHousehold);
    return defaultHousehold;
  }

  saveHousehold(userId: string, household: Household): void {
    localStorage.setItem(this.getUserKey(userId, 'household'), JSON.stringify(household));
  }

  addHouseholdMember(userId: string, name: string, email: string): Household {
    const household = this.getHousehold(userId) || {
      id: `house-${userId}`,
      name: 'Your Household',
      ownerId: userId,
      inviteCode: 'LIFE-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      members: [],
    };

    const normalizedEmail = normalizeEmail(email);
    const existing = household.members.some((member) => normalizeEmail(member.email) === normalizedEmail);

    if (existing) {
      return household;
    }

    const nextHousehold: Household = {
      ...household,
      members: [
        ...household.members,
        {
          id: `member-${Date.now()}`,
          name: name.trim() || 'New Member',
          email: normalizedEmail,
          role: 'member',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    this.saveHousehold(userId, nextHousehold);
    return nextHousehold;
  }

  getChatHistory(userId: string): ChatMessage[] {
    const raw = localStorage.getItem(this.getUserKey(userId, 'chat'));
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse chat history for user', userId, e);
      return [];
    }
  }

  saveChatHistory(userId: string, history: ChatMessage[]): void {
    localStorage.setItem(this.getUserKey(userId, 'chat'), JSON.stringify(history));
  }

  // keep your other storage methods as-is, but replace any default revenue logic with the below

  getPlatformRevenueStats(): PlatformRevenueStats {
    const raw = localStorage.getItem(PLATFORM_REVENUE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          ...zeroPlatformRevenueStats(),
          ...parsed,
          subscribers: Array.isArray(parsed.subscribers) && parsed.subscribers.length
            ? parsed.subscribers.filter((s: SubscriberRecord) =>
                LIFETIME_VIP_EMAILS.includes(normalizeEmail(s.customerEmail))
              ).length
              ? parsed.subscribers.filter((s: SubscriberRecord) =>
                  LIFETIME_VIP_EMAILS.includes(normalizeEmail(s.customerEmail))
                )
              : zeroPlatformRevenueStats().subscribers
            : zeroPlatformRevenueStats().subscribers,
          withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
          monthlyMetrics: Array.isArray(parsed.monthlyMetrics) ? parsed.monthlyMetrics : [],
          payoutSettings: {
            ...(zeroPlatformRevenueStats().payoutSettings),
            ...(parsed.payoutSettings || {}),
          },
        };
      } catch (e) {
        console.warn('Failed to parse platform revenue stats', e);
      }
    }

    const initial = zeroPlatformRevenueStats();
    this.savePlatformRevenueStats(initial);
    return initial;
  }

  savePlatformRevenueStats(stats: PlatformRevenueStats): void {
    localStorage.setItem(PLATFORM_REVENUE_KEY, JSON.stringify(stats));
  }

  recordSubscriberRevenue(data: {
    userId: string;
    customerName: string;
    customerEmail: string;
    tier: SubscriptionTier;
    planName: string;
    amount: number;
    billingInterval: 'month' | 'year';
    paymentMethod: string;
  }): void {
    const stats = this.getPlatformRevenueStats();
    const subscribers = Array.isArray(stats.subscribers) ? [...stats.subscribers] : [];

    const normalizedEmail = normalizeEmail(data.customerEmail);
    const existingIndex = subscribers.findIndex(
      (s) => normalizeEmail(s.customerEmail) === normalizedEmail
    );

    const nextRecord: SubscriberRecord = {
      id: `sub-rec-${Date.now()}`,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      tier: data.tier,
      planName: data.planName,
      amount: Number(data.amount || 0),
      billingInterval: data.billingInterval,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      nextRenewalDate: getIsoDateOffset(data.billingInterval === 'year' ? 365 : 30),
      totalPaidToDate: Number(data.amount || 0),
      paymentMethod: data.paymentMethod,
    };

    let nextSubscribers = subscribers;
    if (existingIndex >= 0) {
      nextSubscribers[existingIndex] = {
        ...nextSubscribers[existingIndex],
        ...nextRecord,
        amount: Number(nextSubscribers[existingIndex].amount || 0) + Number(data.amount || 0),
        totalPaidToDate:
          Number(nextSubscribers[existingIndex].totalPaidToDate || 0) + Number(data.amount || 0),
      };
    } else {
      nextSubscribers = [nextRecord, ...subscribers];
    }

    const paidSubscribers = nextSubscribers.filter(
      (s) => s.tier === 'pro' && Number(s.amount || 0) >= 0
    );

    const gross = paidSubscribers.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const fees = paidSubscribers.reduce((sum, s) => sum + (Number(s.amount || 0) * 0.029 + 0.3), 0);
    const net = gross - fees;

    const nextStats: PlatformRevenueStats = {
      ...stats,
      subscribers: nextSubscribers.filter((s) =>
        LIFETIME_VIP_EMAILS.includes(normalizeEmail(s.customerEmail)) ||
        normalizeEmail(s.customerEmail) !== normalizeEmail(data.customerEmail) ||
        Number(s.amount || 0) > 0
      ),
      totalSubscribers: paidSubscribers.length,
      proSubscribersCount: paidSubscribers.length,
      freeUsersCount: 0,
      mrr: +(paidSubscribers.reduce((sum, s) => {
        const monthValue = s.billingInterval === 'year'
          ? Number(s.amount || 0) / 12
          : Number(s.amount || 0);
        return sum + monthValue;
      }, 0)).toFixed(2),
      grossRevenue: +gross.toFixed(2),
      platformFees: +fees.toFixed(2),
      netRevenue: +net.toFixed(2),
      availablePayoutBalance: +net.toFixed(2),
      pendingPayoutBalance: 0,
      conversionRate: paidSubscribers.length > 0 ? 100 : 0,
      monthlyMetrics: [
        {
          month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          year: new Date().getFullYear(),
          monthIndex: new Date().getMonth(),
          grossRevenue: +gross.toFixed(2),
          netRevenue: +net.toFixed(2),
          platformFees: +fees.toFixed(2),
          activeSubscribers: paidSubscribers.length,
          newSubscribers: 1,
          payoutsIssued: +net.toFixed(2),
        },
      ],
    };

    this.savePlatformRevenueStats(nextStats);
  }

  requestOwnerPayout(amount: number): OwnerPayoutWithdrawal {
    const stats = this.getPlatformRevenueStats();

    if (amount <= 0 || amount > stats.availablePayoutBalance) {
      throw new Error(
        `Invalid payout amount. Available balance is $${stats.availablePayoutBalance.toFixed(2)}`
      );
    }

    const refCode = `PAYOUT-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const payout: OwnerPayoutWithdrawal = {
      id: `wdr-${Date.now()}`,
      amount: +amount.toFixed(2),
      currency: 'USD',
      payoutMethod:
        stats.payoutSettings.payoutMethod === 'paypal'
          ? 'PayPal Payout'
          : 'ACH Direct Deposit (Stripe)',
      destinationMask:
        stats.payoutSettings.payoutMethod === 'paypal'
          ? `PayPal (${stats.payoutSettings.paypalEmail || 'ntaijo.fn@gmail.com'})`
          : `${stats.payoutSettings.bankName || 'Bank Account'} (${stats.payoutSettings.accountNumberMask || '•••• 8820'})`,
      status: 'completed',
      referenceCode: refCode,
      createdAt: new Date().toISOString().split('T')[0],
    };

    stats.availablePayoutBalance = +(stats.availablePayoutBalance - amount).toFixed(2);
    stats.totalWithdrawn = +(stats.totalWithdrawn + amount).toFixed(2);
    stats.payoutSettings.lastPayoutDate = new Date().toISOString().split('T')[0];
    stats.withdrawals.unshift(payout);

    this.savePlatformRevenueStats(stats);
    return payout;
  }

  subscribeToPro(
    userId: string,
    planId: 'pro_monthly_799' | 'pro_annual_7999' = 'pro_monthly_799',
    paymentMethod: { brand?: string; last4?: string } = { brand: 'Card', last4: '••••' }
  ): UserSubscription {
    const isAnnual = planId === 'pro_annual_7999';
    const price = isAnnual ? 79.99 : 7.99;
    const interval: 'month' | 'year' = isAnnual ? 'year' : 'month';

    const userProfile = this.getUserProfile(userId);
    const existing = this.getSubscription(userId);

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newInvoice: SubscriberInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      amount: price,
      currency: 'USD',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: getIsoDateOffset(isAnnual ? 365 : 30),
      planName: `LifeOS Pro All-Access (${isAnnual ? '$79.99/year' : '$7.99/month'})`,
      paymentMethodMask: `${paymentMethod.brand || 'Card'} •••• ${paymentMethod.last4 || '••••'}`,
    };

    const newSubscription: UserSubscription = {
      tier: 'pro',
      status: 'active',
      planId,
      price,
      currency: 'USD',
      billingInterval: interval,
      currentPeriodStart: new Date().toISOString().split('T')[0],
      currentPeriodEnd: getIsoDateOffset(isAnnual ? 365 : 30),
      cancelAtPeriodEnd: false,
      paymentMethodBrand: paymentMethod.brand || 'Card',
      paymentMethodLast4: paymentMethod.last4 || '••••',
      stripeCustomerId: `cus_${Date.now().toString(36)}`,
      stripeSubscriptionId: `sub_${Date.now().toString(36)}`,
      invoices: [newInvoice, ...(existing.invoices || [])],
    };

    this.saveSubscription(userId, newSubscription);

    this.recordSubscriberRevenue({
      userId,
      customerName: userProfile.displayName || 'Subscriber',
      customerEmail: userProfile.email || `${userId}@user.lifeos`,
      tier: 'pro',
      planName: isAnnual ? 'Pro All-Access (Annual)' : 'Pro All-Access (Monthly)',
      amount: price,
      billingInterval: interval,
      paymentMethod: `${paymentMethod.brand || 'Card'} •••• ${paymentMethod.last4 || '••••'}`,
    });

    this.addNotification(userId, {
      title: '🌟 Upgraded to LifeOS Pro All-Access!',
      message: `Your account now has unlimited AI parsing, banking sync, and household sharing unlocked. Reference: ${invoiceNumber}`,
      type: 'system',
      severity: 'success',
    });

    return newSubscription;
  }

  getSubscription(userId: string): UserSubscription {
    const profile = this.getUserProfile(userId);
    const userEmail = profile?.email;
    const isVip =
      isPermanentProUser(userEmail) ||
      hasLifetimeProAccess(userId, userEmail) ||
      Boolean(userId && userId.toLowerCase().includes('tanner_regenbogen09'));

    if (isVip) {
      const vipSub: UserSubscription = {
        tier: 'pro',
        status: 'active',
        planId: 'pro_annual_7999',
        price: 0.0,
        currency: 'USD',
        billingInterval: 'year',
        currentPeriodStart: '2026-08-29',
        currentPeriodEnd: '2099-12-31',
        cancelAtPeriodEnd: false,
        isPermanentVip: true,
        vipGrantedBy: 'App Owner (ntaijo.fn@gmail.com)',
        vipGrantedAt: '2026-08-29T18:12:00Z',
        vipReason: 'Permanent Free Premium Access Grant',
        paymentMethodBrand: 'Lifetime VIP Pass',
        paymentMethodLast4: 'FREE',
        invoices: [
          {
            id: 'inv-vip-tanner-lifetime',
            invoiceNumber: 'INV-VIP-LIFETIME',
            amount: 0.0,
            currency: 'USD',
            status: 'paid',
            date: '2026-08-29',
            periodStart: '2026-08-29',
            periodEnd: '2099-12-31',
            planName: 'LifeOS Pro • Permanent VIP Pass ($0.00 / Free Lifetime)',
            paymentMethodMask: 'VIP Complimentary Pass',
          },
        ],
      };
      this.saveSubscription(userId, vipSub);
      return vipSub;
    }

    const raw = localStorage.getItem(this.getUserKey(userId, 'subscription'));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tier) return parsed;
      } catch (e) {
        console.warn('Failed to parse subscription', e);
      }
    }

    const freeSub: UserSubscription = {
      tier: 'free',
      status: 'none',
      planId: 'pro_monthly_799',
      price: 0,
      currency: 'USD',
      billingInterval: 'month',
      currentPeriodStart: new Date().toISOString().split('T')[0],
      currentPeriodEnd: getIsoDateOffset(30),
      cancelAtPeriodEnd: false,
      invoices: [],
    };

    this.saveSubscription(userId, freeSub);
    return freeSub;
  }

  getNotifications(userId: string): LifeNotification[] {
    const raw = localStorage.getItem(this.getUserKey(userId, 'notifications'));
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse notifications', e);
      return [];
    }
  }

  addNotification(userId: string, notification: Record<string, any>): LifeNotification {
    const notifications = this.getNotifications(userId);
    const nextNotification: LifeNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: notification?.userId ?? userId,
      createdAt: new Date().toISOString(),
      title: notification?.title || 'New notification',
      message: notification?.message || '',
      type: notification?.type || 'system',
      severity: notification?.severity || 'info',
      read: notification?.read ?? false,
      ...notification,
    };

    const updated = [nextNotification, ...notifications].slice(0, 50);
    localStorage.setItem(this.getUserKey(userId, 'notifications'), JSON.stringify(updated));
    return nextNotification;
  }

  saveSubscription(userId: string, sub: UserSubscription): void {
    localStorage.setItem(this.getUserKey(userId, 'subscription'), JSON.stringify(sub));
  }

  // keep your other methods as they are
}

export const storage = new LifeOSStorageService();