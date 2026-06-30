import type { UserRole, UserStatus, InstituteStatus, SubscriptionPlan, CourseStatus, EnrollmentStatus, AttendanceStatus, AssignmentType, NotificationType, NotificationPriority, AuditAction, AuditSeverity, Gender, ParentRelationship, AcademicStatus, DayOfWeek, FileEntityType } from '@/domain/enums';

export interface Institute {
  id: string;
  name: string;
  slug: string;
  status: InstituteStatus;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  language: string;
  max_teachers: number;
  max_students: number;
  max_courses: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  institute_id: string | null;
  role: UserRole;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  institute_id: string;
  specialization: string | null;
  bio: string | null;
  qualifications: Record<string, unknown>[];
  experience_years: number;
  hourly_rate: number | null;
  hire_date: string | null;
  employee_id: string | null;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  institute_id: string;
  student_code: string;
  birth_date: string | null;
  gender: Gender | null;
  enrollment_date: string;
  grade_level: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_notes: string | null;
  academic_status: AcademicStatus;
  user?: User;
  parents?: Parent[];
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: string;
  user_id: string;
  institute_id: string;
  occupation: string | null;
  relationship: ParentRelationship | null;
  address: string | null;
  work_phone: string | null;
  user?: User;
  children?: Student[];
  created_at: string;
  updated_at: string;
}

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  is_primary: boolean;
  can_pickup: boolean;
  can_view_grades: boolean;
  can_view_attendance: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  institute_id: string;
  name: string;
  code: string | null;
  description: string | null;
  credits: number;
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  institute_id: string;
  subject_id: string;
  teacher_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  capacity: number;
  enrolled_count: number;
  price: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: CourseStatus;
  syllabus: string | null;
  requirements: string | null;
  materials: Record<string, unknown>[];
  cover_image_url: string | null;
  subject?: Subject;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrollment_date: string;
  completion_date: string | null;
  final_grade: number | null;
  notes: string | null;
  student?: Student;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  course_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room_name: string | null;
  building: string | null;
  is_recurring: boolean;
  specific_date: string | null;
  notes: string | null;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  session_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  recorded_by: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  student?: Student;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  teacher_id: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  type: AssignmentType;
  max_score: number;
  weight: number;
  due_date: string | null;
  allow_late_submission: boolean;
  late_penalty_percent: number;
  attachments: Record<string, unknown>[];
  is_published: boolean;
  published_at: string | null;
  course?: Course;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  assignment_id: string | null;
  grade: number;
  max_grade: number;
  percentage: number;
  letter_grade: string;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  is_final: boolean;
  student?: Student;
  course?: Course;
  assignment?: Assignment;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  institute_id: string;
  receiver_id: string;
  sender_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  priority: NotificationPriority;
  action_url: string | null;
  push_sent: boolean;
  push_delivered: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  institute_id: string | null;
  user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: AuditAction;
  entity: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changes_summary: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  session_id: string | null;
  severity: AuditSeverity;
  created_at: string;
}

export interface SubscriptionPlanRef {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_teachers: number | null;
  max_students: number | null;
  max_courses: number | null;
  max_storage_mb: number | null;
  features: Record<string, unknown>[];
  is_active: boolean;
  created_at: string;
}

export interface FileAttachment {
  id: string;
  institute_id: string;
  uploaded_by: string;
  entity_type: FileEntityType;
  entity_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  public_url: string | null;
  description: string | null;
  created_at: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_info: Record<string, unknown>;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  institute_id: string;
  key: string;
  value: Record<string, unknown>;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_institutes?: number;
  total_teachers?: number;
  total_students?: number;
  total_courses?: number;
  total_enrollments?: number;
  active_courses?: number;
  upcoming_courses?: number;
  completed_courses?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  excused_count?: number;
  average_grade?: number;
  total_assignments?: number;
  published_assignments?: number;
  pending_assignments?: number;
  unread_notifications?: number;
  recent_audit_logs?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  institute_id: string | null;
  full_name: string;
  avatar_url: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}
