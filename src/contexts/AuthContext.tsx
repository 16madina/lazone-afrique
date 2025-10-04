import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAuthErrorMessage } from '@/lib/errorMessages';
import { logger } from '@/lib/logger';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: 'proprietaire' | 'demarcheur' | 'agence';
  company_name: string | null;
  license_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ data?: any; error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching profile', error);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        logger.info('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      logger.error('Error fetching profile', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: { message: getAuthErrorMessage(error) } };
      }
      
      return { data, error: null };
    } catch (error: any) {
      logger.error('Sign in error', error);
      return { error: { message: getAuthErrorMessage(error) } };
    }
  };

  const signInWithPhone = async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('phone-login', {
        body: { phone, password }
      });

      if (error) {
        return { error: { message: getAuthErrorMessage(error) } };
      }

      if (data.error) {
        return { error: { message: getAuthErrorMessage(data.error) } };
      }

      // Set the session from the phone login response
      if (data.session) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        if (sessionError) {
          return { error: { message: getAuthErrorMessage(sessionError) } };
        }
        
        return { data: sessionData, error: null };
      }

      return { data, error: null };
    } catch (error: any) {
      logger.error('Phone sign in error', error);
      return { error: { message: getAuthErrorMessage(error) } };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      
      if (error) {
        return { error: { message: getAuthErrorMessage(error) } };
      }
      
      return { data, error: null };
    } catch (error: any) {
      logger.error('Sign up error', error);
      return { error: { message: getAuthErrorMessage(error) } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: getAuthErrorMessage(error) } };
      }
      return { error: null };
    } catch (error: any) {
      logger.error('Sign out error', error);
      return { error: { message: getAuthErrorMessage(error) } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'Aucun utilisateur connecté' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        return { error: { message: getAuthErrorMessage(error) } };
      }

      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error: null };
    } catch (error: any) {
      logger.error('Update profile error', error);
      return { error: { message: 'Erreur lors de la mise à jour du profil' } };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signInWithPhone,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
