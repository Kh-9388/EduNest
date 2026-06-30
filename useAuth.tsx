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

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('fetchProfile error:', error.message);
        setUser(null);
        return;
      }

      if (profile && email) {
        setUser(mapToAuthUser({ id: userId, email }, profile as Record<string, unknown>));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('fetchProfile unexpected error:', err);
      setUser(null);
    }
  }, [mapToAuthUser]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // 1. الحصول على الجلسة أولاً
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          // 2. جلب البيانات فقط إذا كانت الجلسة موجودة
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

    // 3. الاستماع للتغييرات
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id, session.user.email);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // لا حاجة لجلب البيانات مرة أخرى، فقط تحديث الجلسة
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        // onAuthStateChange سيتولى جلب البيانات تلقائياً
        // لكن ننتظر قليلاً للتأكد
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

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