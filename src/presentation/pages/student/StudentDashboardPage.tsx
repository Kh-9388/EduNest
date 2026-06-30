import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { School, Award, Clock, Bell } from 'lucide-react';
import type { DashboardStats } from '@/domain/types';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: studentData } = await repositories.students.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const student = studentData[0];
        if (student) {
          const sData = await repositories.dashboard.getStudentStats(student.id);
          setStats(sData);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const statCards = [
    { label: 'My Courses', value: stats.total_enrollments || 0, icon: <School className="h-5 w-5" />, color: 'bg-blue-500', path: '/student/courses' },
    { label: 'Average Grade', value: stats.average_grade || 0, icon: <Award className="h-5 w-5" />, color: 'bg-green-500', path: '/student/grades' },
    { label: 'Unread Notifications', value: stats.unread_notifications || 0, icon: <Bell className="h-5 w-5" />, color: 'bg-orange-500', path: '/notifications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" />Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'My Courses', path: '/student/courses', icon: <School className="h-5 w-5" /> },
                { label: 'Schedule', path: '/student/schedule', icon: <Clock className="h-5 w-5" /> },
                { label: 'My Grades', path: '/student/grades', icon: <Award className="h-5 w-5" /> },
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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-green-600" />Grade Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Current Average', value: `${stats.average_grade || 0}%` },
                { label: 'Enrolled Courses', value: stats.total_enrollments || 0 },
                { label: 'Unread Notifications', value: stats.unread_notifications || 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
