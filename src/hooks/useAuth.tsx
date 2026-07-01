import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import { UserRole } from '@/domain/enums';
import { ROLE_DASHBOARD } from '@/domain/constants';
import type { AuthUser } from '@/domain/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isManager: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParent: boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  dashboardPath: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapToAuthUser = useCallback((sessionUser: { id: string; email?: string }, profile: Record<string, unknown> | null): AuthUser => {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      role: (profile?.role as UserRole) || UserRole.STUDENT,
      institute_id: (profile?.institute_id as string | null) || null,
      full_name: (profile?.full_name as string) || sessionUser.email || 'User',
      avatar_url: (profile?.avatar_url as string | null) || null,
    };
  }, []);

  const refreshUserClaims = useCallback(async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-claims`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        await supabase.auth.refreshSession();
      }
    } catch (err) {
      console.error('refreshUserClaims error:', err);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('fetchProfile error:', error.message);
      }

      setUser(mapToAuthUser(
        { id: userId, email: email || '' },
        profile
      ));
    } catch (err) {
      console.error('fetchProfile unexpected error:', err);
      setUser(mapToAuthUser(
        { id: userId, email: email || '' },
        null
      ));
    }
  }, [mapToAuthUser]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('initializeAuth error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await refreshUserClaims(session.user.id);
          await fetchProfile(session.user.id, session.user.email);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, refreshUserClaims]);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        await refreshUserClaims(data.user.id);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'An unexpected error occurred' };
    }
  }, [refreshUserClaims]);

  const logout = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  }, []);

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isManager = user?.role === UserRole.INSTITUTE_MANAGER;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isStudent = user?.role === UserRole.STUDENT;
  const isParent = user?.role === UserRole.PARENT;

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const canAccess = useCallback((allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const dashboardPath = user ? (ROLE_DASHBOARD[user.role] || '/') : '/';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated, isSuperAdmin, isManager, isTeacher, isStudent, isParent,
      hasRole, canAccess, dashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}