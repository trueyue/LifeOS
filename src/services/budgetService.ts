import { LifeItem, BankAccount, UserProfile, AIBudgetPlan } from '../types';
import { generateLocalAIBudgetPlan } from '../utils/budgetAnalyzer';

export async function requestAIBudgetAnalysis(
  items: LifeItem[],
  bankAccounts: BankAccount[],
  userProfile?: UserProfile | null,
  monthlyIncomeOverride?: number
): Promise<AIBudgetPlan> {
  try {
    const response = await fetch('/api/ai/budget-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        bankAccounts,
        userProfile,
        monthlyIncome: monthlyIncomeOverride,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.plan) {
        return data.plan;
      }
    }
  } catch (err) {
    console.warn('Backend AI budget call failed, using deterministic intelligence engine:', err);
  }

  // Robust deterministic fallback
  return generateLocalAIBudgetPlan(items, bankAccounts, monthlyIncomeOverride);
}
