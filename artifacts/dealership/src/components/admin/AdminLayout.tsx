import { Link, useLocation } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CarFront, MessageSquare, Calendar,
  RefreshCw, DollarSign, Star, FileText, Users,
  Wrench, Settings, LogOut, Menu, X, Brain,
  BarChart3, Activity, UserCircle, ShieldCheck, Globe2, Bell, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";
import { formatDistanceToNow } from "date-fns";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: admin, isLoading, error } = useGetAdminMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isLoading && (error || !admin)) setLocation("/admin/login");
  }, [admin, isLoading, error, setLocation]);

  // Poll notifications
  useEffect(() => {
    if (!admin) return;
    const load = () => adminFetch("/admin/notifications").then(d => { setNotifs(d.notifications || []); setUnread(d.unreadCount || 0); }).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [admin]);

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => { localStorage.removeItem("adminToken"); setLocation("/admin/login"); };

  const markAllRead = async () => {
    await adminFetch("/admin/notifications/read-all", { method: "POST" });
    setUnread(0);
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id: number) => {
    await adminFetch(`/admin/notifications/${id}`, { method: "DELETE" });
    setNotifs(notifs.filter(n => n.id !== id));
  };

  const navSections = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Live Visitors", href: "/admin/visitors", icon: Activity },
      ],
    },
    {
      label: "Sales",
      items: [
        { name: "Inventory", href: "/admin/cars", icon: CarFront },
        { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
        { name: "Bookings", href: "/admin/bookings", icon: Calendar },
        { name: "Calendar", href: "/admin/calendar", icon: Calendar },
        { name: "Customers", href: "/admin/customers", icon: UserCircle },
        { name: "Trade-Ins", href: "/admin/trade-ins", icon: RefreshCw },
        { name: "Financing", href: "/admin/financing", icon: DollarSign },
      ],
    },
    {
      label: "Content",
      items: [
        { name: "Testimonials", href: "/admin/testimonials", icon: Star },
        { name: "Journal", href: "/admin/blog", icon: FileText },
        { name: "Team", href: "/admin/team", icon: Users },
        { name: "AI Knowledge", href: "/admin/chatbot", icon: Brain },
      ],
    },
    {
      label: "Operations",
      items: [
        { name: "Japan Auctions", href: "/admin/japan-auctions", icon: Globe2 },
        { name: "Admin Users", href: "/admin/users", icon: ShieldCheck },
        { name: "Audit Log", href: "/admin/audit", icon: ShieldCheck },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <button className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-card border border-white/10 rounded-md" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-white/5 transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5">
          <Link href="/admin">
            <div className="flex flex-col cursor-pointer">
              <span className="font-serif text-xl font-bold tracking-wider text-white">AUTOELITE</span>
              <span className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-2">
              <p className="px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600">{section.label}</p>
              <ul className="space-y-0.5 px-3">
                {section.items.map(item => {
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link href={item.href} onClick={() => setSidebarOpen(false)}>
                        <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors text-sm
                          ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                          <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                          {item.name}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm truncate pr-2">
              <p className="text-white font-medium truncate">{admin.name || admin.username}</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Log out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-card border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
          <h1 className="font-serif text-lg font-bold text-white lg:hidden">AutoElite Admin</h1>
          <div className="hidden lg:block" />
          <div className="relative">
            <button onClick={() => setNotifsOpen(!notifsOpen)} className="relative p-2 hover:bg-white/5 rounded-md">
              <Bell className="w-5 h-5 text-gray-400" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {notifsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-white/10 rounded-lg shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
                  <div className="sticky top-0 bg-card border-b border-white/5 p-3 flex justify-between items-center">
                    <p className="text-sm font-bold text-white">Notifications</p>
                    {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>}
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-sm text-gray-500 p-6 text-center">No notifications.</p>
                  ) : (
                    <div>
                      {notifs.map(n => (
                        <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 group ${!n.isRead ? "bg-primary/5" : ""}`}>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              {n.link ? (
                                <Link href={n.link}>
                                  <a onClick={() => setNotifsOpen(false)} className="block cursor-pointer">
                                    <p className="text-sm text-white font-medium">{n.title}</p>
                                    <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                  </a>
                                </Link>
                              ) : (
                                <>
                                  <p className="text-sm text-white font-medium">{n.title}</p>
                                  <p className="text-xs text-gray-400">{n.message}</p>
                                  <p className="text-[10px] text-gray-600 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                </>
                              )}
                            </div>
                            <button onClick={() => deleteNotif(n.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
