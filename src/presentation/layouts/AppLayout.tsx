import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/application/hooks/useAuth';
import { UserRole } from '@/domain/enums';
import { FOOTER_TEXT, APP_NAME } from '@/domain/constants';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/application/hooks/useNotifications';
import {
  LayoutDashboard, Building2, Users, BookOpen, GraduationCap,
  CalendarDays, ClipboardCheck, FileText, Bell, Settings, LogOut,
  Menu, ChevronLeft, Shield, School, UserCheck, Award, Clock,
  NotebookPen, BarChart3, X
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Admin
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: [UserRole.SUPER_ADMIN] },
  { label: 'Institutes', path: '/admin/institutes', icon: <Building2 className="h-5 w-5" />, roles: [UserRole.SUPER_ADMIN] },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Shield className="h-5 w-5" />, roles: [UserRole.SUPER_ADMIN] },
  // Manager
  { label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Teachers', path: '/manager/teachers', icon: <Users className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Students', path: '/manager/students', icon: <GraduationCap className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Parents', path: '/manager/parents', icon: <UserCheck className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Subjects', path: '/manager/subjects', icon: <BookOpen className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Courses', path: '/manager/courses', icon: <School className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Enrollments', path: '/manager/enrollments', icon: <FileText className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Schedules', path: '/manager/schedules', icon: <CalendarDays className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Attendance', path: '/manager/attendance', icon: <ClipboardCheck className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Grades', path: '/manager/grades', icon: <Award className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  { label: 'Assignments', path: '/manager/assignments', icon: <NotebookPen className="h-5 w-5" />, roles: [UserRole.INSTITUTE_MANAGER] },
  // Teacher
  { label: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: [UserRole.TEACHER] },
  { label: 'My Courses', path: '/teacher/courses', icon: <School className="h-5 w-5" />, roles: [UserRole.TEACHER] },
  { label: 'Attendance', path: '/teacher/attendance', icon: <ClipboardCheck className="h-5 w-5" />, roles: [UserRole.TEACHER] },
  { label: 'Grades', path: '/teacher/grades', icon: <Award className="h-5 w-5" />, roles: [UserRole.TEACHER] },
  // Student
  { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: [UserRole.STUDENT] },
  { label: 'My Courses', path: '/student/courses', icon: <School className="h-5 w-5" />, roles: [UserRole.STUDENT] },
  { label: 'Schedule', path: '/student/schedule', icon: <Clock className="h-5 w-5" />, roles: [UserRole.STUDENT] },
  { label: 'Grades', path: '/student/grades', icon: <Award className="h-5 w-5" />, roles: [UserRole.STUDENT] },
  // Parent
  { label: 'Dashboard', path: '/parent/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: [UserRole.PARENT] },
  { label: 'My Children', path: '/parent/children', icon: <GraduationCap className="h-5 w-5" />, roles: [UserRole.PARENT] },
];

export function AppLayout() {
  const { user, logout, isSuperAdmin, isManager, isTeacher, isStudent, isParent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotifications();

  const visibleNavItems = navItems.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isManager) return 'Manager';
    if (isTeacher) return 'Teacher';
    if (isStudent) return 'Student';
    if (isParent) return 'Parent';
    return 'User';
  };

  const getRoleBadgeColor = () => {
    if (isSuperAdmin) return 'bg-red-100 text-red-700';
    if (isManager) return 'bg-blue-100 text-blue-700';
    if (isTeacher) return 'bg-green-100 text-green-700';
    if (isStudent) return 'bg-purple-100 text-purple-700';
    if (isParent) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <School className="h-6 w-6 text-white" />
        </div>
        {!collapsed && <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border">
            <Menu className="h-3 w-3" />
          </button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <Separator />

      <div className="px-2 py-4 space-y-1">
        <button
          onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Profile</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block border-r bg-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <School className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
              </div>
            </div>
            <Separator />
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <Separator />
            <div className="px-2 py-4 space-y-1">
              <button
                onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-lg font-semibold text-gray-900">
              {visibleNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white">
                  {unreadCount}
                </Badge>
              )}
            </button>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                <Badge className={`text-xs ${getRoleBadgeColor()}`}>{getRoleLabel()}</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
          {FOOTER_TEXT}
        </footer>
      </div>
    </div>
  );
}
