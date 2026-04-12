import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetCar, useUpdateCar } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
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
import { useEffect, useState } from "react";
import { Plus, Trash2, Image } from "lucide-react";

function GalleryEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [newUrl, setNewUrl] = useState("");
  const images = value || [];

  const addImage = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx}>
              <div className="h-24 rounded-lg overflow-hidden border border-white/10 bg-secondary">
                <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="mt-1.5 flex gap-1">
                <Input
                  value={url}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx] = e.target.value;
                    onChange(updated);
                  }}
                  className="bg-background border-white/10 text-white text-xs h-7 flex-1"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== idx))}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
          placeholder="Paste image URL and press Add..."
          className="bg-background border-white/10 text-white flex-1"
        />
        <Button type="button" variant="outline" onClick={addImage} className="border-white/10">
          <Plus className="w-4 h-4 mr-1" /> Add Photo
        </Button>
      </div>
      {images.length === 0 && (
        <p className="text-xs text-gray-500">No photos added yet. Add image URLs above to populate the gallery.</p>
      )}
    </div>
  );
}

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

export default function AdminEditCar() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: car, isLoading } = useGetCar(parseInt(id || "0"), {
    query: { enabled: !!id }
  });
  
  const updateCar = useUpdateCar();

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

  useEffect(() => {
    if (car) {
      form.reset({
        title: car.title,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        transmission: car.transmission,
        fuelType: car.fuelType,
        bodyType: car.bodyType,
        color: car.color,
        condition: car.condition,
        availability: car.availability,
        shortDescription: car.shortDescription || "",
        description: car.description || "",
        isFeatured: car.isFeatured,
        isPublished: car.isPublished,
        gallery: car.gallery || [],
      });
    }
  }, [car, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!id) return;
    updateCar.mutate({ id: parseInt(id), data: values }, {
      onSuccess: () => {
        toast({ title: "Vehicle updated successfully" });
        setLocation("/admin/cars");
      },
      onError: () => {
        toast({ title: "Failed to update vehicle", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Edit Vehicle</h1>
        <p className="text-gray-400">Update the details for this inventory item.</p>
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

            {/* Gallery Images */}
            <FormField control={form.control} name="gallery" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                  <Image className="w-4 h-4" /> Vehicle Photos (Gallery)
                </FormLabel>
                <GalleryEditor value={field.value || []} onChange={field.onChange} />
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
              <Button type="submit" disabled={updateCar.isPending}>Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
