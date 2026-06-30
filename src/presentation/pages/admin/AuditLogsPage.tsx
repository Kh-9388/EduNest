import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { repositories } from '@/infrastructure/repositories';
import { AuditSeverity, AuditAction } from '@/domain/enums';
import { Shield, Clock } from 'lucide-react';
import type { AuditLog, PaginatedResponse, QueryFilters } from '@/domain/types';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryFilters>({ page: 1, pageSize: 20 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await repositories.auditLogs.findWithFilters(filters);
        setLogs(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [filters]);

  const getSeverityBadge = (s: string) => {
    switch (s) { case 'critical': return <Badge className="bg-red-100 text-red-700">{s}</Badge>; case 'error': return <Badge className="bg-orange-100 text-orange-700">{s}</Badge>; case 'warning': return <Badge className="bg-yellow-100 text-yellow-700">{s}</Badge>; default: return <Badge className="bg-blue-100 text-blue-700">{s}</Badge>; }
  };

  const getActionBadge = (a: string) => {
    switch (a) { case 'create': return <Badge className="bg-green-100 text-green-700">{a}</Badge>; case 'update': return <Badge className="bg-blue-100 text-blue-700">{a}</Badge>; case 'delete': return <Badge className="bg-red-100 text-red-700">{a}</Badge>; default: return <Badge variant="outline">{a}</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500 mt-1">Track all platform activities and changes</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select onValueChange={v => setFilters({ ...filters, action: v, page: 1 })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by action" /></SelectTrigger>
          <SelectContent>
            {Object.values(AuditAction).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={v => setFilters({ ...filters, severity: v, page: 1 })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by severity" /></SelectTrigger>
          <SelectContent>
            {Object.values(AuditSeverity).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Severity</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Summary</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>)
                ) : logs?.data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No audit logs found</td></tr>
                ) : logs?.data.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{log.entity}</td>
                    <td className="px-4 py-3 text-gray-600">{log.actor_email || log.actor_role || 'System'}</td>
                    <td className="px-4 py-3">{getSeverityBadge(log.severity)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.changes_summary || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(log.created_at).toLocaleString()}</div>
                    </td>
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
