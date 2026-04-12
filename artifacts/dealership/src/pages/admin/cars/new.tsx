import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCreateCar } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  mileage: z.coerce.number().min(0),
  transmission: z.string().min(1, "Transmission is required"),
  fuelType: z.string().min(1, "Fuel Type is required"),
  bodyType: z.string().min(1, "Body Type is required"),
  color: z.string().min(1, "Color is required"),
  condition: z.string().min(1, "Condition is required"),
  availability: z.string().min(1, "Availability is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  gallery: z.array(z.string()).optional(),
});

export default function AdminNewCar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCar = useCreateCar();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      color: "Black",
      condition: "new",
      availability: "available",
      shortDescription: "",
      description: "",
      isFeatured: false,
      isPublished: true,
      gallery: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCar.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Vehicle added successfully" });
        setLocation("/admin/cars");
      },
      onError: () => {
        toast({ title: "Failed to add vehicle", variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Add New Vehicle</h1>
        <p className="text-gray-400">Enter the details for the new inventory item.</p>
      </div>

      <div className="bg-card border border-white/5 p-8 rounded-lg max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Listing Title</FormLabel>
                  <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Make</FormLabel>
                  <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Model</FormLabel>
                  <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Year</FormLabel>
                  <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Price ($)</FormLabel>
                  <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="mileage" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Mileage</FormLabel>
                  <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="transmission" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Transmission</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-white/10 text-white"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automated Manual">Automated Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fuelType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-white/10 text-white"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bodyType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Body Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-white/10 text-white"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="Coupe">Coupe</SelectItem>
                      <SelectItem value="Convertible">Convertible</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Color</FormLabel>
                  <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-white/10 text-white"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Pre-Owned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-white/10 text-white"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="shortDescription" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Short Description</FormLabel>
                <FormControl><Textarea className="bg-background border-white/10 text-white" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Full Description</FormLabel>
                <FormControl><Textarea className="bg-background border-white/10 text-white" rows={6} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-8 border-t border-white/10 pt-6">
              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Featured on Homepage</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="isPublished" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                  <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Published</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/cars")}>Cancel</Button>
              <Button type="submit" disabled={createCar.isPending}>Save Vehicle</Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
