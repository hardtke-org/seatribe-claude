import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from './types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  recovery: boolean;
  endRecovery: () => void;
  reloadProfile: () => Promise<void>;
}

const Ctx = createContext<AuthState>({ session: null, profile: null, loading: true, recovery: false, endRecovery: () => {}, reloadProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
      if (!s) { setProfile(null); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile((data as Profile | null) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void reloadProfile(); }, [reloadProfile]);

  return <Ctx.Provider value={{ session, profile, loading, recovery, endRecovery: () => setRecovery(false), reloadProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
