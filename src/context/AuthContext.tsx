import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_DEMO_USER, storage } from '../services/storage';
import { isAppOwner, isPermanentProUser } from '../utils/ownerAuth';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailySummaryEmail: boolean;
  autoSuggest: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isDemo: boolean;
  isLoading: boolean;
  loading: boolean;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;

  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;

  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;

  loginWithEmail: (email: string, password?: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    name: string,
    password?: string
  ) => Promise<void>;

  resetPassword: (
    email: string,
    newPassword: string,
    confirmPassword?: string
  ) => Promise<void>;

  loginAsDemo: () => void;
  loginAsOwner: () => void;
  loginWithGoogle: () => Promise<void>;

  logout: () => void;
  completeOnboarding: () => void;

  updateProfile: (updates: Partial<UserProfile>) => void;

  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  deleteAccount: () => void;
  deleteAccountWithSecurity: (
    email: string,
    password: string,
    question: string,
    answer: string
  ) => Promise<void>;

  updateSecurityRecovery: (
    email: string,
    password: string,
    newQuestion: string,
    newAnswer: string,
    confirmAnswer: string
  ) => Promise<void>;

  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'lifeos_current_auth_uid';

const SECURITY_QUESTIONS = [
  'What is the name of your first school?',
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your favorite dessert?',
  'What was your childhood nickname?',
  'What is your mother’s maiden name?',
];

const normalizeAnswer = (value: string) => value.trim().toLowerCase();

const getPasswordKey = (email: string) => `lifeos_pwd_${email.toLowerCase()}`;
const getOnboardingKey = (email: string) =>
  `lifeos_has_onboarded_${email.toLowerCase()}`;

const getUidFromEmail = (email: string) =>
  'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');

const getSecurityQuestionKey = (email: string) =>
  `lifeos_security_question_${email.toLowerCase()}`;

const getSecurityAnswerKey = (email: string) =>
  `lifeos_security_answer_${email.toLowerCase()}`;

const persistAuthSession = (uid: string) => {
  sessionStorage.setItem(AUTH_USER_KEY, uid);
};

const clearAuthSession = () => {
  sessionStorage.removeItem(AUTH_USER_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    try {
      const storedUid = sessionStorage.getItem(AUTH_USER_KEY);
      if (storedUid) {
        const profile = storage.getUserProfile(storedUid);
        if (profile) {
          setUser(profile);
          setThemeState(profile.theme || 'light');
        } else {
          clearAuthSession();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error restoring auth session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    if (user) {
      const updated = { ...user, theme: newTheme };
      setUser(updated);
      storage.saveUserProfile(updated);
    }
  };

  const toSafeString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    return String(value);
  };

  const validateEmail = (email: string) => {
    const cleanEmail = toSafeString(email).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return cleanEmail;
  };

  const validatePassword = (password?: string) => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
  };

  const saveSecurityRecovery = (
    email: string,
    question: string,
    answer: string
  ) => {
    if (!question || !answer.trim()) return;
    localStorage.setItem(getSecurityQuestionKey(email), question);
    localStorage.setItem(getSecurityAnswerKey(email), normalizeAnswer(answer));
  };

  const loginWithEmail = async (email: string, password?: string) => {
    const cleanEmail = validateEmail(email);
    validatePassword(password);
    setIsLoading(true);

    try {
      const uid = getUidFromEmail(cleanEmail);
      const storedPassword = localStorage.getItem(getPasswordKey(cleanEmail));

      if (!storedPassword) {
        throw new Error(
          'No account was found with this email address. Please create an account first.'
        );
      }

      if (storedPassword !== password) {
        throw new Error(
          'Incorrect password. Please check your password or use Forgot Password.'
        );
      }

      const existing = storage.getUserProfile(uid);

      const isOwnerEmail = cleanEmail === 'ntaijo.fn@gmail.com';
      const isVipEmail = isPermanentProUser(cleanEmail);
      const defaultDisplayName =
        isVipEmail && cleanEmail.includes('tanner')
          ? 'Tanner Regenbogen'
          : cleanEmail.split('@')[0];

      localStorage.setItem(getOnboardingKey(cleanEmail), 'true');

      const profile: UserProfile = {
        ...existing,
        uid,
        email: cleanEmail,
        displayName:
          existing?.displayName && existing.displayName !== 'Alex'
            ? existing.displayName
            : defaultDisplayName,
        theme: existing?.theme || 'light',
        isOwner: isOwnerEmail,
        isPermanentPro: isVipEmail,
        isVip: isVipEmail,
        onboardingCompleted: true,
      };

      storage.saveUserProfile(profile);
      storage.getSubscription(uid);
      persistAuthSession(uid);

      setUser(profile);
      setThemeState(profile.theme || 'light');
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    name: string,
    password?: string
  ) => {
    const cleanEmail = validateEmail(email);
    validatePassword(password);
    setIsLoading(true);

    try {
      const cleanName = name?.trim() || cleanEmail.split('@')[0];
      const uid = getUidFromEmail(cleanEmail);
      const existingPassword = localStorage.getItem(getPasswordKey(cleanEmail));

      if (existingPassword) {
        throw new Error(
          'An account with this email already exists. Please log in instead.'
        );
      }

      localStorage.setItem(getPasswordKey(cleanEmail), password as string);

      const isOwnerEmail = cleanEmail === 'ntaijo.fn@gmail.com';
      const isVipEmail = isPermanentProUser(cleanEmail);
      const alreadyOnboarded =
        localStorage.getItem(getOnboardingKey(cleanEmail)) === 'true';

      const profile: UserProfile = {
        uid,
        email: cleanEmail,
        displayName: cleanName,
        theme: 'light',
        notificationsEnabled: true,
        defaultReminder: '1_day',
        aiPreferences: {
          autoSuggest: true,
          summaryFrequency: 'daily',
          conciseSummary: true,
        },
        isOwner: isOwnerEmail,
        isPermanentPro: isVipEmail,
        isVip: isVipEmail,
        onboardingCompleted: alreadyOnboarded,
        selectedFocusAreas: ['bills', 'appointments', 'subscriptions'],
        createdAt: new Date().toISOString(),
      };

      storage.saveUserProfile(profile);
      storage.getSubscription(uid);
      persistAuthSession(uid);

      setUser(profile);
      setThemeState('light');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    return loginWithEmail(email, password);
  };

  const signup = async (name: string, email: string, password?: string) => {
    return signupWithEmail(email, name, password);
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    confirmPassword?: string
  ) => {
    const cleanEmail = validateEmail(email);
    validatePassword(newPassword);

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      throw new Error('Passwords do not match. Please re-enter your new password.');
    }

    const uid = getUidFromEmail(cleanEmail);
    const existingProfile = storage.getUserProfile(uid);

    if (!existingProfile) {
      const existingPassword = localStorage.getItem(getPasswordKey(cleanEmail));
      if (!existingPassword) {
        throw new Error('No account was found with this email address.');
      }
    }

    localStorage.setItem(getPasswordKey(cleanEmail), newPassword);
  };

  const updateSecurityRecovery = async (
    email: string,
    password: string,
    newQuestion: string,
    newAnswer: string,
    confirmAnswer: string
  ) => {
    const cleanEmail = validateEmail(email);
    validatePassword(password);

    if (!newQuestion || !SECURITY_QUESTIONS.includes(newQuestion)) {
      throw new Error('Please choose a valid security question.');
    }

    if (!newAnswer || newAnswer.trim().length < 2) {
      throw new Error('Security answer must be at least 2 characters.');
    }

    if (normalizeAnswer(newAnswer) !== normalizeAnswer(confirmAnswer)) {
      throw new Error('Security answers do not match.');
    }

    const savedPassword = localStorage.getItem(getPasswordKey(cleanEmail));
    if (!savedPassword) {
      throw new Error('No account exists for this email.');
    }

    if (savedPassword !== password) {
      throw new Error('Current password is incorrect.');
    }

    saveSecurityRecovery(cleanEmail, newQuestion, newAnswer);
  };

  const deleteAccountWithSecurity = async (
    email: string,
    password: string,
    question: string,
    answer: string
  ) => {
    const cleanEmail = validateEmail(email);
    validatePassword(password);

    const savedPassword = localStorage.getItem(getPasswordKey(cleanEmail));
    const savedQuestion = localStorage.getItem(getSecurityQuestionKey(cleanEmail));
    const savedAnswer = localStorage.getItem(getSecurityAnswerKey(cleanEmail));

    if (!savedPassword) {
      throw new Error('No account exists for this email.');
    }

    if (savedPassword !== password) {
      throw new Error('Current password is incorrect.');
    }

    if (!savedQuestion || !savedAnswer) {
      throw new Error('No recovery question has been set for this account.');
    }

    if (savedQuestion !== question) {
      throw new Error('That security question does not match this account.');
    }

    if (normalizeAnswer(savedAnswer) !== normalizeAnswer(answer)) {
      throw new Error('That security answer is incorrect.');
    }

    const currentUid = user?.uid || getUidFromEmail(cleanEmail);

    if (user?.uid) {
      clearAuthSession();
    }

    localStorage.removeItem(getPasswordKey(cleanEmail));
    localStorage.removeItem(getOnboardingKey(cleanEmail));
    localStorage.removeItem(getSecurityQuestionKey(cleanEmail));
    localStorage.removeItem(getSecurityAnswerKey(cleanEmail));

    if (currentUid) {
      localStorage.removeItem('lifeos_v1_' + currentUid + '_profile');
      localStorage.removeItem('lifeos_v1_' + currentUid + '_items');
      localStorage.removeItem('lifeos_v1_' + currentUid + '_notifications');
      localStorage.removeItem('lifeos_v1_' + currentUid + '_household');
    }

    setUser(null);
  };

  const loginAsDemo = () => {
    setIsLoading(true);

    const demo = storage.getUserProfile(INITIAL_DEMO_USER.uid);
    if (!demo) {
      setIsLoading(false);
      return;
    }

    storage.getItems(INITIAL_DEMO_USER.uid);
    storage.saveUserProfile(demo);

    persistAuthSession(demo.uid);

    setUser(demo);
    setThemeState(demo.theme || 'light');
    setIsLoading(false);
  };

  const loginAsOwner = () => {
    setIsLoading(true);

    const ownerEmail = 'ntaijo.fn@gmail.com';
    const uid = 'user_ntaijo_fn_owner';
    const existing = storage.getUserProfile(uid);

    const ownerProfile: UserProfile = {
      ...existing,
      uid,
      email: ownerEmail,
      displayName: existing?.displayName || 'App Owner (ntaijo.fn)',
      theme: existing?.theme || 'light',
      isOwner: true,
      onboardingCompleted: true,
      notificationsEnabled: true,
      defaultReminder: '1_day',
      aiPreferences: {
        autoSuggest: true,
        summaryFrequency: 'daily',
        conciseSummary: true,
      },
      selectedFocusAreas: ['bills', 'subscriptions', 'warranties', 'car'],
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    storage.saveUserProfile(ownerProfile);
    storage.getItems(uid);

    persistAuthSession(uid);

    setUser(ownerProfile);
    setThemeState(ownerProfile.theme || 'light');
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const uid = 'google_user_' + Math.random().toString(36).substring(2, 8);
      const profile: UserProfile = {
        uid,
        email: 'alex.google@example.com',
        displayName: 'Alex Chen',
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
        onboardingCompleted: true,
        selectedFocusAreas: ['bills', 'appointments', 'car', 'warranties'],
        createdAt: new Date().toISOString(),
      };

      storage.saveUserProfile(profile);
      persistAuthSession(uid);

      setUser(profile);
      setThemeState('light');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setIsAuthModalOpen(false);
  };

  const isDemo = Boolean(user?.isDemo || user?.uid === 'demo-user-1');

  const completeOnboarding = () => {
    if (!user || isDemo) return;

    if (user.email) {
      localStorage.setItem(getOnboardingKey(user.email), 'true');
    }

    const updated: UserProfile = { ...user, onboardingCompleted: true };
    setUser(updated);
    storage.saveUserProfile(updated);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user || isDemo) return;

    const updated = { ...user, ...updates };
    setUser(updated);
    storage.saveUserProfile(updated);
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    if (!user) return;

    if (updates.theme) {
      setThemeState(updates.theme);
    }

    if (isDemo) {
      return;
    }

    const updated: UserProfile = {
      ...user,
      theme: updates.theme || user.theme,
      notificationsEnabled:
        updates.notificationsEnabled !== undefined
          ? updates.notificationsEnabled
          : user.notificationsEnabled,
      aiPreferences: {
        ...(user.aiPreferences ?? {
          autoSuggest: true,
          summaryFrequency: 'daily',
          conciseSummary: true,
        }),
        autoSuggest:
          updates.autoSuggest !== undefined
            ? updates.autoSuggest
            : user.aiPreferences?.autoSuggest ?? true,
      },
    };

    setUser(updated);
    storage.saveUserProfile(updated);
  };

  const deleteAccount = () => {
    if (!user || isDemo) return;

    const email = user.email?.toLowerCase();
    clearAuthSession();

    if (user.uid) {
      localStorage.removeItem('lifeos_v1_' + user.uid + '_profile');
      localStorage.removeItem('lifeos_v1_' + user.uid + '_items');
      localStorage.removeItem('lifeos_v1_' + user.uid + '_notifications');
      localStorage.removeItem('lifeos_v1_' + user.uid + '_household');
    }

    if (email) {
      localStorage.removeItem(getPasswordKey(email));
      localStorage.removeItem(getOnboardingKey(email));
      localStorage.removeItem(getSecurityQuestionKey(email));
      localStorage.removeItem(getSecurityAnswerKey(email));
    }

    setUser(null);
  };

  const preferences: UserPreferences = {
    theme,
    notificationsEnabled: user?.notificationsEnabled ?? true,
    dailySummaryEmail: user?.aiPreferences?.autoSuggest ?? true,
    autoSuggest: user?.aiPreferences?.autoSuggest ?? true,
  };

  const isOwner = isAppOwner(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isOwner,
        isDemo,
        isLoading,
        loading: isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        loginAsDemo,
        loginAsOwner,
        loginWithGoogle,
        logout,
        completeOnboarding,
        updateProfile,
        preferences,
        updatePreferences,
        deleteAccount,
        deleteAccountWithSecurity,
        updateSecurityRecovery,
        theme,
        setTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};