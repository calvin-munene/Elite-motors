import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListInquiries, useUpdateInquiry } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DetailModal, DetailField } from "@/components/admin/DetailModal";
import { Eye } from "lucide-react";

export default function AdminInquiries() {
  const { data: inquiriesData, refetch } = useListInquiries({ limit: 100 });
  const updateInquiry = useUpdateInquiry();
  const { toast } = useToast();
  const [selected, setSelected] = useState<any>(null);

  const handleStatusChange = (id: number, status: string) => {
    updateInquiry.mutate({ id, data: { status } }, {
      onSuccess: () => { toast({ title: "Status updated" }); refetch(); }
    });
  };

  const statusStyle = (s: string) =>
    s === "new" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-background border-white/10 text-white";

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Inquiries</h1>
        <p className="text-gray-400">Manage customer inquiries and contact requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Message</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!inquiriesData?.inquiries?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No inquiries found.</TableCell>
              </TableRow>
            ) : (
              inquiriesData.inquiries.map((inq) => (
                <TableRow key={inq.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {format(new Date(inq.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">{inq.name}</p>
                    <p className="text-xs text-gray-500">{inq.email}</p>
                    {inq.phone && <p className="text-xs text-gray-500">{inq.phone}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 uppercase text-[10px] whitespace-nowrap">{inq.type}</Badge>
                    {inq.carTitle && <p className="text-xs text-primary mt-1 max-w-[120px] leading-snug">{inq.carTitle}</p>}
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <p className="text-sm text-gray-400 line-clamp-2">{inq.message}</p>
                  </TableCell>
                  <TableCell>
                    <Select value={inq.status} onValueChange={(v) => handleStatusChange(inq.id, v)}>
                      <SelectTrigger className={`w-28 text-xs h-8 ${statusStyle(inq.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelected(inq)}
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
          title={`Inquiry — ${selected.name}`}
          subtitle={`${selected.type?.toUpperCase()} · ${format(new Date(selected.createdAt), "MMM d, yyyy 'at' h:mm a")}`}
          onClose={() => setSelected(null)}
          whatsappNumber={selected.phone?.replace(/\D/g, "") || ""}
          whatsappMessage={`Hello ${selected.name}, thank you for reaching out to AutoElite Motors. We're following up on your inquiry${selected.carTitle ? ` about the ${selected.carTitle}` : ""}.`}
        >
          <DetailField label="Full Name" value={selected.name} highlight />
          <DetailField label="Email Address" value={selected.email} />
          <DetailField label="Phone Number" value={selected.phone} />
          <DetailField label="Inquiry Type" value={selected.type} />
          <DetailField label="Vehicle of Interest" value={selected.carTitle} highlight />
          <DetailField label="Full Message" value={selected.message} />
          <DetailField label="Status" value={selected.status?.toUpperCase()} />
        </DetailModal>
      )}
    </AdminLayout>
  );
}
