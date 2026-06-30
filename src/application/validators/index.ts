import { z } from 'zod';
import { UserRole, UserStatus, InstituteStatus, SubscriptionPlan, AttendanceStatus, AssignmentType, NotificationType, NotificationPriority, Gender, ParentRelationship, AcademicStatus, DayOfWeek } from '@/domain/enums';
import { PASSWORD_MIN_LENGTH, MAX_FILE_SIZE } from '@/domain/constants';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const instituteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  status: z.nativeEnum(InstituteStatus).optional(),
  subscription_plan: z.nativeEnum(SubscriptionPlan).optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().nullable().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  max_teachers: z.number().int().min(1).optional(),
  max_students: z.number().int().min(1).optional(),
  max_courses: z.number().int().min(1).optional(),
  storage_limit_mb: z.number().int().min(1).optional(),
});

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  phone: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).optional(),
});

export const teacherSchema = z.object({
  user_id: z.string().uuid(),
  specialization: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  experience_years: z.number().int().min(0).optional(),
  hourly_rate: z.number().min(0).nullable().optional(),
  hire_date: z.string().nullable().optional(),
  employee_id: z.string().nullable().optional(),
});

export const studentSchema = z.object({
  user_id: z.string().uuid(),
  student_code: z.string().min(1, 'Student code is required'),
  birth_date: z.string().nullable().optional(),
  gender: z.nativeEnum(Gender).nullable().optional(),
  grade_level: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  medical_notes: z.string().nullable().optional(),
  academic_status: z.nativeEnum(AcademicStatus).optional(),
});

export const parentSchema = z.object({
  user_id: z.string().uuid(),
  occupation: z.string().nullable().optional(),
  relationship: z.nativeEnum(ParentRelationship).nullable().optional(),
  address: z.string().nullable().optional(),
  work_phone: z.string().nullable().optional(),
});

export const parentStudentLinkSchema = z.object({
  parent_id: z.string().uuid(),
  student_id: z.string().uuid(),
  is_primary: z.boolean().optional(),
  can_pickup: z.boolean().optional(),
  can_view_grades: z.boolean().optional(),
  can_view_attendance: z.boolean().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  credits: z.number().int().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().nullable().optional(),
});

export const courseSchema = z.object({
  subject_id: z.string().uuid(),
  teacher_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  capacity: z.number().int().min(1).default(30),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  syllabus: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
});

export const enrollmentSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  notes: z.string().nullable().optional(),
});

export const scheduleSchema = z.object({
  course_id: z.string().uuid(),
  day_of_week: z.nativeEnum(DayOfWeek),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  room_name: z.string().nullable().optional(),
  building: z.string().nullable().optional(),
  is_recurring: z.boolean().optional(),
  specific_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const attendanceSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  session_date: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  check_in_time: z.string().nullable().optional(),
  check_out_time: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const assignmentSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  type: z.nativeEnum(AssignmentType).optional(),
  max_score: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  due_date: z.string().nullable().optional(),
  allow_late_submission: z.boolean().optional(),
  late_penalty_percent: z.number().min(0).max(100).optional(),
});

export const gradeSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  assignment_id: z.string().uuid().nullable().optional(),
  grade: z.number().min(0, 'Grade must be at least 0'),
  max_grade: z.number().min(0).default(100),
  feedback: z.string().nullable().optional(),
  is_final: z.boolean().optional(),
});

export const notificationSchema = z.object({
  receiver_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((f) => f.size <= MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  description: z.string().nullable().optional(),
});

export const settingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.record(z.string(), z.any()),
  category: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type InstituteInput = z.infer<typeof instituteSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ParentInput = z.infer<typeof parentSchema>;
export type ParentStudentLinkInput = z.infer<typeof parentStudentLinkSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type SettingInput = z.infer<typeof settingSchema>;
