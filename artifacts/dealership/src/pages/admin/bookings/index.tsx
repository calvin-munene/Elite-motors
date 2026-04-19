import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBookings, useUpdateBooking } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DetailModal, DetailField } from "@/components/admin/DetailModal";
import { Eye, RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminBookings() {
  const { data: bookingsData, refetch } = useListBookings({ limit: 100 });
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();
  const [selected, setSelected] = useState<any>(null);
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const handleStatusChange = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => { toast({ title: "Status updated" }); refetch(); }
    });
  };

  const handleRefund = async (bookingId: number) => {
    if (!confirm("Refund this customer's deposit? This action is logged with PayPal and cannot be undone.")) return;
    setRefundingId(bookingId);
    try {
      const token = localStorage.getItem("admin_token");
      const r = await fetch(`/api/admin/paypal/refund/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || !j.success) {
        toast({ title: "Refund failed", description: j.error || "PayPal returned an error", variant: "destructive" });
      } else {
        toast({ title: "Refund issued", description: `Refund ID: ${j.refundId}` });
        refetch();
      }
    } catch (e: any) {
      toast({ title: "Refund failed", description: e?.message || "Network error", variant: "destructive" });
    } finally {
      setRefundingId(null);
    }
  };

  const payBadge = (s: string | null | undefined) => {
    if (!s || s === "none") return null;
    const map: Record<string, { cls: string; icon: any; label: string }> = {
      pending: { cls: "bg-amber-500/10 text-amber-300 border-amber-500/30", icon: Clock, label: "Deposit Pending" },
      paid: { cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", icon: CheckCircle2, label: "Deposit Paid" },
      refunded: { cls: "bg-blue-500/10 text-blue-300 border-blue-500/30", icon: RotateCcw, label: "Refunded" },
      failed: { cls: "bg-red-500/10 text-red-300 border-red-500/30", icon: XCircle, label: "Failed" },
      cancelled: { cls: "bg-gray-500/10 text-gray-300 border-gray-500/30", icon: XCircle, label: "Cancelled" },
    };
    const info = map[s] || map.pending;
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${info.cls}`}>
        <Icon className="w-3 h-3" /> {info.label}
      </span>
    );
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
              <TableHead className="text-gray-400">Deposit</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bookingsData?.bookings?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No bookings found.</TableCell>
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
                    <div className="flex flex-col gap-1.5">
                      {payBadge((b as any).paymentStatus) || (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                      {(b as any).depositAmountUsd && (
                        <span className="text-[10px] text-gray-500">
                          ${Number((b as any).depositAmountUsd).toFixed(2)}
                        </span>
                      )}
                      {(b as any).paymentStatus === "paid" && (
                        <button
                          onClick={() => handleRefund(b.id)}
                          disabled={refundingId === b.id}
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {refundingId === b.id ? "Refunding..." : "Refund deposit"}
                        </button>
                      )}
                    </div>
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
