import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();

  const load = () => adminFetch("/admin/users").then(d => setUsers(d.users || []));
  useEffect(() => { load().catch(e => toast({ title: "Access denied", description: e.message, variant: "destructive" })); }, []);

  const onDelete = async (id: number, username: string) => {
    if (!confirm(`Delete user ${username}?`)) return;
    await adminFetch(`/admin/users/${id}`, { method: "DELETE" });
    toast({ title: "User deleted" });
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Admin Users</h1>
          <p className="text-gray-400">Role-based access control. Owner only.</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> New User</Button>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Username</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Role</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Last Login</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="text-white font-bold">{u.username}</TableCell>
                <TableCell className="text-gray-300">{u.name || "—"}</TableCell>
                <TableCell className="text-gray-400 text-sm">{u.email || "—"}</TableCell>
                <TableCell>
                  <Badge className={u.role === "owner" ? "bg-primary/15 text-red-400 border-0" : u.role === "manager" ? "bg-amber-500/15 text-amber-400 border-0" : "bg-blue-500/15 text-blue-400 border-0"}>
                    {u.role || "owner"}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="outline" className={u.isActive === "true" ? "text-emerald-400 border-emerald-500/30" : "text-gray-500"}>{u.isActive === "true" ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="text-xs text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(u)} className="text-xs text-gray-400 hover:text-white">Edit</button>
                    <button onClick={() => onDelete(u.id, u.username)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(showNew || editing) && (
        <UserForm user={editing} onClose={() => { setShowNew(false); setEditing(null); }} onSaved={() => { setShowNew(false); setEditing(null); load(); }} />
      )}
    </AdminLayout>
  );
}

function UserForm({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "sales",
    isActive: user ? user.isActive === "true" : true,
  });
  const { toast } = useToast();

  const submit = async () => {
    try {
      if (user) {
        await adminFetch(`/admin/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name, email: form.email, role: form.role, isActive: form.isActive,
            ...(form.password ? { password: form.password } : {}),
          }),
        });
      } else {
        if (!form.username || !form.password) { toast({ title: "Username & password required", variant: "destructive" }); return; }
        await adminFetch(`/admin/users`, { method: "POST", body: JSON.stringify(form) });
      }
      toast({ title: user ? "User updated" : "User created" });
      onSaved();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="border-b border-white/5 p-5 flex items-center justify-between">
          <h2 className="text-xl font-serif text-white">{user ? "Edit User" : "New User"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Username"><input disabled={!!user} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white disabled:opacity-50" /></Field>
          <Field label={user ? "New Password (leave blank to keep)" : "Password"}><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white" /></Field>
          <Field label="Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white" /></Field>
          <Field label="Role">
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm text-white">
              <option value="owner">Owner (full access)</option>
              <option value="manager">Manager</option>
              <option value="sales">Sales</option>
            </select>
          </Field>
          {user && (
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
          )}
          <Button onClick={submit} className="w-full bg-primary hover:bg-primary/90">{user ? "Save Changes" : "Create User"}</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</label>{children}</div>;
}
