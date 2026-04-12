import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTradeIn } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  ownerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0),
  condition: z.string().min(1, "Condition is required"),
  askingPrice: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export default function TradeIn() {
  const { toast } = useToast();
  const createTradeIn = useCreateTradeIn();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: "",
      phone: "",
      email: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      condition: "",
      askingPrice: undefined,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTradeIn.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Submission Received",
          description: "Our appraisal team will contact you shortly with an evaluation.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem submitting your request.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Value Your Trade</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upgrade to excellence. Tell us about your current vehicle, and we'll provide a competitive market valuation.
            </p>
          </div>

          <div className="bg-card border border-white/5 p-8 rounded-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Info */}
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="ownerName" render={({ field }) => (
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
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</FormLabel>
                        <FormControl><Input className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Vehicle Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="make" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Make *</FormLabel>
                        <FormControl><Input placeholder="e.g. Porsche" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="model" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Model *</FormLabel>
                        <FormControl><Input placeholder="e.g. 911" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="year" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Year *</FormLabel>
                        <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mileage" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Mileage *</FormLabel>
                        <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="condition" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Overall Condition *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-white/10 text-white">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent (Like new)</SelectItem>
                            <SelectItem value="Good">Good (Minor wear)</SelectItem>
                            <SelectItem value="Fair">Fair (Noticeable wear, needs some work)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Additional Details</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={form.control} name="askingPrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Expected Value ($)</FormLabel>
                        <FormControl><Input type="number" className="bg-background border-white/10 text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Modifications, Damage, or Notes</FormLabel>
                        <FormControl>
                          <Textarea className="bg-background border-white/10 text-white resize-none" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 uppercase tracking-widest font-bold text-sm" disabled={createTradeIn.isPending}>
                  {createTradeIn.isPending ? "Submitting..." : "Submit for Evaluation"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
