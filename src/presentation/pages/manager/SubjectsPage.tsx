import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { Search, Plus, BookOpen, Pencil } from 'lucide-react';
import type { Subject, PaginatedResponse, QueryFilters } from '@/domain/types';

export function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<PaginatedResponse<Subject> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10, search: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', credits: '3', color: '#2563EB' });

  const loadData = async () => {
    setLoading(true);
    try {
      const f = user?.institute_id ? { ...filters, institute_id: user.institute_id } : filters;
      const data = await repositories.subjects.findAll(f);
      setSubjects(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page, filters.search]);

  const handleCreate = async () => {
    if (!user?.institute_id) return;
    try {
      await repositories.subjects.create({ institute_id: user.institute_id, name: form.name, code: form.code, description: form.description, credits: parseInt(form.credits) || 3, color: form.color });
      setShowAdd(false); setForm({ name: '', code: '', description: '', credits: '3', color: '#2563EB' }); loadData();
    } catch (err) { console.error(err); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try { await repositories.subjects.update(id, { is_active: !current }); loadData(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Subjects</h2><p className="text-sm text-gray-500 mt-1">Manage academic subjects</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Subject</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Subject</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Credits</Label><Input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} /></div>
                <div className="space-y-2"><Label>Color</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10" /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search subjects..." value={filters.search || ''} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} className="pl-10 max-w-md" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Card key={i} className="border-0 shadow-sm"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded animate-pulse" /></CardContent></Card>) :
        subjects?.data.length === 0 ? <div className="col-span-full text-center text-gray-500 py-8">No subjects found</div> :
        subjects?.data.map(s => (
          <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                    <BookOpen className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.code} | {s.credits} credits</p>
                  </div>
                </div>
                <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s.id, s.is_active)} />
              </div>
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
