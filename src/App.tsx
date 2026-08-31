import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ItemsProvider, useItems } from './context/ItemsContext';

import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { MobileNav } from './components/navigation/MobileNav';
import { Header } from './components/navigation/Header';
import { QuickCaptureModal } from './components/modals/QuickCaptureModal';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationDrawer } from './components/drawers/NotificationDrawer';
import { DashboardView } from './views/DashboardView';
import { ItemsView } from './views/ItemsView';
import { CalendarView } from './views/CalendarView';
import { BillsView } from './views/BillsView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { PurchasesView } from './views/PurchasesView';
import { DocumentsView } from './views/DocumentsView';
import { AssistantView } from './views/AssistantView';
import { HouseholdView } from './views/HouseholdView';
import { SettingsView } from './views/SettingsView';
import { BankingView } from './views/BankingView';
import { OwnerRevenueView } from './views/OwnerRevenueView';
import { LandingPage } from './views/LandingPage';
import { OnboardingView } from './views/OnboardingView';
import { LinkBankModal } from './components/modals/LinkBankModal';
import { DirectPayModal } from './components/modals/DirectPayModal';
import { SubscriptionModal } from './components/modals/SubscriptionModal';
import { RouteOptimizerModal } from './components/routes/RouteOptimizerModal';
import { AIBudgetAdvisorModal } from './components/budget/AIBudgetAdvisorModal';
import { AuthModal } from './views/AuthModal';

const AppContent: React.FC = () => {
  const {
    user,
    isOwner,
    isDemo,
    loading,
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
  } = useAuth();

  const { activeTab, isAIBudgetModalOpen, setIsAIBudgetModalOpen } = useItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading LifeOS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialMode={authModalMode}
        />
      </>
    );
  }

  if (user.onboardingCompleted === false) {
    return <OnboardingView onComplete={() => {}} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-col">
      {isDemo && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-300/40 dark:border-amber-500/30 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0 z-30">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-800 dark:text-amber-300 font-bold text-[10px] tracking-wide uppercase border border-amber-400/40">
              Live Demo (Read-Only)
            </span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-300 text-xs">
              Exploring sample data. Additions and modifications are disabled in live demo.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAuthModal('signup')}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Create Free Account
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DesktopSidebar />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28 md:pb-8">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'items' && <ItemsView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'bills' && <BillsView />}
            {activeTab === 'banking' && <BankingView />}
            {activeTab === 'subscriptions' && <SubscriptionsView />}
            {activeTab === 'purchases' && <PurchasesView />}
            {activeTab === 'documents' && <DocumentsView />}
            {activeTab === 'assistant' && <AssistantView />}
            {activeTab === 'household' && <HouseholdView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'owner-revenue' && isOwner && <OwnerRevenueView />}
          </main>
        </div>
      </div>

      <MobileNav />

      <QuickCaptureModal />
      <ItemDetailModal />
      <GlobalSearchModal />
      <NotificationDrawer />
      <LinkBankModal />
      <DirectPayModal />
      <SubscriptionModal />

      <RouteOptimizerModal isOpen={false} onClose={() => {}} />

      <AIBudgetAdvisorModal
        isOpen={isAIBudgetModalOpen}
        onClose={() => setIsAIBudgetModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <AppContent />
      </ItemsProvider>
    </AuthProvider>
  );
}