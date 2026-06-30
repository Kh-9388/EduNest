import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Award, Plus } from 'lucide-react';
import type { Course, Student, Assignment, Grade, Enrollment } from '@/domain/types';

export function TeacherGradesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [gradeMap, setGradeMap] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: teacherData } = await repositories.teachers.findAll({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const teacher = teacherData[0];
        if (teacher) {
          const cData = await repositories.courses.findAll({ institute_id: user.institute_id, teacher_id: teacher.id, page: 1, pageSize: 100 });
          setCourses(cData.data);
          if (cData.data.length > 0) setSelectedCourse(cData.data[0].id);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedCourse) return;
      try {
        const [eData, aData] = await Promise.all([
          repositories.enrollments.findWithRelations({ course_id: selectedCourse, status: 'active', page: 1, pageSize: 100 }),
          repositories.assignments.findByCourse(selectedCourse),
        ]);
        const studs = eData.data.map((e: Enrollment & { student?: Student }) => e.student).filter(Boolean) as Student[];
        setStudents(studs);
        setAssignments(aData);
        if (aData.length > 0) setSelectedAssignment(aData[0].id);
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [selectedCourse]);

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedAssignment) return;
    try {
      for (const [studentId, data] of Object.entries(gradeMap)) {
        if (data.grade) {
          const assignment = assignments.find(a => a.id === selectedAssignment);
          await repositories.grades.create({ student_id: studentId, course_id: selectedCourse, assignment_id: selectedAssignment, grade: parseFloat(data.grade), max_grade: assignment?.max_score || 100, feedback: data.feedback, graded_by: user?.id });
        }
      }
      setShowDialog(true);
      setGradeMap({});
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Enter Grades</h2><p className="text-sm text-gray-500 mt-1">Record student grades for assignments</p></div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignment</Label>
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{assignments.map(a => <SelectItem key={a.id} value={a.id}>{a.title} ({a.max_score} pts)</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Code</th><th className="px-4 py-3 text-left font-medium text-gray-500">Grade</th><th className="px-4 py-3 text-left font-medium text-gray-500">Feedback</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                students.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No students enrolled</td></tr> :
                students.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{(s as Student & { user?: { full_name: string } }).user?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.student_code}</td>
                    <td className="px-4 py-3">
                      <Input type="number" step="0.1" className="w-24 h-8" value={gradeMap[s.id]?.grade || ''} onChange={e => setGradeMap({ ...gradeMap, [s.id]: { ...gradeMap[s.id], grade: e.target.value } })} />
                    </td>
                    <td className="px-4 py-3">
                      <Input className="w-48 h-8" placeholder="Feedback..." value={gradeMap[s.id]?.feedback || ''} onChange={e => setGradeMap({ ...gradeMap, [s.id]: { ...gradeMap[s.id], feedback: e.target.value } })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Award className="mr-2 h-4 w-4" />
            Submit Grades
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grades Recorded</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Grades have been recorded successfully.</p>
          <Button onClick={() => setShowDialog(false)} className="w-full bg-blue-600 hover:bg-blue-700">OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
