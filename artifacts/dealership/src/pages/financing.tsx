import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CTABanner } from "@/components/CTABanner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFinancingInquiry } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  carId: z.coerce.number().optional(),
  carTitle: z.string().optional(),
  loanAmount: z.coerce.number().min(1000, "Minimum loan amount is $1,000").optional(),
  downPayment: z.coerce.number().min(0).optional(),
  loanTermMonths: z.coerce.number().min(12).optional(),
  employmentStatus: z.string().optional(),
  message: z.string().optional(),
});

export default function Financing() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCarId = searchParams.get("carId");

  const [calculator, setCalculator] = useState({
    price: 50000,
    downPayment: 10000,
    term: 60,
    rate: 5.9
  });

  const calculateMonthly = () => {
    const principal = calculator.price - calculator.downPayment;
    const monthlyRate = calculator.rate / 100 / 12;
    const term = calculator.term;
    if (principal <= 0) return 0;
    if (monthlyRate === 0) return principal / term;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  };

  const { toast } = useToast();
  const createFinancing = useCreateFinancingInquiry();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      carId: initialCarId ? parseInt(initialCarId) : undefined,
      carTitle: "",
      loanAmount: undefined,
      downPayment: undefined,
      loanTermMonths: 60,
      employmentStatus: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createFinancing.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Application Submitted",
          description: "Our finance team will contact you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem submitting your application.",
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
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Financing Options</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We offer tailored financial solutions to make acquiring your dream vehicle as seamless as driving it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator */}
            <div className="bg-card border border-white/5 p-8 rounded-lg">
              <h2 className="font-serif text-2xl font-bold text-white mb-6">Payment Estimator</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">Vehicle Price ($)</label>
                  <Input 
                    type="number" 
                    value={calculator.price}
                    onChange={e => setCalculator(prev => ({...prev, price: Number(e.target.value)}))}
                    className="bg-background border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">Down Payment ($)</label>
                  <Input 
                    type="number" 
                    value={calculator.downPayment}
                    onChange={e => setCalculator(prev => ({...prev, downPayment: Number(e.target.value)}))}
                    className="bg-background border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">Term (Months)</label>
                  <Select value={calculator.term.toString()} onValueChange={v => setCalculator(prev => ({...prev, term: Number(v)}))}>
                    <SelectTrigger className="bg-background border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="36">36 Months</SelectItem>
                      <SelectItem value="48">48 Months</SelectItem>
                      <SelectItem value="60">60 Months</SelectItem>
                      <SelectItem value="72">72 Months</SelectItem>
                      <SelectItem value="84">84 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">Interest Rate (%)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={calculator.rate}
                    onChange={e => setCalculator(prev => ({...prev, rate: Number(e.target.value)}))}
                    className="bg-background border-white/10 text-white"
                  />
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary">
                    ${calculateMonthly().toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*This is an estimate. Actual rates and payments may vary.</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-card border border-white/5 p-8 rounded-lg">
              <h2 className="font-serif text-2xl font-bold text-white mb-6">Finance Pre-Approval</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-background border-white/10 text-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" className="bg-background border-white/10 text-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" className="bg-background border-white/10 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Desired Loan Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" className="bg-background border-white/10 text-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Down Payment ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10000" className="bg-background border-white/10 text-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Employment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-white/10 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Employed Full-Time">Employed Full-Time</SelectItem>
                            <SelectItem value="Employed Part-Time">Employed Part-Time</SelectItem>
                            <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                            <SelectItem value="Retired">Retired</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Additional Comments</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any specific requirements or questions?" className="bg-background border-white/10 text-white resize-none" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 uppercase tracking-widest font-bold" disabled={createFinancing.isPending}>
                    {createFinancing.isPending ? "Submitting..." : "Submit Application"}
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
