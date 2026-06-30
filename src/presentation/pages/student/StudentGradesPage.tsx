import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Award, TrendingUp, BookOpen } from 'lucide-react';
import type { Grade, Student } from '@/domain/types';

export function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgGrade, setAvgGrade] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: studentData } = await repositories.students.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const student = studentData[0];
        if (student) {
          const gData = await repositories.grades.findByStudent(student.id);
          setGrades(gData);
          const avg = gData.length ? gData.reduce((sum, g) => sum + g.percentage, 0) / gData.length : 0;
          setAvgGrade(Math.round(avg * 100) / 100);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  const gradeColor = (p: number) => p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const gradeText = (p: number) => p >= 80 ? 'text-green-700' : p >= 60 ? 'text-yellow-700' : 'text-red-700';

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">My Grades</h2><p className="text-sm text-gray-500 mt-1">View your academic performance</p></div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100"><Award className="h-6 w-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Average Grade</p><p className="text-2xl font-bold text-gray-900">{avgGrade}%</p></div>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"><BookOpen className="h-6 w-6 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Total Grades</p><p className="text-2xl font-bold text-gray-900">{grades.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"><TrendingUp className="h-6 w-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Highest</p><p className="text-2xl font-bold text-gray-900">{grades.length ? Math.max(...grades.map(g => g.percentage)) : 0}%</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Assignment</th><th className="px-4 py-3 text-left font-medium text-gray-500">Grade</th><th className="px-4 py-3 text-left font-medium text-gray-500">%</th><th className="px-4 py-3 text-left font-medium text-gray-500">Letter</th><th className="px-4 py-3 text-left font-medium text-gray-500">Feedback</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                grades.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No grades recorded yet</td></tr> :
                grades.map(g => (
                  <tr key={g.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{(g as Grade & { course?: { name: string } }).course?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{(g as Grade & { assignment?: { title: string } }).assignment?.title || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{g.grade}/{g.max_grade}</td>
                    <td className="px-4 py-3"><Badge className={gradeText(g.percentage)}>{g.percentage}%</Badge></td>
                    <td className="px-4 py-3 font-bold">{g.letter_grade}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{g.feedback || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
