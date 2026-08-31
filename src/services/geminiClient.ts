import { LifeItem, ParsedLifeInput, UserProfile } from '../types';
import { parseLifeInputLocal } from '../utils/localParser';

export async function parseLifeInputWithAI(input: string): Promise<ParsedLifeInput> {
  try {
    const res = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        currentDate: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.warn('AI Server responded with error, using local parser');
      return parseLifeInputLocal(input);
    }

    const data = await res.json();
    if (data.fallback || !data.parsed) {
      const localParsed = parseLifeInputLocal(input);
      return {
        ...localParsed,
        usedFallback: true,
      };
    }

    return {
      title: data.parsed.title,
      description: data.parsed.description || input,
      category: data.parsed.category || 'other',
      priority: data.parsed.priority || 'medium',
      date: data.parsed.date || null,
      time: data.parsed.time || null,
      reminderDate: data.parsed.reminderDate || null,
      amount: typeof data.parsed.amount === 'number' ? data.parsed.amount : null,
      vendor: data.parsed.vendor || null,
      location: data.parsed.location || null,
      locationAddress: data.parsed.locationAddress || null,
      recurring: Boolean(data.parsed.recurring),
      recurringFrequency: data.parsed.recurringFrequency || null,
      warrantyLengthMonths: typeof data.parsed.warrantyLengthMonths === 'number' ? data.parsed.warrantyLengthMonths : null,
      tags: Array.isArray(data.parsed.tags) ? data.parsed.tags : [],
      reasoning: data.parsed.reasoning,
      usedFallback: false,
    };
  } catch (error) {
    console.warn('Network error calling AI parse, using fallback local parser:', error);
    return parseLifeInputLocal(input);
  }
}

export async function askLifeOSAssistant(
  message: string,
  items: LifeItem[],
  userProfile: UserProfile
): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        items,
        userProfile,
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat API status: ${res.status}`);
    }

    const data = await res.json();
    return data.reply || generateLocalAssistantReply(message, items);
  } catch (error) {
    console.warn('AI assistant offline, returning local rule reply:', error);
    return generateLocalAssistantReply(message, items);
  }
}

function generateLocalAssistantReply(message: string, items: LifeItem[]): string {
  const lower = message.toLowerCase();
  const activeItems = items.filter((i) => !i.completed);

  if (lower.includes('worry') || lower.includes('important') || lower.includes('this week')) {
    const urgentItems = activeItems.filter((i) => i.priority === 'high' || i.category === 'bill' || i.category === 'appointment').slice(0, 4);
    if (urgentItems.length === 0) {
      return "🎉 Great news! You're all caught up. No urgent items require your attention right now.";
    }
    const lines = urgentItems.map((item) => {
      const dot = item.priority === 'high' ? '🔴' : item.category === 'bill' ? '🟡' : '🟢';
      return `${dot} **${item.title}**${item.date ? ` (${item.date})` : ''}${item.amount ? ` - $${item.amount}` : ''}`;
    });
    return `Here are the top ${urgentItems.length} things to keep on your radar:\n\n${lines.join('\n\n')}`;
  }

  if (lower.includes('bill')) {
    const bills = activeItems.filter((i) => i.category === 'bill');
    if (bills.length === 0) return "You don't have any unpaid bills recorded right now.";
    const total = bills.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const list = bills.map((b) => `• **${b.title}**: $${b.amount || 0} ${b.date ? `(Due ${b.date})` : ''}`).join('\n');
    return `You have **${bills.length} bills** totaling **$${total.toFixed(2)}**:\n\n${list}`;
  }

  if (lower.includes('subscription')) {
    const subs = activeItems.filter((i) => i.category === 'subscription');
    if (subs.length === 0) return 'No active subscriptions recorded yet.';
    const total = subs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return `You have **${subs.length} active subscriptions** averaging **$${total.toFixed(2)}/month** (${subs.map((s) => s.title).join(', ')}).`;
  }

  if (lower.includes('warranty') || lower.includes('expire')) {
    const warranties = activeItems.filter((i) => i.category === 'warranty' || i.warrantyLengthMonths);
    if (warranties.length === 0) return 'No registered warranties found.';
    return `You have **${warranties.length} tracked purchases with warranties**: ${warranties.map((w) => w.title).join(', ')}.`;
  }

  return `I reviewed your ${activeItems.length} active items. You can ask me about upcoming bills, warranties, subscriptions, or schedule deadlines.`;
}
