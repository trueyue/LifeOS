export type LifeCategory =
  | 'appointment'
  | 'bill'
  | 'car'
  | 'home'
  | 'package'
  | 'subscription'
  | 'purchase'
  | 'warranty'
  | 'document'
  | 'travel'
  | 'school'
  | 'work'
  | 'personal'
  | 'other';

export type Priority = 'low' | 'medium' | 'high';

export type ReminderTiming = 'same_day' | '1_day' | '3_days' | '7_days' | '30_days' | 'none';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ItemAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  category: 'receipt' | 'insurance' | 'warranty' | 'contract' | 'ticket' | 'id' | 'other';
  dataUrl?: string;
  uploadedAt: string;
}

export interface LifeItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: LifeCategory;
  priority: Priority;
  date: string | null; // e.g. "2026-09-05" or descriptive text like "October 2026"
  time: string | null; // e.g. "14:30" or "2:30 PM"
  reminderDate: string | null;
  reminderTiming: ReminderTiming;
  amount: number | null;
  vendor: string | null;
  recurring: boolean;
  recurringFrequency: RecurringFrequency | null;
  autoPay?: boolean;
  warrantyLengthMonths: number | null;
  warrantyExpirationDate: string | null;
  tags: string[];
  completed: boolean;
  completedAt: string | null;
  assignedTo?: string | null; // member ID
  assignedToName?: string | null;
  location?: string | null; // Place or venue name (e.g., "Whole Foods Market", "Dr. Smith Clinic")
  locationAddress?: string | null; // Full street address (e.g., "399 4th St, San Francisco, CA")
  locationLat?: number | null;
  locationLng?: number | null;
  attachments: ItemAttachment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ParsedLifeInput {
  title: string;
  description: string;
  category: LifeCategory;
  priority: Priority;
  date: string | null;
  time: string | null;
  reminderDate: string | null;
  amount: number | null;
  vendor: string | null;
  location?: string | null;
  locationAddress?: string | null;
  recurring: boolean;
  recurringFrequency: RecurringFrequency | null;
  warrantyLengthMonths: number | null;
  tags: string[];
  confidence?: number;
  reasoning?: string;
  usedFallback?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  defaultReminder: ReminderTiming;
  aiPreferences: {
    autoSuggest: boolean;
    summaryFrequency: 'daily' | 'weekly';
    conciseSummary: boolean;
  };
  subscription?: UserSubscription;
  isOwner?: boolean;
  isDemo?: boolean;
  isPermanentPro?: boolean;
  isVip?: boolean;
  householdId?: string | null;
  householdName?: string | null;
  onboardingCompleted: boolean;
  selectedFocusAreas: string[];
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriberInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  date: string;
  periodStart: string;
  periodEnd: string;
  planName: string;
  paymentMethodMask: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  planId: 'pro_monthly_799' | 'pro_annual_7999';
  price: number;
  currency: string;
  billingInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isPermanentVip?: boolean;
  vipGrantedBy?: string;
  vipGrantedAt?: string;
  vipReason?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  invoices: SubscriberInvoice[];
}

export interface OwnerPayoutSettings {
  payoutMethod: 'stripe_connect' | 'bank_ach' | 'paypal' | 'wire';
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumberMask: string;
  paypalEmail: string;
  stripeAccountId?: string;
  payoutSchedule: 'instant' | 'daily' | 'weekly' | 'monthly';
  autoPayoutThreshold: number;
  isConfigured: boolean;
  lastPayoutDate?: string;
}

export interface SubscriberRecord {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  tier: SubscriptionTier;
  planName: string;
  amount: number;
  billingInterval: 'month' | 'year';
  status: 'active' | 'canceled' | 'trialing';
  joinedDate: string;
  nextRenewalDate: string;
  totalPaidToDate: number;
  paymentMethod: string;
}

export interface OwnerPayoutWithdrawal {
  id: string;
  amount: number;
  currency: string;
  payoutMethod: string;
  destinationMask: string;
  status: 'completed' | 'processing' | 'pending';
  referenceCode: string;
  createdAt: string;
}

export interface MonthlyRevenueMetric {
  month: string; // e.g. "August 2026", "July 2026"
  year: number;
  monthIndex: number;
  grossRevenue: number;
  netRevenue: number;
  platformFees: number;
  activeSubscribers: number;
  newSubscribers: number;
  payoutsIssued: number;
}

export interface PlatformRevenueStats {
  mrr: number; // Monthly Recurring Revenue ($7.99 * active pro)
  grossRevenue: number;
  netRevenue: number;
  platformFees: number;
  totalSubscribers: number;
  freeUsersCount: number;
  proSubscribersCount: number;
  conversionRate: number;
  availablePayoutBalance: number;
  pendingPayoutBalance: number;
  totalWithdrawn: number;
  payoutSettings: OwnerPayoutSettings;
  monthlyMetrics: MonthlyRevenueMetric[];
  subscribers: SubscriberRecord[];
  withdrawals: OwnerPayoutWithdrawal[];
}

export interface RouteWaypoint {
  itemId: string;
  title: string;
  category: LifeCategory;
  address: string;
  placeName?: string;
  time?: string | null;
  lat?: number;
  lng?: number;
  order: number;
  distanceFromPrev?: string;
  durationFromPrev?: string;
  estimatedArrival?: string;
}

export interface OptimizedRoutePlan {
  id: string;
  name: string;
  totalDistance: string;
  totalDuration: string;
  stopsCount: number;
  startLocation: string;
  endLocation: string;
  waypoints: RouteWaypoint[];
  googleMapsUrl: string;
  summary: string;
  savingsSummary?: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar: string;
  joinedAt: string;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  members: HouseholdMember[];
  inviteCode: string;
  createdAt: string;
}

export interface LifeNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: LifeCategory | 'reminder' | 'system';
  severity: 'urgent' | 'warning' | 'info' | 'success';
  itemId?: string | null;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  relatedItemIds?: string[];
}

export interface DailySummary {
  greeting: string;
  date?: string;
  summaryText?: string;
  worthKnowing: Array<{
    id: string;
    itemId?: string;
    title: string;
    description: string;
    urgency: 'urgent' | 'warning' | 'info';
    category: LifeCategory;
    dateLabel: string;
  }>;
  stats: {
    totalActive?: number;
    urgentCount: number;
    dueToday?: number;
    upcomingToday?: number;
    upcomingThisWeek?: number;
    monthlyBillsTotal: number;
    monthlySubsTotal: number;
    activeWarranties: number;
  };
}

export interface BankAccount {
  id: string;
  userId: string;
  institutionId: string;
  institutionName: string;
  institutionLogo?: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  accountName: string;
  accountNumberMask: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  status: 'connected' | 'syncing' | 'error';
  lastSyncedAt: string;
  color: string;
  isPrimary?: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  itemId?: string | null;
  payeeName: string;
  billerCategory?: LifeCategory;
  amount: number;
  currency: string;
  fundingSourceId: string;
  fundingSourceName: string;
  fundingSourceMask: string;
  fundingSourceType: 'bank_account' | 'credit_card' | 'apple_pay';
  status: 'completed' | 'processing' | 'scheduled' | 'failed';
  confirmationCode: string;
  paymentDate: string;
  deliveryMethod: 'instant_ach' | 'standard_ach' | 'scheduled';
  memo?: string;
  receiptAttachmentId?: string;
  createdAt: string;
}

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'items'
  | 'calendar'
  | 'bills'
  | 'banking'
  | 'subscriptions'
  | 'budgeting'
  | 'purchases'
  | 'documents'
  | 'assistant'
  | 'household'
  | 'settings'
  | 'pricing'
  | 'owner-revenue'
  | 'onboarding';

export interface CategoryBudget {
  category: string;
  categoryLabel: string;
  allocatedLimit: number;
  currentSpend: number;
  status: 'on_track' | 'warning' | 'over_budget';
  percentageUsed: number;
  advice: string;
}

export interface WasteOptimizationOpportunity {
  id: string;
  title: string;
  type: 'subscription_waste' | 'bill_negotiation' | 'duplicate_service' | 'fee_reduction' | 'energy_audit';
  potentialMonthlySavings: number;
  annualSavings: number;
  description: string;
  actionableStep: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface AIBudgetPlan {
  totalMonthlyIncome: number;
  totalFixedObligations: number;
  totalDiscretionarySpending: number;
  projectedMonthlySavings: number;
  budgetHealthScore: number;
  budgetHealthStatus: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  framework50_30_20: {
    needsPercent: number;
    needsAmount: number;
    wantsPercent: number;
    wantsAmount: number;
    savingsPercent: number;
    savingsAmount: number;
    analysis: string;
  };
  categoryBudgets: CategoryBudget[];
  opportunities: WasteOptimizationOpportunity[];
  cashflowRunwayDays: number;
  executiveSummary: string;
  keyActionSteps: string[];
  lastGeneratedAt: string;
}
