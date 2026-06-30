import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { ClipboardCheck, Plus } from 'lucide-react';
import type { Course, Student, Enrollment } from '@/domain/types';

export function TeacherAttendancePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: teacherData } = await repositories.teachers.findAll({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const teacher = teacherData[0];
        if (teacher) {
          const cData = await repositories.courses.findAll({ institute_id: user.institute_id, teacher_id: teacher.id, page: 1, pageSize: 100 });
          setCourses(cData.data);
          if (cData.data.length > 0) setSelectedCourse(cData.data[0].id);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourse) return;
      try {
        const { data: enrollmentData } = await repositories.enrollments.findWithRelations({ course_id: selectedCourse, status: 'active', page: 1, pageSize: 100 });
        const students = enrollmentData.map((e: Enrollment & { student?: Student }) => e.student).filter(Boolean) as Student[];
        setStudents(students);
      } catch (err) { console.error(err); }
    };
    loadStudents();
  }, [selectedCourse]);

  const handleSubmit = async () => {
    if (!selectedCourse || !date) return;
    try {
      for (const [studentId, status] of Object.entries(attendanceMap)) {
        await repositories.attendance.create({ student_id: studentId, course_id: selectedCourse, session_date: date, status: status as never, recorded_by: user?.id });
      }
      setShowDialog(true);
      setAttendanceMap({});
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Record Attendance</h2><p className="text-sm text-gray-500 mt-1">Mark student attendance for a session</p></div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium text-gray-500">Student</th><th className="px-4 py-3 text-left font-medium text-gray-500">Code</th><th className="px-4 py-3 text-center font-medium text-gray-500">Present</th><th className="px-4 py-3 text-center font-medium text-gray-500">Absent</th><th className="px-4 py-3 text-center font-medium text-gray-500">Late</th><th className="px-4 py-3 text-center font-medium text-gray-500">Excused</th></tr></thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                students.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No students enrolled in this course</td></tr> :
                students.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{(s as Student & { user?: { full_name: string } }).user?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.student_code}</td>
                    {['present', 'absent', 'late', 'excused'].map(st => (
                      <td key={st} className="px-4 py-3 text-center">
                        <button onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: st })} className={`h-6 w-6 rounded-full border-2 ${attendanceMap[s.id] === st ? st === 'present' ? 'bg-green-500 border-green-500' : st === 'absent' ? 'bg-red-500 border-red-500' : st === 'late' ? 'bg-yellow-500 border-yellow-500' : 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Submit Attendance
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Attendance Recorded</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Attendance has been recorded successfully for {Object.keys(attendanceMap).length} students.</p>
          <Button onClick={() => setShowDialog(false)} className="w-full bg-blue-600 hover:bg-blue-700">OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
