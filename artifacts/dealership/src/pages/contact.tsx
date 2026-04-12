import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useGetSettings, useCreateInquiry } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  type: z.string().min(1, "Inquiry type is required"),
  message: z.string().min(10, "Message is required"),
});

export default function Contact() {
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      type: "general",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createInquiry.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "Thank you for contacting us. We will get back to you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem sending your message.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">Contact Us</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our dedicated team is available to assist you with any inquiries regarding our inventory, services, or financing options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-card border border-white/5 p-8 rounded-lg">
                <h3 className="font-serif text-2xl font-bold text-white mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary mt-1 mr-4 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Location</h4>
                      <p className="text-gray-400 text-sm">
                        {settings?.address || "4820 Automotive Boulevard"}<br />
                        {settings?.city || "Los Angeles, CA 90001"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-primary mt-1 mr-4 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Phone</h4>
                      <p className="text-gray-400 text-sm">
                        {settings?.phone || "+1 (555) 234-5678"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-primary mt-1 mr-4 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Email</h4>
                      <p className="text-gray-400 text-sm">
                        {settings?.email || "sales@autoelitemotors.com"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-primary mt-1 mr-4 shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Hours</h4>
                      <p className="text-gray-400 text-sm">
                        {settings?.openingHours || "Mon-Sat 9AM-7PM, Sun 11AM-5PM"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-card border border-white/5 p-8 rounded-lg">
              <h3 className="font-serif text-2xl font-bold text-white mb-6">Send a Message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Full Name *</FormLabel>
                        <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Phone Number *</FormLabel>
                        <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</FormLabel>
                        <FormControl><Input type="email" className="bg-background border-white/10 text-white" {...field} /></FormControl>
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
                            <SelectItem value="sales">Sales & Inventory</SelectItem>
                            <SelectItem value="service">Service & Maintenance</SelectItem>
                            <SelectItem value="financing">Financing Options</SelectItem>
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
                        <Textarea className="bg-background border-white/10 text-white resize-none" rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full md:w-auto px-8 h-12 uppercase tracking-widest font-bold text-sm" disabled={createInquiry.isPending}>
                    {createInquiry.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
