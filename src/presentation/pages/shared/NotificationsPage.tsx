import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Bell, CheckCircle, Trash2, AlertTriangle, Info, FileText, CalendarDays, Award } from 'lucide-react';
import type { Notification } from '@/domain/types';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await repositories.notifications.findByReceiver(user.id);
      setNotifications(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [user?.id]);

  const markRead = async (id: string) => {
    try { await repositories.notifications.markAsRead(id); loadData(); }
    catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    try { await repositories.notifications.markAllAsRead(user.id); loadData(); }
    catch (err) { console.error(err); }
  };

  const getIcon = (type: string) => {
    switch (type) { case 'new_grade': return <Award className="h-5 w-5 text-purple-600" />; case 'new_assignment': return <FileText className="h-5 w-5 text-blue-600" />; case 'attendance_alert': return <AlertTriangle className="h-5 w-5 text-orange-600" />; case 'schedule_changed': return <CalendarDays className="h-5 w-5 text-green-600" />; default: return <Info className="h-5 w-5 text-gray-600" />; }
  };

  const priorityBadge = (p: string) => {
    switch (p) { case 'urgent': return <Badge className="bg-red-100 text-red-700">{p}</Badge>; case 'high': return <Badge className="bg-orange-100 text-orange-700">{p}</Badge>; case 'low': return <Badge className="bg-gray-100 text-gray-700">{p}</Badge>; default: return <Badge className="bg-blue-100 text-blue-700">{p}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Notifications</h2><p className="text-sm text-gray-500 mt-1">Your notifications and alerts</p></div>
        <Button variant="outline" size="sm" onClick={markAllRead}><CheckCircle className="mr-2 h-4 w-4" />Mark all read</Button>
      </div>

      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, i) => <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></CardContent></Card>) :
        notifications.length === 0 ? <div className="text-center text-gray-500 py-8">No notifications</div> :
        notifications.map(n => (
          <Card key={n.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{n.title}</p>
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    {priorityBadge(n.priority)}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}><CheckCircle className="h-4 w-4" /></Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
