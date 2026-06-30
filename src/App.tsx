import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '@/application/hooks/useAuth';
import { UserRole } from '@/domain/enums';
import { AppLayout } from '@/presentation/layouts/AppLayout';
import { LoginPage } from '@/presentation/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/presentation/pages/auth/ForgotPasswordPage';
import { AdminDashboardPage } from '@/presentation/pages/admin/AdminDashboardPage';
import { InstitutesPage } from '@/presentation/pages/admin/InstitutesPage';
import { AuditLogsPage } from '@/presentation/pages/admin/AuditLogsPage';
import { ManagerDashboardPage } from '@/presentation/pages/manager/ManagerDashboardPage';
import { TeachersPage } from '@/presentation/pages/manager/TeachersPage';
import { StudentsPage } from '@/presentation/pages/manager/StudentsPage';
import { ParentsPage } from '@/presentation/pages/manager/ParentsPage';
import { SubjectsPage } from '@/presentation/pages/manager/SubjectsPage';
import { CoursesPage } from '@/presentation/pages/manager/CoursesPage';
import { EnrollmentsPage } from '@/presentation/pages/manager/EnrollmentsPage';
import { SchedulesPage } from '@/presentation/pages/manager/SchedulesPage';
import { AttendancePage } from '@/presentation/pages/manager/AttendancePage';
import { GradesPage } from '@/presentation/pages/manager/GradesPage';
import { AssignmentsPage } from '@/presentation/pages/manager/AssignmentsPage';
import { TeacherDashboardPage } from '@/presentation/pages/teacher/TeacherDashboardPage';
import { TeacherCoursesPage } from '@/presentation/pages/teacher/TeacherCoursesPage';
import { TeacherAttendancePage } from '@/presentation/pages/teacher/TeacherAttendancePage';
import { TeacherGradesPage } from '@/presentation/pages/teacher/TeacherGradesPage';
import { StudentDashboardPage } from '@/presentation/pages/student/StudentDashboardPage';
import { StudentCoursesPage } from '@/presentation/pages/student/StudentCoursesPage';
import { StudentSchedulePage } from '@/presentation/pages/student/StudentSchedulePage';
import { StudentGradesPage } from '@/presentation/pages/student/StudentGradesPage';
import { ParentDashboardPage } from '@/presentation/pages/parent/ParentDashboardPage';
import { ParentChildrenPage } from '@/presentation/pages/parent/ParentChildrenPage';
import { NotificationsPage } from '@/presentation/pages/shared/NotificationsPage';
import { ProfilePage } from '@/presentation/pages/shared/ProfilePage';
import { NotFoundPage } from '@/presentation/pages/shared/NotFoundPage';

function RoleRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { canAccess, dashboardPath, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  if (!canAccess(allowedRoles)) return <Navigate to={dashboardPath} replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<AuthRoute><AppLayout /></AuthRoute>}>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/institutes" element={<RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}><InstitutesPage /></RoleRoute>} />
        <Route path="/admin/audit-logs" element={<RoleRoute allowedRoles={[UserRole.SUPER_ADMIN]}><AuditLogsPage /></RoleRoute>} />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><ManagerDashboardPage /></RoleRoute>} />
        <Route path="/manager/teachers" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><TeachersPage /></RoleRoute>} />
        <Route path="/manager/students" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><StudentsPage /></RoleRoute>} />
        <Route path="/manager/parents" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><ParentsPage /></RoleRoute>} />
        <Route path="/manager/subjects" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><SubjectsPage /></RoleRoute>} />
        <Route path="/manager/courses" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><CoursesPage /></RoleRoute>} />
        <Route path="/manager/enrollments" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><EnrollmentsPage /></RoleRoute>} />
        <Route path="/manager/schedules" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><SchedulesPage /></RoleRoute>} />
        <Route path="/manager/attendance" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><AttendancePage /></RoleRoute>} />
        <Route path="/manager/grades" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><GradesPage /></RoleRoute>} />
        <Route path="/manager/assignments" element={<RoleRoute allowedRoles={[UserRole.INSTITUTE_MANAGER]}><AssignmentsPage /></RoleRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<RoleRoute allowedRoles={[UserRole.TEACHER]}><TeacherDashboardPage /></RoleRoute>} />
        <Route path="/teacher/courses" element={<RoleRoute allowedRoles={[UserRole.TEACHER]}><TeacherCoursesPage /></RoleRoute>} />
        <Route path="/teacher/attendance" element={<RoleRoute allowedRoles={[UserRole.TEACHER]}><TeacherAttendancePage /></RoleRoute>} />
        <Route path="/teacher/grades" element={<RoleRoute allowedRoles={[UserRole.TEACHER]}><TeacherGradesPage /></RoleRoute>} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<RoleRoute allowedRoles={[UserRole.STUDENT]}><StudentDashboardPage /></RoleRoute>} />
        <Route path="/student/courses" element={<RoleRoute allowedRoles={[UserRole.STUDENT]}><StudentCoursesPage /></RoleRoute>} />
        <Route path="/student/schedule" element={<RoleRoute allowedRoles={[UserRole.STUDENT]}><StudentSchedulePage /></RoleRoute>} />
        <Route path="/student/grades" element={<RoleRoute allowedRoles={[UserRole.STUDENT]}><StudentGradesPage /></RoleRoute>} />

        {/* Parent Routes */}
        <Route path="/parent/dashboard" element={<RoleRoute allowedRoles={[UserRole.PARENT]}><ParentDashboardPage /></RoleRoute>} />
        <Route path="/parent/children" element={<RoleRoute allowedRoles={[UserRole.PARENT]}><ParentChildrenPage /></RoleRoute>} />

        {/* Shared Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<DefaultRedirect />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const { isAuthenticated, user, loading, dashboardPath } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.role) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPath} replace />;
}
