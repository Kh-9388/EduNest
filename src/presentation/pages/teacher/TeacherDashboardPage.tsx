import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { School, Users, NotebookPen, Award, ClipboardCheck, TrendingUp } from 'lucide-react';
import type { DashboardStats, Course } from '@/domain/types';

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: teacherData } = await repositories.teachers.findAll({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const teacher = teacherData[0];
        if (teacher) {
          const [sData, cData] = await Promise.all([
            repositories.dashboard.getTeacherStats(teacher.id),
            repositories.courses.findAll({ institute_id: user.institute_id, teacher_id: teacher.id, page: 1, pageSize: 10 }),
          ]);
          setStats(sData);
          setCourses(cData.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const statCards = [
    { label: 'My Courses', value: stats.total_courses || 0, icon: <School className="h-5 w-5" />, color: 'bg-blue-500', path: '/teacher/courses' },
    { label: 'Assignments', value: stats.total_assignments || 0, icon: <NotebookPen className="h-5 w-5" />, color: 'bg-purple-500', path: '/teacher/grades' },
    { label: 'Published', value: stats.published_assignments || 0, icon: <Award className="h-5 w-5" />, color: 'bg-green-500', path: '/teacher/grades' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
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
          <CardTitle className="text-lg flex items-center gap-2"><School className="h-5 w-5 text-blue-600" />My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.length === 0 ? <p className="text-gray-500 text-center py-4">No courses assigned yet</p> :
            courses.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.enrolled_count}/{c.capacity} students | {c.status}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/teacher/attendance')}>Attendance</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-green-600" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Record Attendance', path: '/teacher/attendance', icon: <ClipboardCheck className="h-5 w-5" /> },
                { label: 'Enter Grades', path: '/teacher/grades', icon: <Award className="h-5 w-5" /> },
                { label: 'My Courses', path: '/teacher/courses', icon: <School className="h-5 w-5" /> },
                { label: 'Assignments', path: '/teacher/grades', icon: <NotebookPen className="h-5 w-5" /> },
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
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-purple-600" />Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Average Class Size', value: courses.length ? Math.round(courses.reduce((sum, c) => sum + c.enrolled_count, 0) / courses.length) : 0 },
                { label: 'Total Students', value: courses.reduce((sum, c) => sum + c.enrolled_count, 0) },
                { label: 'Active Courses', value: courses.filter(c => c.status === 'active').length },
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
