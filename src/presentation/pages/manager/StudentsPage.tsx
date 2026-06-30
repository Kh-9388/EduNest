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
import { Gender, UserRole, UserStatus } from '@/domain/enums';
import { Search, Plus, GraduationCap, Pencil } from 'lucide-react';
import type { Student, PaginatedResponse, QueryFilters } from '@/domain/types';

export function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<PaginatedResponse<Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10, search: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', student_code: '', gender: '', grade_level: '', birth_date: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const f = user?.institute_id ? { ...filters, institute_id: user.institute_id } : filters;
      const data = await repositories.students.findWithUser(f);
      setStudents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page, filters.search]);

  const handleCreate = async () => {
    if (!user?.institute_id) return;
    try {
      const u = await repositories.users.create({ email: form.email, full_name: form.full_name, phone: form.phone || null, role: UserRole.STUDENT, status: UserStatus.ACTIVE, institute_id: user.institute_id } as Record<string, unknown>);
      await repositories.students.create({ user_id: u.id, institute_id: user.institute_id, student_code: form.student_code, gender: form.gender as Gender, grade_level: form.grade_level, birth_date: form.birth_date || null });
      setShowAdd(false); setForm({ full_name: '', email: '', phone: '', student_code: '', gender: '', grade_level: '', birth_date: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  const statusBadge = (s: string) => {
    switch (s) { case 'active': return <Badge className="bg-green-100 text-green-700">{s}</Badge>; case 'graduated': return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; case 'suspended': return <Badge className="bg-red-100 text-red-700">{s}</Badge>; default: return <Badge>{s}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Students</h2><p className="text-sm text-gray-500 mt-1">Manage enrolled students</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Student</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Student Code</Label><Input value={form.student_code} onChange={e => setForm({ ...form, student_code: e.target.value })} /></div>
                <div className="space-y-2"><Label>Grade Level</Label><Input value={form.grade_level} onChange={e => setForm({ ...form, grade_level: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Gender</Label><Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(Gender).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Birth Date</Label><Input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search students..." value={filters.search || ''} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} className="pl-10 max-w-md" /></div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Code</th><th className="px-4 py-3 text-left font-medium text-gray-500">Grade</th><th className="px-4 py-3 text-left font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left font-medium text-gray-500">Gender</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                students?.data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No students found</td></tr> :
                students?.data.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100"><GraduationCap className="h-4 w-4 text-purple-600" /></div><div><p className="font-medium text-gray-900">{(s as Student & { user?: { full_name: string } }).user?.full_name || 'Unknown'}</p><p className="text-xs text-gray-500">{(s as Student & { user?: { email: string } }).user?.email}</p></div></div></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.student_code}</td>
                    <td className="px-4 py-3 text-gray-600">{s.grade_level || 'N/A'}</td>
                    <td className="px-4 py-3">{statusBadge(s.academic_status)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{s.gender || 'N/A'}</td>
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
