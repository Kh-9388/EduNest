import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Plus, Award, Pencil } from 'lucide-react';
import type { Grade, PaginatedResponse, QueryFilters, Student, Course, Assignment } from '@/domain/types';

export function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<PaginatedResponse<Grade> | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', assignment_id: '', grade: '', max_grade: '100', feedback: '', is_final: false });

  const loadData = async () => {
    setLoading(true);
    try {
      const [gData, sData, cData, aData] = await Promise.all([
        repositories.grades.findWithRelations({ ...filters, institute_id: user?.institute_id }),
        repositories.students.findWithUser({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
        repositories.courses.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
        repositories.assignments.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setGrades(gData);
      setStudents(sData.data);
      setCourses(cData.data);
      setAssignments(aData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page]);

  const handleCreate = async () => {
    try {
      await repositories.grades.create({ student_id: form.student_id, course_id: form.course_id, assignment_id: form.assignment_id || null, grade: parseFloat(form.grade), max_grade: parseFloat(form.max_grade) || 100, feedback: form.feedback, is_final: form.is_final, graded_by: user?.id });
      setShowAdd(false); setForm({ student_id: '', course_id: '', assignment_id: '', grade: '', max_grade: '100', feedback: '', is_final: false }); loadData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Grades</h2><p className="text-sm text-gray-500 mt-1">Manage student grades</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Grade</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Grade</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Student</Label><Select value={form.student_id} onValueChange={v => setForm({ ...form, student_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{(s as Student & { user?: { full_name: string } }).user?.full_name || s.id}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Course</Label><Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Assignment</Label><Select value={form.assignment_id} onValueChange={v => setForm({ ...form, assignment_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{assignments.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Grade</Label><Input type="number" step="0.1" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} /></div>
                <div className="space-y-2"><Label>Max Grade</Label><Input type="number" value={form.max_grade} onChange={e => setForm({ ...form, max_grade: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Feedback</Label><Input value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Record Grade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Assignment</th><th className="px-4 py-3 text-left font-medium text-gray-500">Grade</th><th className="px-4 py-3 text-left font-medium text-gray-500">%</th><th className="px-4 py-3 text-left font-medium text-gray-500">Letter</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                grades?.data.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No grades found</td></tr> :
                grades?.data.map(g => (
                  <tr key={g.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{(g as Grade & { student?: { user?: { full_name: string } } }).student?.user?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-600">{(g as Grade & { course?: { name: string } }).course?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{(g as Grade & { assignment?: { title: string } }).assignment?.title || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{g.grade}/{g.max_grade}</td>
                    <td className="px-4 py-3"><Badge className={g.percentage >= 80 ? 'bg-green-100 text-green-700' : g.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{g.percentage}%</Badge></td>
                    <td className="px-4 py-3 font-bold text-gray-700">{g.letter_grade}</td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button></td>
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
