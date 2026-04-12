import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useGetSettings, useCreateInquiry } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, Clock, Map } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaWhatsapp } from "react-icons/fa";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  type: z.string().min(1, "Inquiry type is required"),
  message: z.string().min(10, "Message is required"),
});

const DEFAULT_MAPS_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8230584296167!2d36.78259927496468!3d-1.2939419356574553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10ce56afbd27%3A0x91a5dc57b4be2c11!2sNgong%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1699000000000!5m2!1sen!2ske";

export default function Contact() {
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "", type: "general", message: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createInquiry.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Message Sent!", description: "We will get back to you within 24 hours." });
        form.reset();
      },
      onError: () => toast({ title: "Error", description: "Please try again.", variant: "destructive" }),
    });
  };

  const whatsappNumber = settings?.whatsapp || "254700234567";
  const mapsUrl = settings?.googleMapsEmbedUrl || DEFAULT_MAPS_URL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Phone className="w-3.5 h-3.5" />
              Get In Touch
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">{t.contact.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.contact.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-white/8 p-8 rounded-xl">
                <h3 className="font-serif text-xl font-bold text-white mb-6">Our Details</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Location</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {settings?.address || "Ngong Road, next to Prestige Plaza"}<br />
                        {settings?.city || "Nairobi, Kenya"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Phone</h4>
                      <a href={`tel:${settings?.phone}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {settings?.phone || "+254 700 234 567"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-green-600/10 border border-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaWhatsapp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">WhatsApp</h4>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hello, I'd like to inquire about your vehicles.`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 text-sm transition-colors"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Email</h4>
                      <a href={`mailto:${settings?.email}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {settings?.email || "sales@autoelitemotors.co.ke"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Hours</h4>
                      <p className="text-gray-400 text-sm">{settings?.openingHours || "Mon-Sat: 8AM - 7PM\nSun: 10AM - 5PM"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-card border border-white/8 p-8 rounded-xl">
              <h3 className="font-serif text-xl font-bold text-white mb-6">Send a Message</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Full Name *</FormLabel>
                        <FormControl><Input className="bg-background border-white/10 text-white" placeholder="John Kamau" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Phone Number *</FormLabel>
                        <FormControl><Input className="bg-background border-white/10 text-white" placeholder="+254 7XX XXX XXX" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</FormLabel>
                        <FormControl><Input type="email" className="bg-background border-white/10 text-white" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Inquiry Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-white/10 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="sales">Purchase Inquiry</SelectItem>
                            <SelectItem value="service">Service & Maintenance</SelectItem>
                            <SelectItem value="financing">Financing Options</SelectItem>
                            <SelectItem value="import">Japanese Import Request</SelectItem>
                            <SelectItem value="trade">Trade-In Valuation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          className="bg-background border-white/10 text-white resize-none"
                          rows={5}
                          placeholder="Tell us what you're looking for..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full sm:w-auto px-10 h-12 uppercase tracking-widest font-bold text-sm rounded-sm"
                    disabled={createInquiry.isPending}
                  >
                    {createInquiry.isPending ? "Sending..." : t.contact.send}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Google Maps */}
          <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8">
              <Map className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-white">Find Us on the Map</h3>
              <span className="text-xs text-gray-500">{settings?.address || "Ngong Road"}, {settings?.city || "Nairobi"}</span>
            </div>
            <div className="aspect-[16/6] w-full">
              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(0.9)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AutoElite Motors Location"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
