import { LifeCategory, ParsedLifeInput, Priority, RecurringFrequency } from '../types';

export function parseLifeInputLocal(input: string, referenceDate: Date = new Date()): ParsedLifeInput {
  const text = input.trim();
  const lower = text.toLowerCase();

  let category: LifeCategory = 'other';
  let priority: Priority = 'medium';
  let title = text;
  let description = '';
  let date: string | null = null;
  let time: string | null = null;
  let reminderDate: string | null = null;
  let amount: number | null = null;
  let vendor: string | null = null;
  let location: string | null = null;
  let locationAddress: string | null = null;
  let recurring = false;
  let recurringFrequency: RecurringFrequency | null = null;
  let warrantyLengthMonths: number | null = null;
  const tags: string[] = [];

  // Extract Amount: $143, $1,200, $15.99
  const amountMatch = text.match(/\$\s?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Extract Recurring
  if (lower.includes('every month') || lower.includes('monthly') || lower.includes('/month') || lower.includes('a month')) {
    recurring = true;
    recurringFrequency = 'monthly';
  } else if (lower.includes('every year') || lower.includes('yearly') || lower.includes('annually') || lower.includes('/year')) {
    recurring = true;
    recurringFrequency = 'yearly';
  } else if (lower.includes('every week') || lower.includes('weekly') || lower.includes('/week')) {
    recurring = true;
    recurringFrequency = 'weekly';
  } else if (lower.includes('every quarter') || lower.includes('quarterly')) {
    recurring = true;
    recurringFrequency = 'quarterly';
  }

  // Extract Warranty
  const warrantyYearMatch = lower.match(/(\d+)\s*(?:-| )?year\s+warranty/);
  const warrantyMonthMatch = lower.match(/(\d+)\s*(?:-| )?month\s+warranty/);
  const twoYearMatch = lower.match(/(two|three|one|four|five)\s*(?:-| )?year\s+warranty/);

  if (warrantyYearMatch) {
    warrantyLengthMonths = parseInt(warrantyYearMatch[1], 10) * 12;
  } else if (warrantyMonthMatch) {
    warrantyLengthMonths = parseInt(warrantyMonthMatch[1], 10);
  } else if (twoYearMatch) {
    const wordMap: Record<string, number> = { one: 12, two: 24, three: 36, four: 48, five: 60 };
    warrantyLengthMonths = wordMap[twoYearMatch[1]] || 12;
  } else if (lower.includes('warranty')) {
    warrantyLengthMonths = 12;
  }

  // Category Detection
  if (lower.includes('oil change') || lower.includes('car ') || lower.includes('tire') || lower.includes('brake') || lower.includes('mechanic') || lower.includes('vehicle') || lower.includes('auto ')) {
    category = 'car';
  } else if (lower.includes('dentist') || lower.includes('doctor') || lower.includes('appointment') || lower.includes('meeting') || lower.includes('clinic') || lower.includes('vet ') || lower.includes('haircut')) {
    category = 'appointment';
  } else if (lower.includes('electric bill') || lower.includes('water bill') || lower.includes('utility') || lower.includes('rent') || lower.includes('mortgage') || lower.includes('internet bill') || lower.includes('phone bill') || lower.includes('insurance') || lower.includes('tax') || lower.includes('due') && !lower.includes('trial')) {
    category = 'bill';
  } else if (lower.includes('subscription') || lower.includes('free trial') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('hulu') || lower.includes('disney') || lower.includes('prime') || lower.includes('icloud') || lower.includes('chatgpt') || lower.includes('renew')) {
    category = 'subscription';
  } else if (warrantyLengthMonths || lower.includes('bought') || lower.includes('purchased') || lower.includes('tv') || lower.includes('laptop') || lower.includes('phone') || lower.includes('appliance') || lower.includes('receipt')) {
    category = warrantyLengthMonths ? 'purchase' : 'purchase';
  } else if (lower.includes('package') || lower.includes('delivery') || lower.includes('amazon order') || lower.includes('fedex') || lower.includes('ups') || lower.includes('arriving') || lower.includes('shipped')) {
    category = 'package';
  } else if (lower.includes('passport') || lower.includes('license') || lower.includes('driver\'s license') || lower.includes('certificate') || lower.includes('contract') || lower.includes('document')) {
    category = 'document';
  } else if (lower.includes('flight') || lower.includes('hotel') || lower.includes('trip') || lower.includes('vacation') || lower.includes('airbnb')) {
    category = 'travel';
  } else if (lower.includes('plumber') || lower.includes('roof') || lower.includes('lawn') || lower.includes('hvac') || lower.includes('filter')) {
    category = 'home';
  }

  // Vendors
  const vendors = ['Best Buy', 'Amazon', 'Apple', 'Target', 'Walmart', 'Costco', 'Netflix', 'Spotify', 'AT&T', 'Verizon', 'T-Mobile', 'PG&E', 'Geico', 'State Farm', 'Progressive'];
  for (const v of vendors) {
    if (lower.includes(v.toLowerCase())) {
      vendor = v;
      break;
    }
  }

  // Dates parsing
  const now = referenceDate;
  const currentYear = now.getFullYear();

  if (lower.includes('today')) {
    date = formatDateIso(now);
    reminderDate = date;
  } else if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    date = formatDateIso(tomorrow);
    reminderDate = formatDateIso(now);
  } else if (lower.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    date = formatDateIso(nextWeek);
  } else if (lower.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    date = formatDateIso(nextMonth);
  } else if (lower.includes('next year')) {
    date = `${currentYear + 1}`;
  } else {
    // Check specific days like "Friday", "Monday"
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lower.includes(daysOfWeek[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntil);
        date = formatDateIso(targetDate);
        break;
      }
    }

    // Check specific month + day like "September 5", "Sep 5", "September 20"
    const monthNames = [
      { name: 'january', short: 'jan', num: 1 },
      { name: 'february', short: 'feb', num: 2 },
      { name: 'march', short: 'mar', num: 3 },
      { name: 'april', short: 'apr', num: 4 },
      { name: 'may', short: 'may', num: 5 },
      { name: 'june', short: 'jun', num: 6 },
      { name: 'july', short: 'jul', num: 7 },
      { name: 'august', short: 'aug', num: 8 },
      { name: 'september', short: 'sep', num: 9 },
      { name: 'october', short: 'oct', num: 10 },
      { name: 'november', short: 'nov', num: 11 },
      { name: 'december', short: 'dec', num: 12 },
    ];

    let foundExactDate = false;
    for (const m of monthNames) {
      const regex = new RegExp(`(?:${m.name}|${m.short})\\.?\\s+(\\d{1,2})`, 'i');
      const match = text.match(regex);
      if (match) {
        const day = parseInt(match[1], 10);
        let targetYear = currentYear;
        // If the date has passed this year, it might be next year
        const testDate = new Date(targetYear, m.num - 1, day);
        if (testDate < now && !lower.includes('bought') && !lower.includes('today')) {
          targetYear = currentYear + 1;
        }
        date = `${targetYear}-${String(m.num).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        foundExactDate = true;
        break;
      }
    }

    // If no exact day, check if month alone is stated e.g. "in October"
    if (!foundExactDate) {
      for (const m of monthNames) {
        if (lower.includes(m.name) || (lower.includes(`in ${m.short}`) || lower.includes(`by ${m.short}`))) {
          let targetYear = currentYear;
          if (m.num < now.getMonth() + 1) {
            targetYear = currentYear + 1;
          }
          date = `${m.name.charAt(0).toUpperCase() + m.name.slice(1)} ${targetYear}`;
          // Set reminder 5-7 days before if month is target
          reminderDate = `${m.num === 1 ? 12 : m.num - 1}/25`;
          break;
        }
      }
    }
  }

  // Priority
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately') || lower.includes('cancel my free trial') || lower.includes('due tomorrow') || lower.includes('due today')) {
    priority = 'high';
  } else if (lower.includes('low priority') || lower.includes('whenever') || lower.includes('someday')) {
    priority = 'low';
  } else {
    priority = 'medium';
  }

  // Generate clean title
  title = generateCleanTitle(text, category, vendor);

  return {
    title,
    description: text,
    category,
    priority,
    date,
    time,
    reminderDate,
    amount,
    vendor,
    location,
    locationAddress,
    recurring,
    recurringFrequency,
    warrantyLengthMonths,
    tags,
    confidence: 0.85,
    usedFallback: true,
    reasoning: 'Parsed accurately via LifeOS smart local engine.',
  };
}

function formatDateIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateCleanTitle(text: string, category: LifeCategory, vendor: string | null): string {
  const lower = text.toLowerCase();
  if (lower.includes('oil change')) return 'Car oil change';
  if (lower.includes('electric bill')) return 'Electric bill';
  if (lower.includes('dentist')) return 'Dentist appointment';
  if (lower.includes('doctor')) return 'Doctor appointment';
  if (lower.includes('free trial') || lower.includes('cancel')) {
    return vendor ? `Cancel ${vendor} free trial` : 'Cancel free trial';
  }
  if (lower.includes('tv')) return vendor ? `TV purchase (${vendor})` : 'TV purchase';
  if (lower.includes('laptop')) return 'Laptop purchase';
  if (lower.includes('package')) return vendor ? `${vendor} package delivery` : 'Package delivery';
  if (lower.includes('license')) return "Driver's license renewal";
  if (lower.includes('insurance')) return 'Car insurance payment';
  if (lower.includes('spotify')) return 'Spotify subscription';
  if (lower.includes('netflix')) return 'Netflix subscription';
  if (lower.includes('phone bill')) return 'Phone bill';
  if (lower.includes('internet')) return 'Internet bill';

  // Capitalize first 4-6 words
  const words = text.split(' ').slice(0, 5).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
