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
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && email) {
      setUser(mapToAuthUser({ id: userId, email }, profile as Record<string, unknown>));
    }
  }, [mapToAuthUser]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
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
