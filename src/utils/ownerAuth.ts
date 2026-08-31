import { UserProfile } from '../types';

export const OWNER_EMAILS: string[] = ['ntaijo.fn@gmail.com'];

/**
 * Permanent Free Premium (Lifetime VIP) accounts.
 * Users in this list are unconditionally granted full, lifetime LifeOS Pro privileges
 * at $0.00 / free forever with no renewal expiration.
 */
export const PERMANENT_PRO_EMAILS: string[] = [
  'tanner.regenbogen09@gmail.com',
];

/**
 * Checks if an email has permanent free premium / lifetime VIP access.
 */
export function isPermanentProUser(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return PERMANENT_PRO_EMAILS.includes(clean);
}

/**
 * Checks if the current authenticated user is the verified application owner.
 * Only ntaijo.fn@gmail.com has access to the Creator Monetization and Withdrawal Hub.
 * Under NO circumstances should any other user account see or access withdrawal options.
 */
export function isAppOwner(user: UserProfile | null): boolean {
  if (!user || !user.email) return false;
  const userEmail = user.email.trim().toLowerCase();
  return OWNER_EMAILS.includes(userEmail);
}

export function getPrimaryOwnerEmail(): string {
  return OWNER_EMAILS[0];
}
