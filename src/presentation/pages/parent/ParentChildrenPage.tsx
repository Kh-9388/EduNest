import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { GraduationCap, Award, CalendarDays, School } from 'lucide-react';
import type { ParentStudentLink, Student, Grade, Enrollment, Course } from '@/domain/types';

export function ParentChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ParentStudentLink[]>([]);
  const [childGrades, setChildGrades] = useState<Record<string, Grade[]>>({});
  const [childCourses, setChildCourses] = useState<Record<string, Enrollment[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: parentData } = await repositories.parents.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const parent = parentData[0];
        if (parent) {
          const cData = await repositories.parentStudentLinks.findByParent(parent.id);
          setChildren(cData);
          const grades: Record<string, Grade[]> = {};
          const courses: Record<string, Enrollment[]> = {};
          for (const link of cData) {
            const gData = await repositories.grades.findByStudent(link.student_id);
            grades[link.student_id] = gData;
            const eData = await repositories.enrollments.findWithRelations({ student_id: link.student_id, page: 1, pageSize: 100 });
            courses[link.student_id] = eData.data;
          }
          setChildGrades(grades);
          setChildCourses(courses);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const getAvgGrade = (studentId: string) => {
    const g = childGrades[studentId] || [];
    if (!g.length) return 0;
    return Math.round((g.reduce((sum, gr) => sum + gr.percentage, 0) / g.length) * 100) / 100;
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">My Children</h2><p className="text-sm text-gray-500 mt-1">View your children's academic progress</p></div>
      {loading ? Array.from({ length: 2 }).map((_, i) => <Card key={i} className="border-0 shadow-sm"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded animate-pulse" /></CardContent></Card>) :
      children.length === 0 ? <div className="text-center text-gray-500 py-8">No children linked</div> :
      children.map(c => {
        const student = (c as ParentStudentLink & { student?: Student }).student;
        if (!student) return null;
        const avg = getAvgGrade(student.id);
        const statusColor = avg >= 80 ? 'bg-green-500' : avg >= 60 ? 'bg-yellow-500' : 'bg-red-500';
        return (
          <Card key={c.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{(student as Student & { user?: { full_name: string } }).user?.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">Code: {student.student_code} | Grade: {student.grade_level || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Average Grade</p>
                  <p className={`text-2xl font-bold ${avg >= 80 ? 'text-green-600' : avg >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{avg}%</p>
                </div>
              </div>
              <Progress value={avg} className={`h-2 ${statusColor}`} />

              {c.can_view_grades && childGrades[student.id]?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Award className="h-4 w-4" />Recent Grades</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {childGrades[student.id].slice(0, 4).map(g => (
                      <div key={g.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-sm text-gray-600">{(g as Grade & { course?: { name: string } }).course?.name || 'N/A'}</span>
                        <Badge className={g.percentage >= 80 ? 'bg-green-100 text-green-700' : g.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{g.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {childCourses[student.id]?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><School className="h-4 w-4" />Enrolled Courses</h4>
                  <div className="flex flex-wrap gap-2">
                    {childCourses[student.id].map(e => (
                      <Badge key={e.id} variant="outline" className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />{(e as Enrollment & { course?: { name: string } }).course?.name || 'N/A'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
