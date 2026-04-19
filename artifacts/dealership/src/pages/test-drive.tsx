import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking, useListCars } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PayPalDeposit } from "@/components/PayPalDeposit";
import { ShieldCheck, Lock, RotateCcw } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  carId: z.coerce.number().min(1, "Please select a vehicle"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  message: z.string().optional(),
});

export default function TestDrive() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCarId = searchParams.get("carId");

  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: inventoryData } = useListCars({ limit: 100 });
  const { formatPrice } = useCurrency();
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [createdBookingLabel, setCreatedBookingLabel] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      carId: initialCarId ? parseInt(initialCarId) : 0,
      preferredDate: "",
      preferredTime: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedCar = inventoryData?.cars.find(c => c.id === values.carId);
    const carLabel = selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : "your test drive";

    createBooking.mutate({
      data: {
        ...values,
        carTitle: selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : undefined
      }
    }, {
      onSuccess: (created: any) => {
        toast({
          title: "Booking Saved",
          description: "Now secure your slot with a fully refundable deposit below.",
        });
        const id = created?.id ?? created?.data?.id;
        if (id) {
          setCreatedBookingId(Number(id));
          setCreatedBookingLabel(carLabel);
        }
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
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Book a Test Drive</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the thrill firsthand. Schedule a dedicated time to explore your next vehicle with one of our specialists.
            </p>
          </div>

          <div className="bg-card border border-white/5 p-8 rounded-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField control={form.control} name="carId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Select Vehicle *</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value ? field.value.toString() : undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-white/10 text-white h-12">
                          <SelectValue placeholder="Choose a vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventoryData?.cars.map(car => (
                          <SelectItem key={car.id} value={car.id.toString()}>
                            {car.year} {car.make} {car.model} {car.trim} — {formatPrice(car.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Full Name *</FormLabel>
                      <FormControl><Input className="bg-background border-white/10 text-white h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Phone Number *</FormLabel>
                      <FormControl><Input className="bg-background border-white/10 text-white h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</FormLabel>
                    <FormControl><Input type="email" className="bg-background border-white/10 text-white h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="preferredDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Preferred Date *</FormLabel>
                      <FormControl><Input type="date" className="bg-background border-white/10 text-white h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Preferred Time *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-white/10 text-white h-12">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</SelectItem>
                          <SelectItem value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-gray-400 font-bold">Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea className="bg-background border-white/10 text-white resize-none" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {!createdBookingId && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex gap-3 text-sm text-emerald-100">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Refundable deposit</span> — to secure your slot we'll
                      ask for a small deposit via PayPal after this step. It is <span className="font-bold">100% refunded</span>{" "}
                      after the test-drive meet-up at our showroom.
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 uppercase tracking-widest font-bold text-sm"
                  disabled={createBooking.isPending || !!createdBookingId}
                >
                  {createBooking.isPending
                    ? "Submitting..."
                    : createdBookingId
                    ? "Booking Saved ✓"
                    : "Continue to Deposit"}
                </Button>
              </form>
            </Form>
          </div>

          {createdBookingId && (
            <div className="mt-8 bg-card border border-emerald-500/30 p-8 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-1">Secure Your Slot</h2>
                <p className="text-gray-400 text-sm">
                  Refundable deposit for {createdBookingLabel}
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm">
                <Mini icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} label="100% refundable" />
                <Mini icon={<Lock className="w-4 h-4 text-emerald-400" />} label="Encrypted by PayPal" />
                <Mini icon={<RotateCcw className="w-4 h-4 text-emerald-400" />} label="Refund after meetup" />
              </div>
              <PayPalDeposit bookingId={createdBookingId} onSuccess={() => {}} />
              <p className="text-center text-xs text-gray-500 mt-4">
                Don't want to pay online?{" "}
                <a href="https://wa.me/254734336227" className="text-emerald-300 hover:underline" target="_blank" rel="noopener noreferrer">
                  Confirm on WhatsApp instead
                </a>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-background/50 border border-white/5 rounded-md px-3 py-2 text-gray-300">
      {icon}
      <span>{label}</span>
    </div>
  );
}
