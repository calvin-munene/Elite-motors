import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListTestimonials, useDeleteTestimonial } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Edit, Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminTestimonials() {
  const { data: testimonialsData, refetch } = useListTestimonials({ limit: 100 });
  const deleteTestimonial = useDeleteTestimonial();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteTestimonial.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Testimonial deleted" });
          refetch();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Testimonials</h1>
          <p className="text-gray-400">Manage client reviews and testimonials.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Client</TableHead>
              <TableHead className="text-gray-400">Rating</TableHead>
              <TableHead className="text-gray-400">Review</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!testimonialsData?.testimonials?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No testimonials found.</TableCell>
              </TableRow>
            ) : (
              testimonialsData.testimonials.map((testimonial) => (
                <TableRow key={testimonial.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(testimonial.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < testimonial.rating ? 'text-accent fill-accent' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-400 line-clamp-2" title={testimonial.review}>{testimonial.review}</p>
                    {testimonial.carPurchased && <p className="text-xs text-primary mt-1">{testimonial.carPurchased}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${testimonial.isPublished ? 'border-green-500/30 text-green-400' : 'border-gray-500/30 text-gray-400'}`}>
                      {testimonial.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(testimonial.id)}>
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
    </AdminLayout>
  );
}
