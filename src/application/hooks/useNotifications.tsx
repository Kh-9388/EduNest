import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from './useAuth';

interface NotificationsContextType {
  unreadCount: number;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({ unreadCount: 0, refresh: async () => {} });

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    if (!error) setUnreadCount(count || 0);
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${user.id}` }, () => {
        refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refresh]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}
