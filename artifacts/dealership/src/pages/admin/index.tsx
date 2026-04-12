import { useGetDashboardStats } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Car, MessageSquare, Calendar, RefreshCw, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats?.totalCars || 0,
      subvalue: `${stats?.availableCars || 0} Available • ${stats?.soldCars || 0} Sold`,
      icon: <Car className="w-6 h-6 text-primary" />,
    },
    {
      title: "Inquiries",
      value: stats?.totalInquiries || 0,
      subvalue: `${stats?.newInquiries || 0} New`,
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
    },
    {
      title: "Test Drives",
      value: stats?.totalBookings || 0,
      subvalue: `${stats?.pendingBookings || 0} Pending`,
      icon: <Calendar className="w-6 h-6 text-primary" />,
    },
    {
      title: "Trade-Ins",
      value: stats?.totalTradeIns || 0,
      subvalue: "Total Submissions",
      icon: <RefreshCw className="w-6 h-6 text-primary" />,
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome to the AutoElite Motors administration portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-white/5 rounded-lg p-6 flex items-start">
            <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center mr-4 shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-500">{stat.subvalue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-serif text-xl font-bold text-white">Recent Inquiries</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentInquiries?.length ? stats.recentInquiries.map(inquiry => (
              <div key={inquiry.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white">{inquiry.name}</span>
                  <span className="text-xs text-gray-500">{format(new Date(inquiry.createdAt), "MMM d, h:mm a")}</span>
                </div>
                <div className="text-sm text-primary mb-2">{inquiry.carTitle || "General Inquiry"}</div>
                <p className="text-sm text-gray-400 line-clamp-1">{inquiry.message}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">No recent inquiries.</div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-serif text-xl font-bold text-white">Recent Test Drives</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentBookings?.length ? stats.recentBookings.map(booking => (
              <div key={booking.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white">{booking.name}</span>
                  <span className="text-xs text-gray-500">{format(new Date(booking.createdAt), "MMM d, h:mm a")}</span>
                </div>
                <div className="text-sm text-primary mb-2">{booking.carTitle}</div>
                <p className="text-sm text-gray-400">Requested: {booking.preferredDate} at {booking.preferredTime}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">No recent bookings.</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
