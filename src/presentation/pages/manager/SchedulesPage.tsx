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
import { DAYS_OF_WEEK } from '@/domain/constants';
import { Plus, CalendarDays, Pencil, Clock } from 'lucide-react';
import type { Schedule, PaginatedResponse, QueryFilters, Course } from '@/domain/types';

export function SchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<PaginatedResponse<Schedule> | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 10 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ course_id: '', day_of_week: '0', start_time: '08:00', end_time: '09:30', room_name: '', building: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [schData, cData] = await Promise.all([
        repositories.schedules.findAll({ ...filters, institute_id: user?.institute_id }),
        repositories.courses.findAll({ institute_id: user?.institute_id, page: 1, pageSize: 100 }),
      ]);
      setSchedules(schData);
      setCourses(cData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters.page]);

  const handleCreate = async () => {
    try {
      await repositories.schedules.create({ course_id: form.course_id, day_of_week: parseInt(form.day_of_week), start_time: form.start_time, end_time: form.end_time, room_name: form.room_name, building: form.building });
      setShowAdd(false); setForm({ course_id: '', day_of_week: '0', start_time: '08:00', end_time: '09:30', room_name: '', building: '' }); loadData();
    } catch (err) { console.error(err); }
  };

  const dayLabel = (d: number) => DAYS_OF_WEEK.find(dw => dw.value === d)?.label || `Day ${d}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Schedules</h2><p className="text-sm text-gray-500 mt-1">Manage class schedules</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Add Schedule</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Schedule</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Course</Label><Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Day of Week</Label><Select value={form.day_of_week} onValueChange={v => setForm({ ...form, day_of_week: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></div>
                <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Room</Label><Input value={form.room_name} onChange={e => setForm({ ...form, room_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Building</Label><Input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Create Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Course</th><th className="px-4 py-3 text-left font-medium text-gray-500">Day</th><th className="px-4 py-3 text-left font-medium text-gray-500">Time</th><th className="px-4 py-3 text-left font-medium text-gray-500">Room</th><th className="px-4 py-3 text-left font-medium text-gray-500">Building</th><th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                schedules?.data.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No schedules found</td></tr> :
                schedules?.data.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" /><p className="font-medium text-gray-900">{(s as Schedule & { course?: { name: string } }).course?.name || 'N/A'}</p></div></td>
                    <td className="px-4 py-3"><Badge variant="outline">{dayLabel(s.day_of_week)}</Badge></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 text-gray-600"><Clock className="h-3 w-3" />{s.start_time} - {s.end_time}</div></td>
                    <td className="px-4 py-3 text-gray-600">{s.room_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.building || 'N/A'}</td>
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
