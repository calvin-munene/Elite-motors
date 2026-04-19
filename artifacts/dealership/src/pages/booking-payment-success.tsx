import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ShieldCheck, Calendar, RotateCcw, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingPaymentSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bookingId = params.get("bookingId");
  const captureId = params.get("captureId");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          {/* Hero check */}
          <div className={`text-center transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40 mb-8 relative">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Booking Confirmed
            </h1>
            <p className="text-xl text-emerald-300 mb-2">Your refundable deposit is secured</p>
            <p className="text-gray-400">
              We'll see you at the test drive — your money is fully protected.
            </p>
          </div>

          {/* Refund-guarantee card */}
          <div className={`mt-12 bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 rounded-2xl p-8 transition-all duration-700 delay-150 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  100% Refund Guarantee
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Your deposit is held safely with PayPal. As soon as you complete the test drive
                  meet-up at our showroom — whether you decide to buy the car or not — we'll
                  refund your deposit in full, immediately, back to your original PayPal account.
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className={`mt-8 grid md:grid-cols-3 gap-4 transition-all duration-700 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <Step icon={<Phone className="w-5 h-5" />} title="We'll call you" body="Within 1 business hour to confirm the time and exact pickup location." />
            <Step icon={<Calendar className="w-5 h-5" />} title="Test drive day" body="Bring your driver's license. Allow about 45 minutes for a thorough drive." />
            <Step icon={<RotateCcw className="w-5 h-5" />} title="Instant refund" body="Right after the meet-up your deposit is refunded back to PayPal." />
          </div>

          {/* Showroom */}
          <div className={`mt-8 bg-card border border-white/10 rounded-2xl p-6 transition-all duration-700 delay-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Showroom</h3>
            </div>
            <p className="text-gray-300">
              Ngong Road, next to Prestige Plaza · Nairobi
              <br />
              <span className="text-gray-500 text-sm">Mon–Sat 8AM–7PM · Sun 10AM–5PM</span>
            </p>
          </div>

          {/* Receipt */}
          <div className={`mt-6 text-xs text-gray-500 text-center transition-all duration-700 delay-700 ${show ? "opacity-100" : "opacity-0"}`}>
            {bookingId && <>Booking ref: <span className="text-gray-300">#{bookingId}</span> · </>}
            {captureId && <>Payment ref: <span className="text-gray-300">{captureId}</span></>}
          </div>

          <div className={`mt-10 flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <Link href="/inventory">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                Browse more vehicles
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 border-white/10">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-card border border-white/10 rounded-xl p-5">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 mb-3">
        {icon}
      </div>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}
