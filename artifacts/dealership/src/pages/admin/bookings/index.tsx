import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBookings, useUpdateBooking } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminBookings() {
  const { data: bookingsData, refetch } = useListBookings({ limit: 100 });
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        refetch();
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Test Drive Bookings</h1>
        <p className="text-gray-400">Manage customer test drive appointments.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date Requested</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Preferred Time</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bookingsData?.bookings?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No bookings found.</TableCell>
              </TableRow>
            ) : (
              bookingsData.bookings.map((booking) => (
                <TableRow key={booking.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{booking.name}</p>
                    <p className="text-xs text-gray-500">{booking.email || booking.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-primary">{booking.carTitle || "Unknown Vehicle"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-white">{booking.preferredDate}</p>
                    <p className="text-xs text-gray-400">{booking.preferredTime}</p>
                  </TableCell>
                  <TableCell>
                    <Select value={booking.status} onValueChange={(v) => handleStatusChange(booking.id, v)}>
                      <SelectTrigger className={`w-32 text-xs h-8 ${booking.status === 'pending' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : booking.status === 'confirmed' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
