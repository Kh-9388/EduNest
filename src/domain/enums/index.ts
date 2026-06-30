export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  INSTITUTE_MANAGER = 'institute_manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum InstituteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

export enum CourseStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum AssignmentType {
  HOMEWORK = 'homework',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project',
  LAB = 'lab',
  OTHER = 'other',
}

export enum NotificationType {
  NEW_GRADE = 'new_grade',
  NEW_ASSIGNMENT = 'new_assignment',
  ATTENDANCE_ALERT = 'attendance_alert',
  NEW_MESSAGE = 'new_message',
  SCHEDULE_CHANGED = 'schedule_changed',
  ENROLLMENT_UPDATE = 'enrollment_update',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  PERMISSION_CHANGE = 'permission_change',
  GRADE_CHANGE = 'grade_change',
  ATTENDANCE_CHANGE = 'attendance_change',
  IMPERSONATE = 'impersonate',
}

export enum AuditSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ParentRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

export enum AcademicStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum FileEntityType {
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
  STUDENT = 'student',
  TEACHER = 'teacher',
  INSTITUTE = 'institute',
}
