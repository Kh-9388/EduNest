import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { repositories } from '@/infrastructure/repositories';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2, Users, GraduationCap, School, FileText, Shield, TrendingUp, Activity
} from 'lucide-react';
import type { DashboardStats } from '@/domain/types';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await repositories.dashboard.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { label: 'Institutes', value: stats.total_institutes || 0, icon: <Building2 className="h-5 w-5" />, color: 'bg-blue-500', path: '/admin/institutes' },
    { label: 'Teachers', value: stats.total_teachers || 0, icon: <Users className="h-5 w-5" />, color: 'bg-green-500', path: '' },
    { label: 'Students', value: stats.total_students || 0, icon: <GraduationCap className="h-5 w-5" />, color: 'bg-purple-500', path: '' },
    { label: 'Courses', value: stats.total_courses || 0, icon: <School className="h-5 w-5" />, color: 'bg-orange-500', path: '' },
    { label: 'Enrollments', value: stats.total_enrollments || 0, icon: <FileText className="h-5 w-5" />, color: 'bg-pink-500', path: '' },
    { label: 'Audit Logs', value: 'View', icon: <Shield className="h-5 w-5" />, color: 'bg-red-500', path: '/admin/audit-logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Platform-wide overview and management</p>
        </div>
        <Button onClick={() => navigate('/admin/institutes')} className="bg-blue-600 hover:bg-blue-700">
          <Building2 className="mr-2 h-4 w-4" />
          Manage Institutes
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <Card
            key={i}
            className="cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => card.path && navigate(card.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color} text-white`}>
                  {card.icon}
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                )}
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'New institutes this month', value: '2', change: '+100%' },
                { label: 'Active users', value: '25', change: '+15%' },
                { label: 'Courses in progress', value: '7', change: '+40%' },
                { label: 'Total enrollments', value: '21', change: '+25%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{item.value}</span>
                    <span className="text-xs font-medium text-green-600">{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Institute', path: '/admin/institutes', icon: <Building2 className="h-5 w-5" /> },
                { label: 'View Audit Logs', path: '/admin/audit-logs', icon: <Shield className="h-5 w-5" /> },
                { label: 'Manage Users', path: '', icon: <Users className="h-5 w-5" /> },
                { label: 'System Settings', path: '', icon: <Activity className="h-5 w-5" /> },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => action.path && navigate(action.path)}
                >
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
