import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { Smartphone, Monitor, Tablet, Eye, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AdminVisitors() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    adminFetch(`/admin/visitors?limit=200`).then(setData);
    const t = setInterval(() => adminFetch(`/admin/visitors?limit=200`).then(setData), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selected) adminFetch(`/admin/visitors/${selected.sessionId}`).then(setDetail);
    else setDetail(null);
  }, [selected]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Visitor Tracking</h1>
        <p className="text-gray-400">Live customer activity across the site.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Last Seen</TableHead>
              <TableHead className="text-gray-400">Device</TableHead>
              <TableHead className="text-gray-400">Browser / OS</TableHead>
              <TableHead className="text-gray-400">Landing</TableHead>
              <TableHead className="text-gray-400">Referrer</TableHead>
              <TableHead className="text-gray-400">Pages</TableHead>
              <TableHead className="text-gray-400">Duration</TableHead>
              <TableHead className="text-gray-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.sessions?.map((s: any) => {
              const isLive = Date.now() - new Date(s.lastSeen).getTime() < 5 * 60 * 1000;
              const Icon = s.device === "Mobile" ? Smartphone : s.device === "Tablet" ? Tablet : Monitor;
              return (
                <TableRow key={s.sessionId} className="border-white/5 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isLive && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                      <span className="text-sm text-gray-300">{formatDistanceToNow(new Date(s.lastSeen), { addSuffix: true })}</span>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-2 text-gray-300"><Icon className="w-4 h-4" /> {s.device}</div></TableCell>
                  <TableCell className="text-sm text-gray-400">{s.browser} · {s.os}</TableCell>
                  <TableCell className="text-sm text-gray-400 max-w-[180px] truncate">{s.landingPage}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-[180px] truncate">{s.referrer || "Direct"}</TableCell>
                  <TableCell className="text-white font-bold">{s.pageViews}</TableCell>
                  <TableCell className="text-sm text-gray-300">{Math.floor((s.totalDurationSeconds || 0) / 60)}m {(s.totalDurationSeconds || 0) % 60}s</TableCell>
                  <TableCell>
                    <button onClick={() => setSelected(s)} className="p-2 text-gray-400 hover:text-primary"><Eye className="w-4 h-4" /></button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!data?.sessions?.length && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No visitor activity yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && detail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-white/5 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-white">Visitor Detail</h2>
                <p className="text-xs text-gray-500">{detail.session.ipAddress} · {detail.session.browser} · {detail.session.os}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="First seen" value={format(new Date(detail.session.firstSeen), "MMM d, h:mm a")} />
                <Info label="Last seen" value={format(new Date(detail.session.lastSeen), "MMM d, h:mm a")} />
                <Info label="Pages viewed" value={String(detail.session.pageViews)} />
                <Info label="Duration" value={`${Math.floor((detail.session.totalDurationSeconds || 0) / 60)}m`} />
                <Info label="Referrer" value={detail.session.referrer || "Direct"} />
                <Info label="Country" value={detail.session.country || "Unknown"} />
              </div>

              <div>
                <h3 className="text-white font-serif mb-2">Cars Viewed ({detail.carViews.length})</h3>
                <div className="space-y-2">
                  {detail.carViews.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm bg-background/50 p-3 rounded">
                      <div>
                        <p className="text-white">{c.year} {c.title}</p>
                        <p className="text-xs text-primary">{c.price ? formatPrice(c.price) : "—"}</p>
                      </div>
                      <span className="text-xs text-gray-500">{format(new Date(c.viewedAt), "h:mm a")}</span>
                    </div>
                  ))}
                  {detail.carViews.length === 0 && <p className="text-gray-500 text-sm">No cars viewed.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-white font-serif mb-2">Page Journey ({detail.pageViews.length})</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {detail.pageViews.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                      <span className="text-gray-300 truncate flex-1">{p.path}</span>
                      <span className="text-xs text-gray-500 ml-3 whitespace-nowrap">{format(new Date(p.viewedAt), "h:mm:ss a")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/50 p-3 rounded">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}
