import { Link, useLocation } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { useEffect } from "react";
import { 
  LayoutDashboard, CarFront, MessageSquare, Calendar, 
  RefreshCw, DollarSign, Star, FileText, Users, 
  Wrench, Settings, LogOut, Menu, X, Brain
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: admin, isLoading, error } = useGetAdminMe();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      setLocation("/admin/login");
    }
  }, [admin, isLoading, error, setLocation]);

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Inventory", href: "/admin/cars", icon: CarFront },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Trade-Ins", href: "/admin/trade-ins", icon: RefreshCw },
    { name: "Financing", href: "/admin/financing", icon: DollarSign },
    { name: "Testimonials", href: "/admin/testimonials", icon: Star },
    { name: "Journal", href: "/admin/blog", icon: FileText },
    { name: "Team", href: "/admin/team", icon: Users },
    { name: "Services", href: "/admin/services", icon: Wrench },
    { name: "AI Knowledge", href: "/admin/chatbot", icon: Brain },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-card border border-white/10 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-white/5 transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
          <Link href="/admin">
            <div className="flex flex-col cursor-pointer">
              <span className="font-serif text-xl font-bold tracking-wider text-white">AUTOELITE</span>
              <span className="text-primary text-[10px] font-semibold tracking-[0.3em] uppercase">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div className={`
                      flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}>
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm truncate pr-2">
              <p className="text-white font-medium truncate">{admin.name || admin.username}</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-primary transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-card border-b border-white/5 h-16 flex items-center px-8 shrink-0 lg:hidden">
          <h1 className="font-serif text-lg font-bold text-white">AutoElite Admin</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
