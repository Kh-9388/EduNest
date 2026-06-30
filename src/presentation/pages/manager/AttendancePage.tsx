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
import { Plus, ClipboardCheck, Pencil } from 'lucide-react';
import type { Attendance, PaginatedResponse, QueryFilters, Student, Course } from '@/domain/types';

export function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<PaginatedResponse<Attendance> | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', session_date: '', status: 'present', notes: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [aData, sData, cData] = await Promise.all([
        repositories.attendance.findWithRelations({ ...filters, institute_id: user?.institute_id }),
        repositories.students.findWithUser({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
        repositories.courses.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setAttendance(aData);
      setStudents(sData.data);
      setCourses(cData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page]);

  const handleCreate = async () => {
    try {
      await repositories.attendance.create({ student_id: form.student_id, course_id: form.course_id, session_date: form.session_date, status: form.status as never, notes: form.notes, recorded_by: user?.id });
      setShowAdd(false); setForm({ student_id: '', course_id: '', session_date: '', status: 'present', notes: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  const statusBadge = (s: string) => {
    switch (s) { case 'present': return <Badge className="bg-green-100 text-green-700">{s}</Badge>; case 'absent': return <Badge className="bg-red-100 text-red-700">{s}</Badge>; case 'late': return <Badge className="bg-yellow-100 text-yellow-700">{s}</Badge>; case 'excused': return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; default: return <Badge>{s}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Attendance</h2><p className="text-sm text-gray-500 mt-1">Track student attendance</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Record Attendance</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Attendance</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Student</Label><Select value={form.student_id} onValueChange={v => setForm({ ...form, student_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{(s as Student & { user?: { full_name: string } }).user?.full_name || s.id}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Course</Label><Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['present', 'absent', 'late', 'excused'].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Date</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left font-medium text-gray-500">Notes</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                attendance?.data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No attendance records found</td></tr> :
                attendance?.data.map(a => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{(a as Attendance & { student?: { user?: { full_name: string } } }).student?.user?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-600">{(a as Attendance & { course?: { name: string } }).course?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.session_date}</td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{a.notes || '-'}</td>
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
