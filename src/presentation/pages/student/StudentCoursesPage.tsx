import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { School, Users, Calendar } from 'lucide-react';
import type { Enrollment, Course } from '@/domain/types';

export function StudentCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: studentData } = await repositories.students.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const student = studentData[0];
        if (student) {
          const eData = await repositories.enrollments.findWithRelations({ student_id: student.id, page: 1, pageSize: 100 });
          setEnrollments(eData.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const statusBadge = (s: string) => {
    switch (s) { case 'active': return <Badge className="bg-green-100 text-green-700">{s}</Badge>; case 'completed': return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">{s}</Badge>; default: return <Badge>{s}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">My Courses</h2><p className="text-sm text-gray-500 mt-1">Your enrolled courses</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => <Card key={i} className="border-0 shadow-sm"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded animate-pulse" /></CardContent></Card>) :
        enrollments.length === 0 ? <div className="col-span-full text-center text-gray-500 py-8">No enrolled courses</div> :
        enrollments.map(e => {
          const course = (e as Enrollment & { course?: Course }).course;
          if (!course) return null;
          const fillPct = course.capacity > 0 ? Math.round((course.enrolled_count / course.capacity) * 100) : 0;
          return (
            <Card key={e.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <School className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.code}</p>
                  </div>
                  {statusBadge(e.status)}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled_count}/{course.capacity}</div>
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{course.start_date} - {course.end_date}</div>
                </div>
                <Progress value={fillPct} className="h-1.5" />
                <p className="text-xs text-gray-500 mt-1">{fillPct}% full</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
