import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, School, FileText, ClipboardCheck, Award, TrendingUp, BarChart3 } from 'lucide-react';
import type { DashboardStats } from '@/domain/types';

export function ManagerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const data = await repositories.dashboard.getManagerStats(user.institute_id);
        setStats(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id]);

  const statCards = [
    { label: 'Teachers', value: stats.total_teachers || 0, icon: <Users className="h-5 w-5" />, color: 'bg-green-500', path: '/manager/teachers' },
    { label: 'Students', value: stats.total_students || 0, icon: <GraduationCap className="h-5 w-5" />, color: 'bg-purple-500', path: '/manager/students' },
    { label: 'Courses', value: stats.total_courses || 0, icon: <School className="h-5 w-5" />, color: 'bg-orange-500', path: '/manager/courses' },
    { label: 'Active Enrollments', value: stats.total_enrollments || 0, icon: <FileText className="h-5 w-5" />, color: 'bg-pink-500', path: '/manager/enrollments' },
    { label: 'Active Courses', value: stats.active_courses || 0, icon: <ClipboardCheck className="h-5 w-5" />, color: 'bg-blue-500', path: '/manager/courses' },
    { label: 'Upcoming Courses', value: stats.upcoming_courses || 0, icon: <Award className="h-5 w-5" />, color: 'bg-teal-500', path: '/manager/courses' },
  ];

  const quickActions = [
    { label: 'Add Teacher', path: '/manager/teachers', icon: <Users className="h-5 w-5" /> },
    { label: 'Add Student', path: '/manager/students', icon: <GraduationCap className="h-5 w-5" /> },
    { label: 'Create Course', path: '/manager/courses', icon: <School className="h-5 w-5" /> },
    { label: 'Record Attendance', path: '/manager/attendance', icon: <ClipboardCheck className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Institute Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your institute's operations</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <Card key={i} className="cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow" onClick={() => card.path && navigate(card.path)}>
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
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
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
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-green-600" />Institute Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Teacher-Student Ratio', value: stats.total_teachers && stats.total_students ? `1:${Math.round(stats.total_students / stats.total_teachers)}` : 'N/A' },
                { label: 'Average Course Capacity', value: stats.total_courses ? `${Math.round((stats.total_enrollments || 0) / (stats.total_courses || 1))} students` : 'N/A' },
                { label: 'Active Course Rate', value: stats.total_courses ? `${Math.round(((stats.active_courses || 0) / stats.total_courses) * 100)}%` : '0%' },
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
