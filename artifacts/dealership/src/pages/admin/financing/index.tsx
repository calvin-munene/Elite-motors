import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListFinancingInquiries } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function AdminFinancing() {
  const { data: inquiriesData } = useListFinancingInquiries({ limit: 100 });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Financing Applications</h1>
        <p className="text-gray-400">Review customer financing requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle / Loan Info</TableHead>
              <TableHead className="text-gray-400">Employment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!inquiriesData?.inquiries?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">No financing applications found.</TableCell>
              </TableRow>
            ) : (
              inquiriesData.inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{inquiry.name}</p>
                    <p className="text-xs text-gray-500">{inquiry.phone}</p>
                    <p className="text-xs text-gray-500">{inquiry.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-primary mb-1">{inquiry.carTitle || "General Pre-Approval"}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Amount: {inquiry.loanAmount ? `$${inquiry.loanAmount.toLocaleString()}` : 'N/A'}</p>
                      <p>Down: {inquiry.downPayment ? `$${inquiry.downPayment.toLocaleString()}` : 'N/A'}</p>
                      <p>Term: {inquiry.loanTermMonths ? `${inquiry.loanTermMonths} months` : 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-300">{inquiry.employmentStatus || "Not specified"}</p>
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
