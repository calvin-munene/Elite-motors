import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Globe, DollarSign, MapPin, Phone, Palette, Bot, Image, MessageSquare } from "lucide-react";

const formSchema = z.object({
  dealerName: z.string().min(2),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  openingHours: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  googleMapsEmbedUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImage: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutContent: z.string().optional(),
  aboutImage: z.string().optional(),
  currency: z.string().optional(),
  usdToKesRate: z.coerce.number().optional(),
  footerTagline: z.string().optional(),
  metaDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  whatsappApiEnabled: z.boolean().optional(),
  yearsInBusiness: z.coerce.number().optional(),
  carsInStock: z.coerce.number().optional(),
  satisfiedClients: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SectionHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-5">
      <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h2 className="font-serif text-lg font-bold text-white">{title}</h2>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function Field({ control, name, label, placeholder, type = "text", span2 = false, component = "input" }: {
  control: any; name: any; label: string; placeholder?: string; type?: string; span2?: boolean; component?: "input" | "textarea";
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className={span2 ? "md:col-span-2" : ""}>
        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">{label}</FormLabel>
        <FormControl>
          {component === "textarea"
            ? <Textarea className="bg-background border-white/10 text-white resize-none" rows={3} placeholder={placeholder} {...field} />
            : <Input type={type} className="bg-background border-white/10 text-white" placeholder={placeholder} {...field} />
          }
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerName: "", tagline: "", phone: "", whatsapp: "", email: "",
      address: "", city: "", country: "Kenya", openingHours: "",
      googleMapsUrl: "", googleMapsEmbedUrl: "",
      facebookUrl: "", instagramUrl: "", twitterUrl: "", youtubeUrl: "",
      heroTitle: "", heroSubtitle: "", heroImage: "",
      aboutTitle: "", aboutContent: "", aboutImage: "",
      currency: "KES", usdToKesRate: 130,
      footerTagline: "", metaDescription: "", logoUrl: "", primaryColor: "#DC2626",
      whatsappApiEnabled: false,
      yearsInBusiness: 0, carsInStock: 0, satisfiedClients: 0,
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
        country: (settings as any).country || "Kenya",
        openingHours: settings.openingHours || "",
        googleMapsUrl: settings.googleMapsUrl || "",
        googleMapsEmbedUrl: (settings as any).googleMapsEmbedUrl || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        heroImage: (settings as any).heroImage || "",
        aboutTitle: settings.aboutTitle || "",
        aboutContent: settings.aboutContent || "",
        aboutImage: settings.aboutImage || "",
        currency: (settings as any).currency || "KES",
        usdToKesRate: (settings as any).usdToKesRate || 130,
        footerTagline: (settings as any).footerTagline || "",
        metaDescription: (settings as any).metaDescription || "",
        logoUrl: (settings as any).logoUrl || "",
        primaryColor: (settings as any).primaryColor || "#DC2626",
        whatsappApiEnabled: (settings as any).whatsappApiEnabled || false,
        yearsInBusiness: settings.yearsInBusiness || 0,
        carsInStock: settings.carsInStock || 0,
        satisfiedClients: settings.satisfiedClients || 0,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: FormValues) => {
    updateSettings.mutate({ data: values as any }, {
      onSuccess: () => toast({ title: "Settings saved successfully" }),
      onError: () => toast({ title: "Error saving settings", variant: "destructive" }),
    });
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "contact", label: "Contact" },
    { id: "content", label: "Content" },
    { id: "currency", label: "Currency" },
    { id: "integrations", label: "Integrations" },
    { id: "branding", label: "Branding" },
  ];

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
        <p className="text-gray-400">Configure all aspects of your AutoElite Motors website.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.id ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-card border border-white/5 rounded-xl p-8 max-w-4xl">

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-8">
                <div>
                  <SectionHeader icon={Globe} title="Dealership Identity" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="dealerName" label="Dealership Name" placeholder="AutoElite Motors" />
                    <Field control={form.control} name="tagline" label="Tagline" placeholder="Where Luxury Meets Performance" />
                    <Field control={form.control} name="heroTitle" label="Hero Title" placeholder="Drive the Extraordinary" />
                    <Field control={form.control} name="heroSubtitle" label="Hero Subtitle" placeholder="Premium vehicles for discerning drivers" />
                  </div>
                </div>
                <div>
                  <SectionHeader icon={Globe} title="Statistics" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field control={form.control} name="yearsInBusiness" label="Years in Business" type="number" />
                    <Field control={form.control} name="carsInStock" label="Cars in Stock" type="number" />
                    <Field control={form.control} name="satisfiedClients" label="Satisfied Clients" type="number" />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-8">
                <div>
                  <SectionHeader icon={Phone} title="Contact Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="phone" label="Phone" placeholder="+254 700 234 567" />
                    <Field control={form.control} name="whatsapp" label="WhatsApp Number" placeholder="254700234567" />
                    <Field control={form.control} name="email" label="Email" placeholder="sales@autoelitemotors.co.ke" />
                    <Field control={form.control} name="openingHours" label="Opening Hours" placeholder="Mon-Sat 8AM-7PM" />
                  </div>
                </div>
                <div>
                  <SectionHeader icon={MapPin} title="Location" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="address" label="Street Address" placeholder="Ngong Road, next to Prestige Plaza" />
                    <Field control={form.control} name="city" label="City" placeholder="Nairobi" />
                    <Field control={form.control} name="country" label="Country" placeholder="Kenya" />
                    <Field control={form.control} name="googleMapsUrl" label="Google Maps Link URL" placeholder="https://maps.google.com/..." />
                    <Field control={form.control} name="googleMapsEmbedUrl" label="Google Maps Embed URL (iframe src)" placeholder="https://www.google.com/maps/embed?pb=..." span2 />
                  </div>
                </div>
                <div>
                  <SectionHeader icon={Globe} title="Social Media" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="facebookUrl" label="Facebook URL" placeholder="https://facebook.com/..." />
                    <Field control={form.control} name="instagramUrl" label="Instagram URL" placeholder="https://instagram.com/..." />
                    <Field control={form.control} name="twitterUrl" label="Twitter / X URL" placeholder="https://twitter.com/..." />
                    <Field control={form.control} name="youtubeUrl" label="YouTube URL" placeholder="https://youtube.com/..." />
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-8">
                <div>
                  <SectionHeader icon={Image} title="Hero Section" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="heroImage" label="Hero Background Image URL" placeholder="https://images.unsplash.com/..." span2 />
                  </div>
                </div>
                <div>
                  <SectionHeader icon={Globe} title="About Section" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="aboutTitle" label="About Title" placeholder="About AutoElite Motors" />
                    <Field control={form.control} name="aboutImage" label="About Image URL" placeholder="https://..." />
                    <Field control={form.control} name="aboutContent" label="About Text" component="textarea" span2 placeholder="Our story..." />
                  </div>
                </div>
                <div>
                  <SectionHeader icon={MessageSquare} title="Footer & SEO" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field control={form.control} name="footerTagline" label="Footer Tagline" placeholder="Nairobi's Premier Luxury Car Dealer" />
                    <Field control={form.control} name="metaDescription" label="Meta Description (SEO)" placeholder="AutoElite Motors — Premium cars in Nairobi" span2 />
                  </div>
                </div>
              </div>
            )}

            {/* Currency Tab */}
            {activeTab === "currency" && (
              <div className="space-y-8">
                <SectionHeader icon={DollarSign} title="Currency Settings" desc="Control how prices are displayed across the website" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Default Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="KES">KES — Kenyan Shilling (default)</SelectItem>
                          <SelectItem value="USD">USD — US Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Field control={form.control} name="usdToKesRate" label="USD to KES Exchange Rate" type="number" placeholder="130" />
                </div>
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200/70">
                  Note: Car prices are stored in USD. The exchange rate is used to display prices in KES on the website. 
                  Update this rate regularly to reflect current market rates.
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div className="space-y-8">
                <div>
                  <SectionHeader icon={Bot} title="WhatsApp Integration" />
                  <div className="space-y-4">
                    <FormField control={form.control} name="whatsappApiEnabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between bg-background rounded-lg p-4 border border-white/10">
                        <div>
                          <FormLabel className="text-sm font-bold text-white">Enable WhatsApp API</FormLabel>
                          <p className="text-xs text-gray-500 mt-1">Enable WhatsApp Business API for automated messages</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-8">
                <SectionHeader icon={Palette} title="Branding" desc="Logo, colors, and visual identity" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field control={form.control} name="logoUrl" label="Logo Image URL" placeholder="https://..." span2 />
                  <div>
                    <FormField control={form.control} name="primaryColor" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Primary Accent Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-3 items-center">
                            <input
                              type="color"
                              value={field.value || "#DC2626"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                            />
                            <Input
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="#DC2626"
                              className="bg-background border-white/10 text-white"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              className="px-8 h-11 uppercase tracking-widest font-bold text-sm rounded-sm"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
            {updateSettings.isSuccess && (
              <span className="text-green-400 text-sm">Settings saved successfully!</span>
            )}
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
