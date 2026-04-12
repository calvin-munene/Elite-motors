import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListCars, useDeleteCar } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminCars() {
  const [search, setSearch] = useState("");
  const { data: inventoryData, refetch } = useListCars({ limit: 100, search });
  const deleteCar = useDeleteCar();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      deleteCar.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Vehicle deleted" });
          refetch();
        },
        onError: () => {
          toast({ title: "Error deleting vehicle", variant: "destructive" });
        }
      });
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage your vehicle listings, prices, and availability.</p>
        </div>
        <Link href="/admin/cars/new">
          <Button className="shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search by make, model, or VIN..." 
              className="pl-9 bg-background border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/50">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-gray-400 font-bold">Vehicle</TableHead>
                <TableHead className="text-gray-400 font-bold">Price</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Added</TableHead>
                <TableHead className="text-right text-gray-400 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData?.cars.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No vehicles found.</TableCell>
                </TableRow>
              ) : (
                inventoryData?.cars.map((car) => (
                  <TableRow key={car.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-secondary overflow-hidden shrink-0">
                          {car.gallery && car.gallery[0] ? (
                            <img src={car.gallery[0]} alt={car.title} className="w-full h-full object-cover" />
                          ) : (
                            <CarFront className="w-6 h-6 m-3 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{car.year} {car.title}</p>
                          <p className="text-xs text-gray-500">VIN: {car.vin || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">{formatPrice(car.price)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline" className={`text-[10px] ${car.availability === 'available' ? 'border-green-500/30 text-green-400' : car.availability === 'reserved' ? 'border-orange-500/30 text-orange-400' : 'border-red-500/30 text-red-400'}`}>
                          {car.availability}
                        </Badge>
                        {!car.isPublished && (
                          <Badge variant="outline" className="text-[10px] border-gray-500/30 text-gray-400">Draft</Badge>
                        )}
                        {car.isFeatured && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {format(new Date(car.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/cars/${car.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" title="View Public Page">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/cars/${car.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(car.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
