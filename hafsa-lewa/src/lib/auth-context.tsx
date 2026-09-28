import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export type UserRole =
  | 'visitor'
  | 'donor'
  | 'researcher'
  | 'community_member'
  | 'staff'
  | 'administrator'
  | 'super_admin';

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: 'active' | 'suspended' | 'archived';
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  accountNotice: string | null;
  clearAccountNotice: () => void;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ hasSession: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export class AccountDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDisabledError';
  }
}

function inactiveAccountMessage(status: Profile['status']): string | null {
  if (status === 'suspended') {
    return 'This account is suspended. You have been signed out.';
  }
  if (status === 'archived') {
    return 'This account is archived and can no longer sign in.';
  }
  return null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const rejectInflight = useRef<Promise<void> | null>(null);
  const clearAccountNotice = useCallback(() => setAccountNotice(null), []);

  const rejectInactiveAccount = useCallback(async (status: Profile['status']) => {
    const message = inactiveAccountMessage(status);
    if (!message) return false;
    setAccountNotice(message);
    setProfile(null);
    if (!rejectInflight.current) {
      rejectInflight.current = supabase.auth.signOut().then(({ error }) => {
        rejectInflight.current = null;
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[Lewa] Failed to sign out a disabled account', error.message);
        }
      });
    }
    await rejectInflight.current;
    return true;
  }, []);

  const hydrateProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, role, status')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[Lewa] Failed to load profile', error.message);
        return;
      }
      const row = data as Profile | null;
      if (row && (await rejectInactiveAccount(row.status))) return;
      setProfile(row);
    },
    [rejectInactiveAccount],
  );

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await hydrateProfile(data.session.user.id);
      }
      if (mounted) setLoading(false);
    };

    void loadInitial();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        await hydrateProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrateProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      accountNotice,
      clearAccountNotice,
      isStaff:
        profile?.status === 'active' &&
        (profile.role === 'staff' ||
          profile.role === 'administrator' ||
          profile.role === 'super_admin'),
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) return;
        const { data: row, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        const status = row?.status as Profile['status'] | undefined;
        if (status && (await rejectInactiveAccount(status))) {
          throw new AccountDisabledError(inactiveAccountMessage(status) ?? 'This account cannot sign in.');
        }
      },
      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        return { hasSession: data.session != null };
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      resetPassword: async (email) => {
        const redirectTo = Linking.createURL('/reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
      },
      refreshProfile: async () => {
        if (session?.user) await hydrateProfile(session.user.id);
      },
    }),
    [loading, session, profile, accountNotice, clearAccountNotice, rejectInactiveAccount, hydrateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
