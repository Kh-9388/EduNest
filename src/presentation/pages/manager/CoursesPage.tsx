import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Search, Plus, School, Pencil, Users } from 'lucide-react';
import type { Course, PaginatedResponse, QueryFilters, Subject, Teacher } from '@/domain/types';

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<PaginatedResponse<Course> | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10, search: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', subject_id: '', teacher_id: '', description: '', capacity: '30', start_date: '', end_date: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const f = user?.institute_id ? { ...filters, institute_id: user.institute_id } : filters;
      const [cData, sData, tData] = await Promise.all([
        repositories.courses.findWithRelations(f),
        repositories.subjects.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
        repositories.teachers.findWithUser({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setCourses(cData);
      setSubjects(sData.data);
      setTeachers(tData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page, filters.search]);

  const handleCreate = async () => {
    if (!user?.institute_id) return;
    try {
      await repositories.courses.create({ institute_id: user.institute_id, subject_id: form.subject_id, teacher_id: form.teacher_id || null, name: form.name, code: form.code, description: form.description, capacity: parseInt(form.capacity) || 30, start_date: form.start_date, end_date: form.end_date });
      setShowAdd(false); setForm({ name: '', code: '', subject_id: '', teacher_id: '', description: '', capacity: '30', start_date: '', end_date: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  const statusBadge = (s: string) => {
    switch (s) { case 'active': return <Badge className="bg-green-100 text-green-700">{s}</Badge>; case 'upcoming': return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; case 'completed': return <Badge className="bg-gray-100 text-gray-700">{s}</Badge>; case 'cancelled': return <Badge className="bg-red-100 text-red-700">{s}</Badge>; default: return <Badge>{s}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Courses</h2><p className="text-sm text-gray-500 mt-1">Manage course offerings</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Course</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Subject</Label><Select value={form.subject_id} onValueChange={v => setForm({ ...form, subject_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Teacher</Label><Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{(t as Teacher & { user?: { full_name: string } }).user?.full_name || t.id}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search courses..." value={filters.search || ''} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} className="pl-10 max-w-md" /></div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Subject</th><th className="px-4 py-3 text-left font-medium text-gray-500">Teacher</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left font-medium text-gray-500">Capacity</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                courses?.data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No courses found</td></tr> :
                courses?.data.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100"><School className="h-4 w-4 text-orange-600" /></div><div><p className="font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.code}</p></div></div></td>
                    <td className="px-4 py-3 text-gray-600">{(c as Course & { subject?: { name: string } }).subject?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{(c as Course & { teacher?: { user?: { full_name: string } } }).teacher?.user?.full_name || 'Unassigned'}</td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1"><Users className="h-3 w-3" />{c.enrolled_count}/{c.capacity}</div></td>
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
