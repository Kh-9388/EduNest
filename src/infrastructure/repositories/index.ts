import { supabase } from '@/infrastructure/supabase/client';
import { BaseRepository } from './base.repository';
import type { QueryFilters, PaginatedResponse } from '@/domain/types';
import type {
  Institute, User, Teacher, Student, Parent, ParentStudentLink,
  Subject, Course, Enrollment, Schedule, Attendance, Assignment,
  Grade, Notification, AuditLog, Setting, SubscriptionPlanRef, DashboardStats,
} from '@/domain/types';

export class InstituteRepository extends BaseRepository<Institute> {
  constructor() { super('institutes'); }

  async findBySlug(slug: string): Promise<Institute | null> {
    const { data, error } = await supabase.from('institutes').select('*').eq('slug', slug).single();
    if (error) return null;
    return data as Institute;
  }
}

export class UserRepository extends BaseRepository<User> {
  constructor() { super('users'); }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data as User;
  }

  async findByInstitute(instituteId: string, filters?: QueryFilters): Promise<PaginatedResponse<User>> {
    return this.findAll({ ...filters, institute_id: instituteId });
  }

  async findByRole(role: string, instituteId?: string): Promise<User[]> {
    let query = supabase.from('users').select('*').eq('role', role);
    if (instituteId) query = query.eq('institute_id', instituteId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as User[];
  }
}

export class TeacherRepository extends BaseRepository<Teacher> {
  constructor() { super('teachers'); }

  async findWithUser(filters?: QueryFilters): Promise<PaginatedResponse<Teacher>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('teachers').select('*, user:users(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    if (filters?.search) {
      query = query.or(`specialization.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Teacher[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class StudentRepository extends BaseRepository<Student> {
  constructor() { super('students'); }

  async findWithUser(filters?: QueryFilters): Promise<PaginatedResponse<Student>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('students').select('*, user:users(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    if (filters?.search) {
      query = query.or(`student_code.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Student[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class ParentRepository extends BaseRepository<Parent> {
  constructor() { super('parents'); }

  async findWithUser(filters?: QueryFilters): Promise<PaginatedResponse<Parent>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('parents').select('*, user:users(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    if (filters?.search) {
      query = query.or(`relationship.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Parent[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class ParentStudentLinkRepository extends BaseRepository<ParentStudentLink> {
  constructor() { super('parent_student'); }

  async findByParent(parentId: string): Promise<ParentStudentLink[]> {
    const { data, error } = await supabase.from('parent_student').select('*, student:students(*)').eq('parent_id', parentId);
    if (error) throw new Error(error.message);
    return (data || []) as unknown as ParentStudentLink[];
  }

  async findByStudent(studentId: string): Promise<ParentStudentLink[]> {
    const { data, error } = await supabase.from('parent_student').select('*, parent:parents(*)').eq('student_id', studentId);
    if (error) throw new Error(error.message);
    return (data || []) as unknown as ParentStudentLink[];
  }
}

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() { super('subjects'); }
}

export class CourseRepository extends BaseRepository<Course> {
  constructor() { super('courses'); }

  async findWithRelations(filters?: QueryFilters): Promise<PaginatedResponse<Course>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('courses').select('*, subject:subjects(*), teacher:teachers(*, user:users(*))', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Course[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() { super('enrollments'); }

  async findWithRelations(filters?: QueryFilters): Promise<PaginatedResponse<Enrollment>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('enrollments').select('*, student:students(*, user:users(*)), course:courses(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Enrollment[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class ScheduleRepository extends BaseRepository<Schedule> {
  constructor() { super('schedules'); }

  async findByCourse(courseId: string): Promise<Schedule[]> {
    const { data, error } = await supabase.from('schedules').select('*, course:courses(*)').eq('course_id', courseId).order('day_of_week').order('start_time');
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Schedule[];
  }

  async findByDay(dayOfWeek: number): Promise<Schedule[]> {
    const { data, error } = await supabase.from('schedules').select('*, course:courses(*)').eq('day_of_week', dayOfWeek).order('start_time');
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Schedule[];
  }
}

export class AttendanceRepository extends BaseRepository<Attendance> {
  constructor() { super('attendance'); }

  async findWithRelations(filters?: QueryFilters): Promise<PaginatedResponse<Attendance>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('attendance').select('*, student:students(*, user:users(*)), course:courses(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query.range(from, to).order('session_date', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Attendance[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<Attendance[]> {
    const { data, error } = await supabase.from('attendance').select('*').eq('student_id', studentId).eq('course_id', courseId).order('session_date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Attendance[];
  }

  async getStats(courseId?: string, studentId?: string): Promise<{ total: number; present: number; absent: number; late: number; excused: number; rate: number }> {
    let query = supabase.from('attendance').select('*');
    if (courseId) query = query.eq('course_id', courseId);
    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const records = data || [];
    const total = records.length;
    const present = records.filter((r: { status: string }) => r.status === 'present').length;
    const absent = records.filter((r: { status: string }) => r.status === 'absent').length;
    const late = records.filter((r: { status: string }) => r.status === 'late').length;
    const excused = records.filter((r: { status: string }) => r.status === 'excused').length;

    return { total, present, absent, late, excused, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  }
}

export class AssignmentRepository extends BaseRepository<Assignment> {
  constructor() { super('assignments'); }

  async findByCourse(courseId: string): Promise<Assignment[]> {
    const { data, error } = await supabase.from('assignments').select('*, course:courses(*), teacher:teachers(*, user:users(*))').eq('course_id', courseId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Assignment[];
  }
}

export class GradeRepository extends BaseRepository<Grade> {
  constructor() { super('grades'); }

  async findWithRelations(filters?: QueryFilters): Promise<PaginatedResponse<Grade>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('grades').select('*, student:students(*, user:users(*)), course:courses(*), assignment:assignments(*)', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as unknown as Grade[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async findByStudent(studentId: string): Promise<Grade[]> {
    const { data, error } = await supabase.from('grades').select('*, course:courses(*), assignment:assignments(*)').eq('student_id', studentId);
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Grade[];
  }

  async getAverageGrade(studentId?: string, courseId?: string): Promise<number> {
    let query = supabase.from('grades').select('percentage');
    if (studentId) query = query.eq('student_id', studentId);
    if (courseId) query = query.eq('course_id', courseId);

    const { data, error } = await query;
    if (error || !data?.length) return 0;

    const avg = data.reduce((sum: number, g: { percentage: number }) => sum + (g.percentage || 0), 0) / data.length;
    return Math.round(avg * 100) / 100;
  }
}

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() { super('notifications'); }

  async findByReceiver(receiverId: string, unreadOnly = false): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*').eq('receiver_id', receiverId);
    if (unreadOnly) query = query.eq('is_read', false);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Notification[];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() } as never).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async markAllAsRead(receiverId: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() } as never).eq('receiver_id', receiverId);
    if (error) throw new Error(error.message);
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('receiver_id', receiverId).eq('is_read', false);
    if (error) throw new Error(error.message);
    return count || 0;
  }
}

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() { super('audit_logs'); }

  async findWithFilters(filters?: QueryFilters): Promise<PaginatedResponse<AuditLog>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return {
      data: (data || []) as AuditLog[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }
}

export class SettingRepository extends BaseRepository<Setting> {
  constructor() { super('settings'); }

  async findByInstitute(instituteId: string): Promise<Setting[]> {
    const { data, error } = await supabase.from('settings').select('*').eq('institute_id', instituteId);
    if (error) throw new Error(error.message);
    return (data || []) as Setting[];
  }

  async findByKey(instituteId: string, key: string): Promise<Setting | null> {
    const { data, error } = await supabase.from('settings').select('*').eq('institute_id', instituteId).eq('key', key).single();
    if (error) return null;
    return data as Setting;
  }
}

export class DashboardRepository {
  async getAdminStats(): Promise<DashboardStats> {
    const { data: institutes } = await supabase.from('institutes').select('*', { count: 'exact', head: true });
    const { data: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { data: teachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    const { data: students } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { data: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { data: enrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });

    return {
      total_institutes: institutes?.length || 0,
      total_teachers: teachers?.length || 0,
      total_students: students?.length || 0,
      total_courses: courses?.length || 0,
      total_enrollments: enrollments?.length || 0,
    };
  }

  async getManagerStats(instituteId: string): Promise<DashboardStats> {
    const { data: teachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('institute_id', instituteId);
    const { data: students } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('institute_id', instituteId);
    const { data: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('institute_id', instituteId);
    const { data: activeCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('institute_id', instituteId).eq('status', 'active');
    const { data: upcomingCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('institute_id', instituteId).eq('status', 'upcoming');
    const { data: enrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active');

    return {
      total_teachers: teachers?.length || 0,
      total_students: students?.length || 0,
      total_courses: courses?.length || 0,
      active_courses: activeCourses?.length || 0,
      upcoming_courses: upcomingCourses?.length || 0,
      total_enrollments: enrollments?.length || 0,
    };
  }

  async getTeacherStats(teacherId: string): Promise<DashboardStats> {
    const { data: courses } = await supabase.from('courses').select('*').eq('teacher_id', teacherId);
    const { data: assignments } = await supabase.from('assignments').select('*').eq('teacher_id', teacherId);
    const { data: grades } = await supabase.from('grades').select('*').eq('graded_by', teacherId);

    return {
      total_courses: courses?.length || 0,
      total_assignments: assignments?.length || 0,
      published_assignments: assignments?.filter((a: { is_published: boolean }) => a.is_published).length || 0,
    };
  }

  async getStudentStats(studentId: string): Promise<DashboardStats> {
    const { data: enrollments } = await supabase.from('enrollments').select('*, course:courses(*)').eq('student_id', studentId).eq('status', 'active');
    const { data: grades } = await supabase.from('grades').select('*').eq('student_id', studentId);
    const { data: notifications } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);

    const avgGrade = grades?.length ? grades.reduce((sum: number, g: { percentage: number }) => sum + (g.percentage || 0), 0) / grades.length : 0;

    return {
      total_enrollments: enrollments?.length || 0,
      average_grade: Math.round(avgGrade * 100) / 100,
      unread_notifications: notifications?.length || 0,
    };
  }

  async getParentStats(parentUserId: string): Promise<DashboardStats> {
    const { data: parent } = await supabase.from('parents').select('*').eq('user_id', parentUserId).single() as { data: { id: string } | null };
    if (!parent) return {};

    const { data: links } = await supabase.from('parent_student').select('*, student:students(*)').eq('parent_id', parent.id);
    const unreadCount = await new NotificationRepository().getUnreadCount(parentUserId);

    return {
      total_students: links?.length || 0,
      unread_notifications: unreadCount,
    };
  }
}

export const repositories = {
  institutes: new InstituteRepository(),
  users: new UserRepository(),
  teachers: new TeacherRepository(),
  students: new StudentRepository(),
  parents: new ParentRepository(),
  parentStudentLinks: new ParentStudentLinkRepository(),
  subjects: new SubjectRepository(),
  courses: new CourseRepository(),
  enrollments: new EnrollmentRepository(),
  schedules: new ScheduleRepository(),
  attendance: new AttendanceRepository(),
  assignments: new AssignmentRepository(),
  grades: new GradeRepository(),
  notifications: new NotificationRepository(),
  auditLogs: new AuditLogRepository(),
  settings: new SettingRepository(),
  dashboard: new DashboardRepository(),
};
