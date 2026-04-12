import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListTradeIns } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { DetailModal, DetailField } from "@/components/admin/DetailModal";
import { Eye } from "lucide-react";

export default function AdminTradeIns() {
  const { data: tradeInsData } = useListTradeIns({ limit: 100 });
  const [selected, setSelected] = useState<any>(null);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Trade-In Submissions</h1>
        <p className="text-gray-400">Review customer vehicle trade-in requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Condition</TableHead>
              <TableHead className="text-gray-400">Asking Price</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!tradeInsData?.tradeIns?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No trade-in submissions found.</TableCell>
              </TableRow>
            ) : (
              tradeInsData.tradeIns.map((t) => (
                <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {format(new Date(t.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">{t.ownerName}</p>
                    <p className="text-xs text-gray-500">{t.phone}</p>
                    <p className="text-xs text-gray-500">{t.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">{t.year} {t.make} {t.model}</p>
                    <p className="text-xs text-gray-500">{new Intl.NumberFormat().format(t.mileage)} km</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-[10px] capitalize">{t.condition}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-primary text-sm">
                      {t.askingPrice
                        ? `KES ${new Intl.NumberFormat().format(t.askingPrice)}`
                        : "Not specified"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelected(t)}
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
          title={`Trade-In — ${selected.year} ${selected.make} ${selected.model}`}
          subtitle={`Submitted by ${selected.ownerName} · ${format(new Date(selected.createdAt), "MMM d, yyyy")}`}
          onClose={() => setSelected(null)}
          whatsappNumber={selected.phone?.replace(/\D/g, "") || ""}
          whatsappMessage={`Hello ${selected.ownerName}, thank you for submitting your ${selected.year} ${selected.make} ${selected.model} for trade-in evaluation at AutoElite Motors. We'd like to discuss this further with you.`}
        >
          <DetailField label="Owner Name" value={selected.ownerName} highlight />
          <DetailField label="Phone Number" value={selected.phone} />
          <DetailField label="Email Address" value={selected.email} />
          <DetailField label="Vehicle" value={`${selected.year} ${selected.make} ${selected.model}`} highlight />
          <DetailField label="Color" value={selected.color} />
          <DetailField label="Mileage" value={`${new Intl.NumberFormat().format(selected.mileage)} km`} />
          <DetailField label="Condition" value={selected.condition} />
          <DetailField label="Asking Price" value={selected.askingPrice ? `KES ${new Intl.NumberFormat().format(selected.askingPrice)}` : "Not specified"} />
          <DetailField label="Description / Notes" value={selected.description} />
        </DetailModal>
      )}
    </AdminLayout>
  );
}
