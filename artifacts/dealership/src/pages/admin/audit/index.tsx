import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterEntity, setFilterEntity] = useState("");

  useEffect(() => {
    const url = filterEntity ? `/admin/audit-logs?entity=${filterEntity}&limit=200` : `/admin/audit-logs?limit=200`;
    adminFetch(url).then(d => setLogs(d.logs || []));
  }, [filterEntity]);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Audit Log</h1>
          <p className="text-gray-400">Every admin action, recorded.</p>
        </div>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
          className="bg-card border border-white/10 rounded-md px-3 py-2 text-sm text-white">
          <option value="">All entities</option>
          <option value="car">Cars</option>
          <option value="admin_user">Admin Users</option>
          <option value="setting">Settings</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Time</TableHead>
              <TableHead className="text-gray-400">User</TableHead>
              <TableHead className="text-gray-400">Action</TableHead>
              <TableHead className="text-gray-400">Entity</TableHead>
              <TableHead className="text-gray-400">Changes</TableHead>
              <TableHead className="text-gray-400">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(l => (
              <TableRow key={l.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="text-xs text-gray-400 whitespace-nowrap">{format(new Date(l.createdAt), "MMM d, h:mm:ss a")}</TableCell>
                <TableCell className="text-sm text-white">{l.adminUsername || "system"}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{l.action}</Badge></TableCell>
                <TableCell className="text-sm text-gray-300">{l.entity}{l.entityId ? `#${l.entityId}` : ""}</TableCell>
                <TableCell className="text-xs text-gray-500 max-w-[300px]">
                  {l.changes ? <pre className="font-mono whitespace-pre-wrap text-[10px]">{JSON.stringify(l.changes, null, 0).slice(0, 200)}</pre> : "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-500">{l.ipAddress}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No audit logs.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
