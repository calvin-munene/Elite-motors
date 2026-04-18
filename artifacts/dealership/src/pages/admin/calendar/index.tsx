import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBookings } from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Phone, Mail, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminCalendar() {
  const { data } = useListBookings({ limit: 500 });
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  }), [month]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    (data?.bookings || []).forEach(b => {
      const key = format(new Date(b.preferredDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [data]);

  const dayBookings = selectedDay ? (bookingsByDay.get(format(selectedDay, "yyyy-MM-dd")) || []) : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Test Drive Calendar</h1>
        <p className="text-gray-400">Visual overview of upcoming test drives and showroom visits.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 hover:bg-white/5 rounded"><ChevronLeft className="w-5 h-5 text-white" /></button>
          <h2 className="text-2xl font-serif text-white">{format(month, "MMMM yyyy")}</h2>
          <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 hover:bg-white/5 rounded"><ChevronRight className="w-5 h-5 text-white" /></button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="bg-background py-2 text-center text-xs text-gray-500 font-medium uppercase">{d}</div>
          ))}
          {days.map(day => {
            const key = format(day, "yyyy-MM-dd");
            const dayItems = bookingsByDay.get(key) || [];
            const inMonth = isSameMonth(day, month);
            return (
              <button key={key} onClick={() => dayItems.length > 0 && setSelectedDay(day)}
                className={`bg-background min-h-[90px] p-1.5 text-left transition-colors ${dayItems.length > 0 ? "hover:bg-white/5 cursor-pointer" : ""} ${!inMonth ? "opacity-30" : ""} ${isToday(day) ? "ring-1 ring-primary" : ""}`}>
                <div className={`text-xs font-bold mb-1 ${isToday(day) ? "text-primary" : "text-gray-300"}`}>{format(day, "d")}</div>
                <div className="space-y-0.5">
                  {dayItems.slice(0, 2).map(b => (
                    <div key={b.id} className={`text-[10px] truncate px-1 py-0.5 rounded ${b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/20 text-red-300"}`}>
                      {b.preferredTime} · {b.name.split(" ")[0]}
                    </div>
                  ))}
                  {dayItems.length > 2 && <div className="text-[10px] text-gray-500">+{dayItems.length - 2} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-card border border-white/10 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-white/5 p-5 flex items-center justify-between">
              <h2 className="text-xl font-serif text-white">{format(selectedDay, "EEEE, MMM d, yyyy")}</h2>
              <button onClick={() => setSelectedDay(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              {dayBookings.sort((a, b) => (a.preferredTime || "").localeCompare(b.preferredTime || "")).map(b => (
                <div key={b.id} className="bg-background/50 p-4 rounded border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{b.preferredTime} · {b.name}</p>
                      <p className="text-xs text-primary">{b.carTitle}</p>
                    </div>
                    <Badge variant="outline">{b.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                    {b.phone && <a href={`tel:${b.phone}`} className="flex items-center gap-1 hover:text-white"><Phone className="w-3 h-3" /> {b.phone}</a>}
                    {b.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {b.email}</span>}
                  </div>
                  {b.message && <p className="text-xs text-gray-500 mt-2 italic">"{b.message}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
