import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Eye, Users, Calendar, MessageSquare, TrendingUp, DollarSign, Smartphone, Globe } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#DC2626", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setLoading(true);
    adminFetch(`/admin/analytics?days=${days}`).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [days]);

  if (loading || !data) {
    return <AdminLayout><div className="text-gray-400">Loading analytics...</div></AdminLayout>;
  }

  const t = data.totals;
  const conversionRate = t.visitors > 0 ? ((t.bookings / t.visitors) * 100).toFixed(2) : "0";

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Business intelligence dashboard.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${days === d ? "bg-primary text-white" : "bg-card border border-white/10 text-gray-400 hover:text-white"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPI icon={Users} label="Visitors" value={t.visitors.toLocaleString()} sub={`${t.returningVisitors} returning`} />
        <KPI icon={Eye} label="Page Views" value={t.pageViews.toLocaleString()} sub={`${t.carViews} car views`} />
        <KPI icon={MessageSquare} label="Inquiries" value={t.inquiries.toLocaleString()} sub={`${t.bookings} test drives`} />
        <KPI icon={TrendingUp} label="Conversion" value={`${conversionRate}%`} sub="Visit → Booking" />
        <KPI icon={Calendar} label="Bookings" value={t.bookings.toLocaleString()} sub="Test drives" />
        <KPI icon={DollarSign} label="Sold" value={t.soldCars.toLocaleString()} sub="All time" />
        <KPI icon={DollarSign} label="Revenue" value={formatPrice(t.totalRevenue)} sub="All time" />
        <KPI icon={Smartphone} label="Mobile %" value={`${calcMobilePct(data.deviceBreakdown)}%`} sub="of visitors" />
      </div>

      {/* Funnel */}
      <div className="bg-card border border-white/5 rounded-lg p-6 mb-6">
        <h2 className="text-white font-serif text-xl mb-4">Conversion Funnel ({days}d)</h2>
        <div className="space-y-2">
          <FunnelBar label="Site Visits" value={data.funnel.visits} max={data.funnel.visits} color="bg-blue-500" />
          <FunnelBar label="Car Detail Views" value={data.funnel.carViews} max={data.funnel.visits} color="bg-purple-500" />
          <FunnelBar label="Inquiries" value={data.funnel.inquiries} max={data.funnel.visits} color="bg-amber-500" />
          <FunnelBar label="Test Drive Bookings" value={data.funnel.bookings} max={data.funnel.visits} color="bg-emerald-500" />
          <FunnelBar label="Sold (all-time)" value={data.funnel.sold} max={data.funnel.visits} color="bg-primary" />
        </div>
      </div>

      {/* Time series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Daily Visitors">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.visitsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #374151" }} />
              <Line type="monotone" dataKey="visits" stroke="#DC2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily Bookings">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.bookingsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #374151" }} />
              <Bar dataKey="bookings" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top cars + breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Top Viewed Cars">
          <div className="space-y-2">
            {data.topCars.slice(0, 8).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                <div>
                  <p className="text-white">{c.year} {c.title}</p>
                  <p className="text-xs text-gray-500">{formatPrice(c.price)}</p>
                </div>
                <span className="text-primary font-bold">{c.views} views</span>
              </div>
            ))}
            {data.topCars.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
          </div>
        </ChartCard>

        <ChartCard title="Body Type Inventory">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.topBodyTypes} dataKey="count" nameKey="bodyType" cx="50%" cy="50%" outerRadius={80} label>
                {data.topBodyTypes.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #374151" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Referrers">
          <div className="space-y-2">
            {data.topReferrers.map((r: any) => (
              <div key={r.referrer} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5">
                <span className="text-gray-300 truncate flex items-center gap-2"><Globe className="w-3 h-3" /> {r.referrer}</span>
                <span className="text-white font-bold">{r.visits}</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Device Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.deviceBreakdown} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={80} label>
                {data.deviceBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #374151" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}

function calcMobilePct(devices: any[]) {
  const total = devices.reduce((s, d) => s + d.count, 0);
  const mobile = devices.find((d: any) => d.device === "Mobile")?.count || 0;
  return total > 0 ? Math.round((mobile / total) * 100) : 0;
}

function KPI({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card border border-white/5 rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: any) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-background rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-card border border-white/5 rounded-lg p-6">
      <h3 className="text-white font-serif text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}
