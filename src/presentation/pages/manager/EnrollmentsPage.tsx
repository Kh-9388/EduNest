import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Plus, FileText, Pencil } from 'lucide-react';
import type { Enrollment, PaginatedResponse, QueryFilters, Student, Course } from '@/domain/types';

export function EnrollmentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<PaginatedResponse<Enrollment> | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eData, sData, cData] = await Promise.all([
        repositories.enrollments.findWithRelations(filters),
        repositories.students.findWithUser({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
        repositories.courses.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setEnrollments(eData);
      setStudents(sData.data);
      setCourses(cData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page]);

  const handleCreate = async () => {
    try {
      await repositories.enrollments.create({ student_id: form.student_id, course_id: form.course_id });
      setShowAdd(false); setForm({ student_id: '', course_id: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  const statusBadge = (s: string) => {
    switch (s) { case 'active': return <Badge className="bg-green-100 text-green-700">{s}</Badge>; case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">{s}</Badge>; case 'completed': return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; case 'dropped': return <Badge className="bg-red-100 text-red-700">{s}</Badge>; default: return <Badge>{s}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Enrollments</h2><p className="text-sm text-gray-500 mt-1">Manage student enrollments</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Enroll Student</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Enroll Student in Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Student</Label><Select value={form.student_id} onValueChange={v => setForm({ ...form, student_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{(s as Student & { user?: { full_name: string } }).user?.full_name || s.id}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Course</Label><Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Enroll</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left font-medium text-gray-500">Date</th><th className="px-4 py-3 text-left font-medium text-gray-500">Grade</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                enrollments?.data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No enrollments found</td></tr> :
                enrollments?.data.map(e => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">{(e as Enrollment & { student?: { user?: { full_name: string } } }).student?.user?.full_name?.charAt(0) || 'S'}</div><p className="font-medium text-gray-900">{(e as Enrollment & { student?: { user?: { full_name: string } } }).student?.user?.full_name || 'Unknown'}</p></div></td>
                    <td className="px-4 py-3 text-gray-600">{(e as Enrollment & { course?: { name: string } }).course?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{statusBadge(e.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.enrollment_date}</td>
                    <td className="px-4 py-3 text-gray-600">{e.final_grade != null ? e.final_grade : '-'}</td>
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
