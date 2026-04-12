import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBookings, useUpdateBooking } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DetailModal, DetailField } from "@/components/admin/DetailModal";
import { Eye } from "lucide-react";

export default function AdminBookings() {
  const { data: bookingsData, refetch } = useListBookings({ limit: 100 });
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();
  const [selected, setSelected] = useState<any>(null);

  const handleStatusChange = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => { toast({ title: "Status updated" }); refetch(); }
    });
  };

  const statusStyle = (s: string) =>
    s === "pending" ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
    : s === "confirmed" ? "bg-green-500/10 border-green-500/30 text-green-400"
    : "bg-red-500/10 border-red-500/30 text-red-400";

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Test Drive Bookings</h1>
        <p className="text-gray-400">Manage customer test drive appointments.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Preferred Date</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bookingsData?.bookings?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No bookings found.</TableCell>
              </TableRow>
            ) : (
              bookingsData.bookings.map((b) => (
                <TableRow key={b.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {format(new Date(b.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.email}</p>
                    {b.phone && <p className="text-xs text-gray-500">{b.phone}</p>}
                  </TableCell>
                  <TableCell className="max-w-[140px]">
                    <p className="text-sm text-primary font-medium leading-snug">{b.carTitle || "Any Vehicle"}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="text-sm text-white">{b.preferredDate || "—"}</p>
                    <p className="text-xs text-gray-400">{b.preferredTime || ""}</p>
                  </TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => handleStatusChange(b.id, v)}>
                      <SelectTrigger className={`w-32 text-xs h-8 ${statusStyle(b.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelected(b)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <DetailModal
          title={`Booking — ${selected.name}`}
          subtitle={`Submitted ${format(new Date(selected.createdAt), "MMM d, yyyy 'at' h:mm a")}`}
          onClose={() => setSelected(null)}
          whatsappNumber={selected.phone?.replace(/\D/g, "") || ""}
          whatsappMessage={`Hello ${selected.name}, this is AutoElite Motors regarding your test drive booking for the ${selected.carTitle || "vehicle"}. We'd like to confirm your appointment.`}
        >
          <DetailField label="Full Name" value={selected.name} highlight />
          <DetailField label="Email Address" value={selected.email} />
          <DetailField label="Phone Number" value={selected.phone} />
          <DetailField label="Vehicle of Interest" value={selected.carTitle || "Not specified"} highlight />
          <DetailField label="Preferred Date" value={selected.preferredDate} />
          <DetailField label="Preferred Time Slot" value={selected.preferredTime} />
          <DetailField label="Message / Notes" value={selected.message} />
          <DetailField label="Status" value={selected.status?.toUpperCase()} />
        </DetailModal>
      )}
    </AdminLayout>
  );
}
