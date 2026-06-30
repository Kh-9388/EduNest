import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { UserRole, UserStatus } from '@/domain/enums';
import { Search, Plus, UserCheck, Pencil } from 'lucide-react';
import type { Parent, PaginatedResponse, QueryFilters } from '@/domain/types';

export function ParentsPage() {
  const { user } = useAuth();
  const [parents, setParents] = useState<PaginatedResponse<Parent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10, search: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', occupation: '', relationship: '', address: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const f = user?.institute_id ? { ...filters, institute_id: user.institute_id } : filters;
      const data = await repositories.parents.findWithUser(f);
      setParents(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page, filters.search]);

  const handleCreate = async () => {
    if (!user?.institute_id) return;
    try {
      const u = await repositories.users.create({ email: form.email, full_name: form.full_name, phone: form.phone || null, role: UserRole.PARENT, status: UserStatus.ACTIVE, institute_id: user.institute_id } as Record<string, unknown>);
      await repositories.parents.create({ user_id: u.id, institute_id: user.institute_id, occupation: form.occupation, relationship: form.relationship as never, address: form.address });
      setShowAdd(false); setForm({ full_name: '', email: '', phone: '', occupation: '', relationship: '', address: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Parents</h2><p className="text-sm text-gray-500 mt-1">Manage parent/guardian records</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Parent</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Parent</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Occupation</Label><Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Relationship</Label><Input value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} placeholder="father/mother/guardian" /></div>
                <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Parent</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search parents..." value={filters.search || ''} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} className="pl-10 max-w-md" /></div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Parent</th><th className="px-4 py-3 text-left font-medium text-gray-500">Relationship</th><th className="px-4 py-3 text-left font-medium text-gray-500">Occupation</th><th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                parents?.data.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No parents found</td></tr> :
                parents?.data.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100"><UserCheck className="h-4 w-4 text-orange-600" /></div><div><p className="font-medium text-gray-900">{(p as Parent & { user?: { full_name: string } }).user?.full_name || 'Unknown'}</p></div></div></td>
                    <td className="px-4 py-3 capitalize"><Badge variant="outline">{p.relationship || 'N/A'}</Badge></td>
                    <td className="px-4 py-3 text-gray-600">{p.occupation || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{(p as Parent & { user?: { email: string } }).user?.email}</td>
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
