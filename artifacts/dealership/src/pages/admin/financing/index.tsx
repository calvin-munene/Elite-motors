import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListFinancingInquiries } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { DetailModal, DetailField } from "@/components/admin/DetailModal";
import { Eye } from "lucide-react";

export default function AdminFinancing() {
  const { data: inquiriesData } = useListFinancingInquiries({ limit: 100 });
  const [selected, setSelected] = useState<any>(null);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Financing Applications</h1>
        <p className="text-gray-400">Review customer financing requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Loan Amount</TableHead>
              <TableHead className="text-gray-400">Employment</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!inquiriesData?.inquiries?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No financing applications found.</TableCell>
              </TableRow>
            ) : (
              inquiriesData.inquiries.map((f) => (
                <TableRow key={f.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {format(new Date(f.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.email}</p>
                    <p className="text-xs text-gray-500">{f.phone}</p>
                  </TableCell>
                  <TableCell className="max-w-[140px]">
                    <p className="text-sm text-primary font-medium leading-snug">{f.carTitle || "General Pre-Approval"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white text-sm">
                      {f.loanAmount ? `KES ${new Intl.NumberFormat().format(f.loanAmount)}` : "N/A"}
                    </p>
                    {f.downPayment && <p className="text-xs text-gray-500">Down: KES {new Intl.NumberFormat().format(f.downPayment)}</p>}
                    {f.loanTermMonths && <p className="text-xs text-gray-500">{f.loanTermMonths} months</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-300">{f.employmentStatus || "Not specified"}</p>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelected(f)}
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
          title={`Financing — ${selected.name}`}
          subtitle={`Submitted ${format(new Date(selected.createdAt), "MMM d, yyyy 'at' h:mm a")}`}
          onClose={() => setSelected(null)}
          whatsappNumber={selected.phone?.replace(/\D/g, "") || ""}
          whatsappMessage={`Hello ${selected.name}, we received your financing application at AutoElite Motors${selected.carTitle ? ` for the ${selected.carTitle}` : ""}. We'd like to discuss your financing options.`}
        >
          <DetailField label="Full Name" value={selected.name} highlight />
          <DetailField label="Email Address" value={selected.email} />
          <DetailField label="Phone Number" value={selected.phone} />
          <DetailField label="Vehicle of Interest" value={selected.carTitle || "General Pre-Approval"} highlight />
          <DetailField label="Loan Amount Requested" value={selected.loanAmount ? `KES ${new Intl.NumberFormat().format(selected.loanAmount)}` : undefined} />
          <DetailField label="Down Payment" value={selected.downPayment ? `KES ${new Intl.NumberFormat().format(selected.downPayment)}` : undefined} />
          <DetailField label="Loan Term" value={selected.loanTermMonths ? `${selected.loanTermMonths} months` : undefined} />
          <DetailField label="Employment Status" value={selected.employmentStatus} />
          <DetailField label="Monthly Income" value={selected.monthlyIncome ? `KES ${new Intl.NumberFormat().format(selected.monthlyIncome)}` : undefined} />
          <DetailField label="Additional Notes" value={selected.notes} />
        </DetailModal>
      )}
    </AdminLayout>
  );
}
