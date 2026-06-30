import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { AssignmentType } from '@/domain/enums';
import { Plus, NotebookPen, Pencil, CheckCircle } from 'lucide-react';
import type { Assignment, PaginatedResponse, QueryFilters, Course } from '@/domain/types';

export function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PaginatedResponse<Assignment> | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course_id: '', type: 'homework', max_score: '100', due_date: '', weight: '1' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [aData, cData] = await Promise.all([
        repositories.assignments.findAll({ ...filters, institute_id: user?.institute_id }),
        repositories.courses.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setAssignments(aData);
      setCourses(cData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page]);

  const handleCreate = async () => {
    try {
      await repositories.assignments.create({ course_id: form.course_id, title: form.title, description: form.description, type: form.type as AssignmentType, max_score: parseFloat(form.max_score) || 100, due_date: form.due_date, weight: parseFloat(form.weight) || 1, teacher_id: user?.id });
      setShowAdd(false); setForm({ title: '', description: '', course_id: '', type: 'homework', max_score: '100', due_date: '', weight: '1' }); loadData();
    } catch (err) { console.error(err); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try { await repositories.assignments.update(id, { is_published: !current }); loadData(); }
    catch (err) { console.error(err); }
  };

  const typeBadge = (t: string) => {
    switch (t) { case 'exam': return <Badge className="bg-red-100 text-red-700">{t}</Badge>; case 'quiz': return <Badge className="bg-yellow-100 text-yellow-700">{t}</Badge>; case 'homework': return <Badge className="bg-blue-100 text-blue-700">{t}</Badge>; case 'project': return <Badge className="bg-purple-100 text-purple-700">{t}</Badge>; default: return <Badge variant="outline">{t}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Assignments</h2><p className="text-sm text-gray-500 mt-1">Manage course assignments</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Assignment</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Course</Label><Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(AssignmentType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Max Score</Label><Input type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} /></div>
                <div className="space-y-2"><Label>Weight</Label><Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Title</th><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Type</th><th className="px-4 py-3 text-left font-medium text-gray-500">Max Score</th><th className="px-4 py-3 text-left font-medium text-gray-500">Due</th><th className="px-4 py-3 text-left font-medium text-gray-500">Published</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                assignments?.data.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No assignments found</td></tr> :
                assignments?.data.map(a => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-blue-600" /><p className="font-medium text-gray-900">{a.title}</p></div></td>
                    <td className="px-4 py-3 text-gray-600">{(a as Assignment & { course?: { name: string } }).course?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{typeBadge(a.type)}</td>
                    <td className="px-4 py-3 text-gray-600">{a.max_score}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.due_date || 'No due date'}</td>
                    <td className="px-4 py-3"><Switch checked={a.is_published} onCheckedChange={() => togglePublish(a.id, a.is_published)} /></td>
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
