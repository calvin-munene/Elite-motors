import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, X, Mail, Phone, MessageSquare, Calendar, RefreshCw, DollarSign } from "lucide-react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminFetch(`/admin/customers`).then(d => setCustomers(d.customers || []));
  }, []);

  useEffect(() => {
    if (selected) {
      const params = selected.phone ? `phone=${encodeURIComponent(selected.phone)}` : `email=${encodeURIComponent(selected.email || "")}`;
      adminFetch(`/admin/customers/by-contact?${params}`).then(setDetail);
    } else setDetail(null);
  }, [selected]);

  const filtered = customers.filter(c =>
    !search || (c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Customer 360</h1>
          <p className="text-gray-400">Unified view of every customer interaction.</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
          className="bg-card border border-white/10 rounded-md px-4 py-2 text-sm text-white w-72" />
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Contact</TableHead>
              <TableHead className="text-gray-400">Score</TableHead>
              <TableHead className="text-gray-400">Interactions</TableHead>
              <TableHead className="text-gray-400">First Seen</TableHead>
              <TableHead className="text-gray-400">Last Seen</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const scoreColor = !c.bestLeadScore ? "" : c.bestLeadScore >= 70 ? "bg-red-500/15 text-red-400" : c.bestLeadScore >= 40 ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400";
              return (
                <TableRow key={c.contactKey} className="border-white/5 hover:bg-white/5">
                  <TableCell><p className="font-bold text-white">{c.name || "Unknown"}</p></TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {c.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</p>}
                    {c.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>}
                  </TableCell>
                  <TableCell>
                    {c.bestLeadScore != null && <Badge className={`${scoreColor} border-0`}>{c.bestLeadScore}</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.bookings > 0 && <Badge variant="outline" className="text-xs"><Calendar className="w-3 h-3 mr-1" />{c.bookings}</Badge>}
                      {c.inquiries > 0 && <Badge variant="outline" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />{c.inquiries}</Badge>}
                      {c.tradeIns > 0 && <Badge variant="outline" className="text-xs"><RefreshCw className="w-3 h-3 mr-1" />{c.tradeIns}</Badge>}
                      {c.financings > 0 && <Badge variant="outline" className="text-xs"><DollarSign className="w-3 h-3 mr-1" />{c.financings}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{format(new Date(c.firstSeen), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-xs text-gray-500">{format(new Date(c.lastSeen), "MMM d, yyyy")}</TableCell>
                  <TableCell><button onClick={() => setSelected(c)} className="p-2 text-gray-400 hover:text-primary"><Eye className="w-4 h-4" /></button></TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No customers yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {selected && detail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-white/5 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-white">{selected.name}</h2>
                <p className="text-xs text-gray-500">{selected.phone || selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-6">
              {detail.bookings?.length > 0 && (
                <Section title="Test Drive Bookings" items={detail.bookings} render={(b: any) => (
                  <div><p className="text-white">{b.carTitle} — {format(new Date(b.preferredDate), "MMM d")}</p><p className="text-xs text-gray-500">{b.message}</p></div>
                )} />
              )}
              {detail.inquiries?.length > 0 && (
                <Section title="Inquiries" items={detail.inquiries} render={(i: any) => (
                  <div><p className="text-white text-sm">{i.message}</p><p className="text-xs text-gray-500 mt-1">{i.carTitle || i.type} · {format(new Date(i.createdAt), "MMM d")}</p></div>
                )} />
              )}
              {detail.tradeIns?.length > 0 && (
                <Section title="Trade-Ins" items={detail.tradeIns} render={(t: any) => (
                  <div><p className="text-white">{t.year} {t.make} {t.model}</p><p className="text-xs text-gray-500">{t.condition} · {t.mileage} km</p></div>
                )} />
              )}
              {detail.financings?.length > 0 && (
                <Section title="Financing" items={detail.financings} render={(f: any) => (
                  <div><p className="text-white">{f.carTitle}</p><p className="text-xs text-gray-500">{f.message}</p></div>
                )} />
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Section({ title, items, render }: any) {
  return (
    <div>
      <h3 className="text-white font-serif text-lg mb-2">{title} ({items.length})</h3>
      <div className="space-y-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="bg-background/50 p-3 rounded text-sm">{render(item)}</div>
        ))}
      </div>
    </div>
  );
}
