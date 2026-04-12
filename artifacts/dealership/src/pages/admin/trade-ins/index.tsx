import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListTradeIns } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminTradeIns() {
  const { data: tradeInsData } = useListTradeIns({ limit: 100 });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Trade-In Submissions</h1>
        <p className="text-gray-400">Review customer vehicle trade-in requests.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Vehicle</TableHead>
              <TableHead className="text-gray-400">Details</TableHead>
              <TableHead className="text-gray-400">Expected Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!tradeInsData?.tradeIns?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No trade-in submissions found.</TableCell>
              </TableRow>
            ) : (
              tradeInsData.tradeIns.map((tradeIn) => (
                <TableRow key={tradeIn.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(tradeIn.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{tradeIn.ownerName}</p>
                    <p className="text-xs text-gray-500">{tradeIn.phone}</p>
                    <p className="text-xs text-gray-500">{tradeIn.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{tradeIn.year} {tradeIn.make} {tradeIn.model}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-300">Mileage: {new Intl.NumberFormat().format(tradeIn.mileage)}</p>
                    <p className="text-sm text-gray-300">Condition: <Badge variant="outline" className="text-[10px] ml-1">{tradeIn.condition}</Badge></p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-primary">
                      {tradeIn.askingPrice ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tradeIn.askingPrice) : "Not specified"}
                    </p>
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
