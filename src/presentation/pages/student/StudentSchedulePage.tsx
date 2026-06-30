import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { repositories } from '@/infrastructure/repositories';
import { useAuth } from '@/application/hooks/useAuth';
import { DAYS_OF_WEEK } from '@/domain/constants';
import { Clock, CalendarDays, School } from 'lucide-react';
import type { Enrollment, Course, Schedule } from '@/domain/types';

export function StudentSchedulePage() {
  const { user } = useAuth();
  const [scheduleByDay, setScheduleByDay] = useState<Record<number, Schedule[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.institute_id) return;
      try {
        const { data: studentData } = await repositories.students.findWithUser({ institute_id: user.institute_id, user_id: user.id, page: 1, pageSize: 1 });
        const student = studentData[0];
        if (student) {
          const eData = await repositories.enrollments.findWithRelations({ student_id: student.id, status: 'active', page: 1, pageSize: 100 });
          const courseIds = eData.data.map((e: Enrollment & { course?: Course }) => e.course?.id).filter(Boolean) as string[];
          const allSchedules: Schedule[] = [];
          for (const courseId of courseIds) {
            const sData = await repositories.schedules.findByCourse(courseId);
            allSchedules.push(...sData);
          }
          const byDay: Record<number, Schedule[]> = {};
          allSchedules.forEach(s => { if (!byDay[s.day_of_week]) byDay[s.day_of_week] = []; byDay[s.day_of_week].push(s); });
          Object.values(byDay).forEach(arr => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)));
          setScheduleByDay(byDay);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.institute_id, user?.id]);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">My Schedule</h2><p className="text-sm text-gray-500 mt-1">Weekly class schedule</p></div>
      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const daySchedules = scheduleByDay[day.value] || [];
          return (
            <Card key={day.value} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" />{day.label}</h3>
                {daySchedules.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <School className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{(s as Schedule & { course?: { name: string } }).course?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{s.room_name} {s.building && `(${s.building})`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />{s.start_time} - {s.end_time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
