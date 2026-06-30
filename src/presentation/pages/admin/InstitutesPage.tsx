import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { repositories } from '@/infrastructure/repositories';
import { InstituteStatus, SubscriptionPlan } from '@/domain/enums';
import { Search, Building2, Plus, Pencil, Eye } from 'lucide-react';
import type { Institute, PaginatedResponse, QueryFilters } from '@/domain/types';

export function InstitutesPage() {
  const [institutes, setInstitutes] = useState<PaginatedResponse<Institute> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10, search: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', email: '', phone: '', address: '', website: '', subscription_plan: 'free' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await repositories.institutes.findAll(filters);
      setInstitutes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filters.page, filters.search]);

  const handleCreate = async () => {
    try {
      await repositories.institutes.create({
        ...formData,
        status: InstituteStatus.ACTIVE,
        subscription_plan: formData.subscription_plan as SubscriptionPlan,
      });
      setShowAdd(false);
      setFormData({ name: '', slug: '', email: '', phone: '', address: '', website: '', subscription_plan: 'free' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'free': return <Badge variant="outline" className="border-gray-300 text-gray-600">Free</Badge>;
      case 'basic': return <Badge variant="outline" className="border-blue-300 text-blue-600">Basic</Badge>;
      case 'pro': return <Badge variant="outline" className="border-purple-300 text-purple-600">Pro</Badge>;
      default: return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Institutes</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all educational institutes on the platform</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Institute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Institute</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Institute name" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="institute-slug" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="contact@institute.edu" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1-234-567-8900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://institute.edu" />
              </div>
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <Select value={formData.subscription_plan} onValueChange={v => setFormData({ ...formData, subscription_plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic ($49/mo)</SelectItem>
                    <SelectItem value="pro">Pro ($99/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Institute</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search institutes..."
          value={filters.search || ''}
          onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="pl-10 max-w-md"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                  ))
                ) : institutes?.data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No institutes found</td></tr>
                ) : (
                  institutes?.data.map(institute => (
                    <tr key={institute.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{institute.name}</p>
                            <p className="text-xs text-gray-500">{institute.timezone || 'UTC'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{institute.slug}</td>
                      <td className="px-4 py-3">{getStatusBadge(institute.status)}</td>
                      <td className="px-4 py-3">{getPlanBadge(institute.subscription_plan)}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600">{institute.email}</div>
                        <div className="text-xs text-gray-500">{institute.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {institutes && institutes.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(filters.page! - 1) * filters.pageSize! + 1} - {Math.min(filters.page! * filters.pageSize!, institutes.count)} of {institutes.count}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</Button>
            <Button variant="outline" size="sm" disabled={filters.page === institutes.totalPages} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
