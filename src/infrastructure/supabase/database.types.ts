export type Database = {
  public: {
    Tables: {
      institutes: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      users: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      teachers: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      students: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      parents: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      parent_student: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      subjects: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      courses: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      enrollments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      schedules: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      attendance: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      assignments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      grades: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      notifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      audit_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      subscription_plans: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      files: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      push_tokens: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      settings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
