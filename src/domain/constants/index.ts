export const APP_NAME = 'EduNest';
export const APP_VERSION = '1.0.0';
export const FOOTER_TEXT = 'Designed By Eng. Khaldoun Omar Ahmad';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
export const MAX_IMPORT_SIZE = 3 * 1024 * 1024; // 3MB

export const PASSWORD_MIN_LENGTH = 8;

export const JWT_EXPIRES_IN = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRES_IN = 604800; // 7 days

export const ACCOUNT_LOCKOUT_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_MINUTES = 30;

export const AUDIT_LOG_RETENTION_DAYS = 730; // 2 years
export const NOTIFICATION_RETENTION_DAYS = 90; // 90 days

export const SUBSCRIPTION_PLANS = {
  free: { max_teachers: 3, max_students: 30, max_courses: 5, storage_mb: 100 },
  basic: { max_teachers: 10, max_students: 100, max_courses: 20, storage_mb: 500 },
  pro: { max_teachers: 50, max_students: 500, max_courses: 100, storage_mb: 2000 },
} as const;

export const GRADING_SCALE = {
  A: { min: 90, max: 100 },
  B: { min: 80, max: 89 },
  C: { min: 70, max: 79 },
  D: { min: 60, max: 69 },
  F: { min: 0, max: 59 },
} as const;

export const ATTENDANCE_THRESHOLD = {
  warning: 80,
  critical: 70,
} as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const;

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    INSTITUTES: '/admin/institutes',
    AUDIT_LOGS: '/admin/audit-logs',
    SETTINGS: '/admin/settings',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    TEACHERS: '/manager/teachers',
    STUDENTS: '/manager/students',
    PARENTS: '/manager/parents',
    SUBJECTS: '/manager/subjects',
    COURSES: '/manager/courses',
    ENROLLMENTS: '/manager/enrollments',
    SCHEDULES: '/manager/schedules',
    ATTENDANCE: '/manager/attendance',
    GRADES: '/manager/grades',
    ASSIGNMENTS: '/manager/assignments',
    REPORTS: '/manager/reports',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    COURSES: '/teacher/courses',
    ATTENDANCE: '/teacher/attendance',
    GRADES: '/teacher/grades',
    ASSIGNMENTS: '/teacher/assignments',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    SCHEDULE: '/student/schedule',
    GRADES: '/student/grades',
    ASSIGNMENTS: '/student/assignments',
  },
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    CHILDREN: '/parent/children',
    ATTENDANCE: '/parent/attendance',
    GRADES: '/parent/grades',
    NOTIFICATIONS: '/parent/notifications',
  },
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;

export const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: ROUTES.ADMIN.DASHBOARD,
  institute_manager: ROUTES.MANAGER.DASHBOARD,
  teacher: ROUTES.TEACHER.DASHBOARD,
  student: ROUTES.STUDENT.DASHBOARD,
  parent: ROUTES.PARENT.DASHBOARD,
} as const;
