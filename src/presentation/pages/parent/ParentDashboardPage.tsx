import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Bell, UserCheck, TrendingUp } from 'lucide-react';
import type { DashboardStats, ParentStudentLink } from '@/domain/types';

export function ParentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [children, setChildren] = useState<ParentStudentLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const sData = await repositories.dashboard.getParentStats(user.id);
        setStats(sData);
        const { data: parentData } = await repositories.parents.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const parent = parentData[0];
        if (parent) {
          const cData = await repositories.parentStudentLinks.findByParent(parent.id);
          setChildren(cData);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const statCards = [
    { label: 'My Children', value: stats.total_students || 0, icon: <GraduationCap className="h-5 w-5" />, color: 'bg-blue-500', path: '/parent/children' },
    { label: 'Unread Notifications', value: stats.unread_notifications || 0, icon: <Bell className="h-5 w-5" />, color: 'bg-orange-500', path: '/notifications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Parent Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <Card key={i} className="cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow" onClick={() => navigate(card.path)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color} text-white`}>{card.icon}</div>
                {loading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold text-gray-900">{card.value}</span>}
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><UserCheck className="h-5 w-5 text-blue-600" />My Children</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {children.length === 0 ? <p className="text-gray-500 text-center py-4">No children linked yet</p> :
            children.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{(c as ParentStudentLink & { student?: { user?: { full_name: string } } }).student?.user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">Can view grades: {c.can_view_grades ? 'Yes' : 'No'} | Can view attendance: {c.can_view_attendance ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'My Children', path: '/parent/children', icon: <GraduationCap className="h-5 w-5" /> },
                { label: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" /> },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="h-auto flex-col gap-2 py-4 border-gray-200 hover:bg-blue-50" onClick={() => navigate(action.path)}>
                  <span className="text-blue-600">{action.icon}</span>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
