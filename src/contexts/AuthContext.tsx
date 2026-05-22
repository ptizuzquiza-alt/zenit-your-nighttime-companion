import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const DEMO_EMAIL = 'demo@zenit.app';
const DEMO_PASSWORD = 'zenit2024!';
const DEMO_NAME = 'Patricia';
const DEMO_USERNAME = 'patricia';

export interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsDemo: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'name' | 'username' | 'avatar_url'>>) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const syncToLocalStorage = (p: Profile) => {
    localStorage.setItem('zenit_name', p.name);
    localStorage.setItem('zenit_username', `@${p.username}`);
    if (p.avatar_url) localStorage.setItem('zenit_photo', p.avatar_url);
    else localStorage.removeItem('zenit_photo');
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles' as never)
        .select('id, name, username, avatar_url')
        .eq('id', userId)
        .single() as { data: Profile | null };
      if (data) {
        setProfile(data);
        syncToLocalStorage(data);
        localStorage.setItem('zenit_onboarded', 'true');
      }
    } catch { /* table may not exist yet */ }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    localStorage.setItem('zenit_onboarded', 'true');
    return { error: null };
  };

  const signInAsDemo = async () => {
    // Try login first; if account doesn't exist yet, create it
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    if (!loginErr) {
      localStorage.setItem('zenit_onboarded', 'true');
      return { error: null };
    }
    // Account doesn't exist — create it (pass metadata so trigger creates profile)
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: DEMO_EMAIL, password: DEMO_PASSWORD,
      options: { data: { name: DEMO_NAME, username: DEMO_USERNAME } },
    });
    if (signUpErr) return { error: signUpErr.message };
    if (data.user) {
      // Belt-and-suspenders: also insert manually in case trigger races
      await supabase.from('profiles' as never).insert({
        id: data.user.id, name: DEMO_NAME, username: DEMO_USERNAME, avatar_url: null,
      } as never);
    }
    // Seed demo friends in localStorage (kept mock, not in DB)
    if (!localStorage.getItem('zenit_friends')) {
      localStorage.setItem('zenit_friends', JSON.stringify([
        { id: 'juan', name: 'Juan' }, { id: 'marta', name: 'Marta' }, { id: 'javier', name: 'Javier' },
      ]));
      localStorage.setItem('zenit_pending_requests', JSON.stringify([{ id: 'carla', name: 'Carla' }]));
    }
    localStorage.setItem('zenit_onboarded', 'true');
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const uname = (username.startsWith('@') ? username.slice(1) : username) || name.toLowerCase().replace(/\s+/g, '');
    // Pass name/username in metadata so the DB trigger can create the profile
    // even if the manual insert below races or fails
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, username: uname } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      // Manual insert as belt-and-suspenders (trigger also handles this)
      await supabase
        .from('profiles' as never)
        .insert({ id: data.user.id, name, username: uname, avatar_url: null } as never);
      localStorage.setItem('zenit_name', name);
      localStorage.setItem('zenit_username', `@${uname}`);
      localStorage.setItem('zenit_email', email);
      localStorage.removeItem('zenit_photo');
      localStorage.setItem('zenit_friends', '[]');
      localStorage.setItem('zenit_pending_requests', '[]');
      localStorage.setItem('zenit_groups', '[]');
      localStorage.setItem('zenit_onboarded', 'true');
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    ['zenit_onboarded','zenit_name','zenit_username','zenit_email','zenit_photo',
     'zenit_friends','zenit_pending_requests','zenit_groups'].forEach(k => localStorage.removeItem(k));
  };

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };

  const updateProfile = async (updates: Partial<Pick<Profile, 'name' | 'username' | 'avatar_url'>>) => {
    if (!user) return { error: 'No autenticado' };
    const { error } = await supabase.from('profiles' as never).update(updates as never).eq('id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
      if (updates.name) localStorage.setItem('zenit_name', updates.name);
      if (updates.username) localStorage.setItem('zenit_username', `@${updates.username}`);
      if (updates.avatar_url) localStorage.setItem('zenit_photo', updates.avatar_url);
    }
    return { error: error ? (error as { message: string }).message : null };
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { url: null, error: 'No autenticado' };
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) return { url: null, error: upErr.message };
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: url });
    return { url, error: null };
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signInAsDemo, signUp, signOut, refreshProfile, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
