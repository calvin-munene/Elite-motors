import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListInquiries, useUpdateInquiry } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminInquiries() {
  const { data: inquiriesData, refetch } = useListInquiries({ limit: 100 });
  const updateInquiry = useUpdateInquiry();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateInquiry.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        refetch();
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Inquiries</h1>
        <p className="text-gray-400">Manage customer inquiries and contact requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Message</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!inquiriesData?.inquiries?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No inquiries found.</TableCell>
              </TableRow>
            ) : (
              inquiriesData.inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(inquiry.createdAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{inquiry.name}</p>
                    <p className="text-xs text-gray-500">{inquiry.email || inquiry.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 uppercase text-[10px]">{inquiry.type}</Badge>
                    {inquiry.carTitle && <p className="text-xs text-primary mt-1">{inquiry.carTitle}</p>}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-400 line-clamp-2" title={inquiry.message}>{inquiry.message}</p>
                  </TableCell>
                  <TableCell>
                    <Select value={inquiry.status} onValueChange={(v) => handleStatusChange(inquiry.id, v)}>
                      <SelectTrigger className={`w-32 text-xs h-8 ${inquiry.status === 'new' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-background border-white/10 text-white'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
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
