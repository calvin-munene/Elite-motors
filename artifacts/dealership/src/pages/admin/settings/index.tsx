import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const formSchema = z.object({
  dealerName: z.string().min(2, "Dealer name is required"),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  openingHours: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutContent: z.string().optional(),
  aboutImage: z.string().optional(),
  yearsInBusiness: z.coerce.number().optional(),
  carsInStock: z.coerce.number().optional(),
  satisfiedClients: z.coerce.number().optional(),
});

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerName: "",
      tagline: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
      googleMapsUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      openingHours: "",
      heroTitle: "",
      heroSubtitle: "",
      aboutTitle: "",
      aboutContent: "",
      aboutImage: "",
      yearsInBusiness: 0,
      carsInStock: 0,
      satisfiedClients: 0,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        dealerName: settings.dealerName || "",
        tagline: settings.tagline || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "",
        googleMapsUrl: settings.googleMapsUrl || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        openingHours: settings.openingHours || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        aboutTitle: settings.aboutTitle || "",
        aboutContent: settings.aboutContent || "",
        aboutImage: settings.aboutImage || "",
        yearsInBusiness: settings.yearsInBusiness || 0,
        carsInStock: settings.carsInStock || 0,
        satisfiedClients: settings.satisfiedClients || 0,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSettings.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Settings updated successfully" });
      },
      onError: () => {
        toast({ title: "Error updating settings", variant: "destructive" });
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
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Site Settings</h1>
        <p className="text-gray-400">Configure global website content and dealership information.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-lg p-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* General Info */}
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dealerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Dealership Name</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tagline" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Tagline</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Phone</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">WhatsApp</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="openingHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Opening Hours</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Address</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">City / Region</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="googleMapsUrl" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Google Maps Embed URL</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Content Setup */}
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Homepage Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Hero Title</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Hero Subtitle</FormLabel>
                    <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <Button type="submit" disabled={updateSettings.isPending}>Save Settings</Button>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
