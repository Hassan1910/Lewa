import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

export type Role = 'visitor' | 'donor' | 'researcher' | 'community_member' | 'staff' | 'administrator' | 'super_admin';

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  role: Role;
  status: string;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  isStaff: boolean;
  isAdmin: boolean;
  isSuper: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const hydrate = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('id, full_name, email, role, status').eq('id', userId).maybeSingle();
    setProfile((data as Profile) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void hydrate(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, next) => {
      setSession(next);
      if (next?.user) void hydrate(next.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      session,
      profile,
      isStaff: ['staff', 'administrator', 'super_admin'].includes(profile?.role ?? ''),
      isAdmin: ['administrator', 'super_admin'].includes(profile?.role ?? ''),
      isSuper: profile?.role === 'super_admin',
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
