import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../services/storage';
import { ActiveTab, BankAccount, LifeItem, PaymentTransaction } from '../types';

const storageAny = storage as any;

const LIFETIME_VIP_EMAILS = [
  'tanner.regenbogen09@gmail.com',
  'ntaijo.fn@gmail.com',
];

const normalizeEmail = (value?: string | null) => (value ?? '').trim().toLowerCase();

const isLifetimeVipEmail = (email?: string | null) =>
  LIFETIME_VIP_EMAILS.includes(normalizeEmail(email));

const buildLifetimeVipSubscription = () => ({
  tier: 'pro',
  status: 'active',
  planId: 'pro_annual_7999',
  price: 0,
  currency: 'USD',
  billingInterval: 'year',
  currentPeriodStart: new Date().toISOString().split('T')[0],
  currentPeriodEnd: '2099-12-31',
  cancelAtPeriodEnd: false,
  isPermanentVip: true,
  vipGrantedBy: 'App Owner (ntaijo.fn@gmail.com)',
  vipGrantedAt: new Date().toISOString(),
  vipReason: 'Permanent lifetime VIP access',
  paymentMethodBrand: 'Lifetime VIP',
  paymentMethodLast4: 'FREE',
  invoices: [],
});

const safePlatformRevenueStats = () => ({
  mrr: 0,
  grossRevenue: 0,
  netRevenue: 0,
  platformFees: 0,
  totalSubscribers: 2,
  freeUsersCount: 0,
  proSubscribersCount: 2,
  conversionRate: 100,
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
      id: 'vip-tanner',
      userId: 'user_tanner_regenbogen09_gmail_com',
      customerName: 'Tanner Regenbogen',
      customerEmail: 'tanner.regenbogen09@gmail.com',
      tier: 'pro',
      planName: 'LifeOS Pro (Lifetime VIP)',
      amount: 0,
      billingInterval: 'year',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      nextRenewalDate: '2099-12-31',
      totalPaidToDate: 0,
      paymentMethod: 'Lifetime VIP Pass ($0.00 / Free)',
    },
    {
      id: 'vip-michael',
      userId: 'user_ntaijo_fn_gmail_com',
      customerName: 'Michael',
      customerEmail: 'ntaijo.fn@gmail.com',
      tier: 'pro',
      planName: 'LifeOS Pro (Lifetime VIP)',
      amount: 0,
      billingInterval: 'year',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      nextRenewalDate: '2099-12-31',
      totalPaidToDate: 0,
      paymentMethod: 'Lifetime VIP Pass ($0.00 / Free)',
    },
  ],
  withdrawals: [],
});

const buildDefaultDailySummary = (itemsList: LifeItem[] = []) => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const urgentCount = itemsList.filter((item) => !item.completed && item.priority === 'high').length;
  const worthKnowing = itemsList.slice(0, 3).map((item, index) => ({
    id: `summary-${item.id || index}`,
    itemId: item.id,
    title: item.title || 'Life item',
    description: item.description || 'No description provided.',
    urgency: item.priority === 'high' ? 'urgent' : item.priority === 'medium' ? 'warning' : 'info',
    category: item.category,
    dateLabel: item.date || 'Soon',
  }));

  return {
    greeting,
    summaryText: 'Your life is organized and ready for today.',
    worthKnowing,
    stats: {
      urgentCount,
      dueToday: 0,
      upcomingToday: 0,
      upcomingThisWeek: 0,
      monthlyBillsTotal: 0,
      monthlySubsTotal: 0,
      activeWarranties: 0,
    },
  };
};

const ItemsContext = createContext<any>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState<LifeItem[]>(() => (user ? storage.getItems(user.uid) : []));
  const [notifications, setNotifications] = useState<any[]>(() => (user ? storage.getNotifications(user.uid) : []));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLinkBankModalOpen, setIsLinkBankModalOpen] = useState(false);
  const [isDirectPayModalOpen, setIsDirectPayModalOpen] = useState(false);
  const [isRouteOptimizerOpen, setIsRouteOptimizerOpen] = useState(false);
  const [isAIBudgetModalOpen, setIsAIBudgetModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureTrigger, setUpgradeFeatureTrigger] = useState<string | null>(null);
  const [directPayTargetItem, setDirectPayTargetItem] = useState<any | null>(null);
  const [directPayCustomPayee, setDirectPayCustomPayee] = useState<any | null>(null);
  const [quickCapturePrefill, setQuickCapturePrefill] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<any>(() => {
    if (!user) {
      return {
        tier: 'free',
        status: 'none',
        planId: null,
        price: 0,
        currency: 'USD',
        billingInterval: 'month',
        currentPeriodStart: new Date().toISOString().split('T')[0],
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        cancelAtPeriodEnd: false,
        invoices: [],
      };
    }

    return isLifetimeVipEmail(user.email)
      ? buildLifetimeVipSubscription()
      : storageAny.getSubscription?.(user.uid) || {
          tier: 'free',
          status: 'none',
          planId: null,
          price: 0,
          currency: 'USD',
          billingInterval: 'month',
          currentPeriodStart: new Date().toISOString().split('T')[0],
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          cancelAtPeriodEnd: false,
          invoices: [],
        };
  });

  const [platformRevenueStats, setPlatformRevenueStats] = useState<any>(() =>
    storageAny.getPlatformRevenueStats?.() || safePlatformRevenueStats()
  );

  const refreshData = () => {
    if (!user) {
      setItems([]);
      setNotifications([]);
      setBankAccounts([]);
      setPaymentTransactions([]);
      setSubscription({
        tier: 'free',
        status: 'none',
        planId: null,
        price: 0,
        currency: 'USD',
        billingInterval: 'month',
        currentPeriodStart: new Date().toISOString().split('T')[0],
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        cancelAtPeriodEnd: false,
        invoices: [],
      });
      setPlatformRevenueStats(safePlatformRevenueStats());
      return;
    }

    const nextSub = isLifetimeVipEmail(user.email)
      ? buildLifetimeVipSubscription()
      : storageAny.getSubscription?.(user.uid) || {
          tier: 'free',
          status: 'none',
          planId: null,
          price: 0,
          currency: 'USD',
          billingInterval: 'month',
          currentPeriodStart: new Date().toISOString().split('T')[0],
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          cancelAtPeriodEnd: false,
          invoices: [],
        };

    setSubscription(nextSub);
    setItems(storageAny.getItems?.(user.uid) || []);
    setNotifications(storageAny.getNotifications?.(user.uid) || []);
    setBankAccounts([]);
    setPaymentTransactions([]);
    setPlatformRevenueStats(storageAny.getPlatformRevenueStats?.() || safePlatformRevenueStats());
  };

  useEffect(() => {
    refreshData();
  }, [user?.uid, user?.email]);

  const isPro = Boolean(subscription?.tier === 'pro' && subscription?.status === 'active');
  const tier = isPro ? 'pro' : 'free';
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const dailySummary = useMemo(() => buildDefaultDailySummary(items), [items]);

  const addItem = (newItem: any) => {
    setItems((prev) => {
      const next = [...prev, newItem];
      if (user) storageAny.saveItems?.(user.uid, next);
      return next;
    });
  };

  const updateItem = (id: string, updates: Partial<LifeItem>) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      if (user) storageAny.saveItems?.(user.uid, next);
      return next;
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (user) storageAny.saveItems?.(user.uid, next);
      return next;
    });
  };

  const toggleComplete = (id: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null } : item
      );
      if (user) storageAny.saveItems?.(user.uid, next);
      return next;
    });
  };

  const addItemFromNaturalLanguage = async (_input: string) => {
    return null;
  };

  const openQuickCaptureWithPrompt = (prompt: string) => {
    setQuickCapturePrefill(prompt);
    setIsQuickCaptureOpen(true);
  };

  const openAIBudgetAdvisor = () => setIsAIBudgetModalOpen(true);

  const openSubscriptionUpgrade = (featureName?: string) => {
    setUpgradeFeatureTrigger(featureName || null);
    setIsUpgradeModalOpen(true);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const processDirectPayment = async (payload: any) => {
    const transaction: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      userId: user?.uid || 'guest',
      itemId: payload.itemId ?? null,
      payeeName: payload.payeeName || 'Service Provider',
      billerCategory: payload.billerCategory || 'bill',
      amount: Number(payload.amount || 0),
      currency: payload.currency || 'USD',
      fundingSourceId: payload.fundingSourceId || '',
      fundingSourceName: payload.fundingSourceName || 'Bank Account',
      fundingSourceMask: payload.fundingSourceMask || '••••',
      fundingSourceType: payload.fundingSourceType || 'bank_account',
      status: payload.status || 'completed',
      confirmationCode: `CONF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      deliveryMethod: payload.deliveryMethod || 'instant_ach',
      memo: payload.memo || '',
      createdAt: new Date().toISOString(),
    };

    setPaymentTransactions((prev) => [transaction, ...prev]);
    return transaction;
  };

  const linkBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => {
      const next = [...prev.filter((item) => item.id !== account.id), account];
      if (!account.isPrimary && next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const unlinkBankAccount = (accountId: string) => {
    setBankAccounts((prev) => prev.filter((account) => account.id !== accountId));
  };

  const refreshBankBalance = () => setBankAccounts((prev) => [...prev]);

  const cancelItemSubscription = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const subscribeToPro = (
    planId: 'pro_monthly_799' | 'pro_annual_7999' = 'pro_monthly_799',
    paymentMethod: { brand?: string; last4?: string } = { brand: 'Card', last4: '••••' }
  ) => {
    if (!user) return;

    const amount = planId === 'pro_annual_7999' ? 79.99 : 7.99;

    const next = storage.subscribeToPro?.(user.uid, planId, paymentMethod) || {
      tier: 'pro',
      status: 'active',
      planId,
      price: amount,
      currency: 'USD',
      billingInterval: planId === 'pro_annual_7999' ? 'year' : 'month',
      currentPeriodStart: new Date().toISOString().split('T')[0],
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      cancelAtPeriodEnd: false,
      invoices: [],
    };

    setSubscription(next);
  };

  const cancelSubscription = () => setSubscription((prev: any) => ({ ...prev, status: 'canceled', cancelAtPeriodEnd: true }));
  const reactivateSubscription = () => setSubscription((prev: any) => ({ ...prev, status: 'active', cancelAtPeriodEnd: false }));

  const resetToSampleData = () => {
    if (!user) return;
    const sampleItems = storage.getItems(user.uid) || [];
    setItems(sampleItems);
  };

  const value = useMemo(
    () => ({
      items,
      notifications,
      subscription,
      isPro,
      tier,
      platformRevenueStats,
      activeTab,
      setActiveTab,
      selectedCategoryFilter,
      setSelectedCategoryFilter,
      bankAccounts,
      paymentTransactions,
      selectedItemForDetail,
      setSelectedItemForDetail,
      isQuickCaptureOpen,
      setIsQuickCaptureOpen,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isLinkBankModalOpen,
      setIsLinkBankModalOpen,
      isDirectPayModalOpen,
      setIsDirectPayModalOpen,
      directPayTargetItem,
      setDirectPayTargetItem,
      directPayCustomPayee,
      setDirectPayCustomPayee,
      isRouteOptimizerOpen,
      setIsRouteOptimizerOpen,
      isAIBudgetModalOpen,
      setIsAIBudgetModalOpen,
      isUpgradeModalOpen,
      setIsUpgradeModalOpen,
      upgradeFeatureTrigger,
      setUpgradeFeatureTrigger,
      quickCapturePrefill,
      setQuickCapturePrefill,
      selectedBankAccountId,
      setSelectedBankAccountId,
      unreadNotificationCount,
      dailySummary,
      refreshData,
      addItem,
      updateItem,
      deleteItem,
      toggleComplete,
      addItemFromNaturalLanguage,
      openQuickCaptureWithPrompt,
      openAIBudgetAdvisor,
      openSubscriptionUpgrade,
      markNotificationRead,
      markAllNotificationsRead,
      processDirectPayment,
      linkBankAccount,
      unlinkBankAccount,
      refreshBankBalance,
      cancelItemSubscription,
      subscribeToPro,
      cancelSubscription,
      reactivateSubscription,
      openDirectPay: (item: any, payee?: any) => {
        setDirectPayTargetItem(item || null);
        setDirectPayCustomPayee(payee || null);
        setIsDirectPayModalOpen(true);
      },
      openAIBudgetAdvisorModal: () => setIsAIBudgetModalOpen(true),
      resetToSampleData,
      openSubscriptionUpgradeModal: (featureName?: string) => openSubscriptionUpgrade(featureName),
    }),
    [
      items,
      notifications,
      subscription,
      isPro,
      tier,
      platformRevenueStats,
      activeTab,
      selectedCategoryFilter,
      bankAccounts,
      paymentTransactions,
      selectedItemForDetail,
      isQuickCaptureOpen,
      isGlobalSearchOpen,
      isNotificationsOpen,
      isLinkBankModalOpen,
      isDirectPayModalOpen,
      directPayTargetItem,
      directPayCustomPayee,
      isRouteOptimizerOpen,
      isAIBudgetModalOpen,
      isUpgradeModalOpen,
      upgradeFeatureTrigger,
      quickCapturePrefill,
      selectedBankAccountId,
      unreadNotificationCount,
      dailySummary,
    ]
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};