import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircle, RefreshCw, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingPaymentCancelled() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bookingId = params.get("bookingId");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-2xl">
          <div className={`text-center transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500/40 mb-6">
              <XCircle className="w-14 h-14 text-amber-400" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Payment Not Completed
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              No worries — nothing was charged.
            </p>
            <p className="text-gray-400">
              Your booking request is still on file. You can pay the deposit later, or our team can confirm by phone.
            </p>
          </div>

          <div className={`mt-10 bg-card border border-white/10 rounded-2xl p-6 transition-all duration-700 delay-150 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="text-white font-bold mb-4 text-lg">What would you like to do?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href={`/test-drive${bookingId ? `?retryBooking=${bookingId}` : ""}`}>
                <Button className="w-full h-12">
                  <RefreshCw className="w-4 h-4 mr-2" /> Try payment again
                </Button>
              </Link>
              <a href="tel:+254734336227">
                <Button variant="outline" className="w-full h-12 border-white/10">
                  <Phone className="w-4 h-4 mr-2" /> Call us
                </Button>
              </a>
            </div>
            <a
              href="https://wa.me/254734336227"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3"
            >
              <Button variant="outline" className="w-full h-12 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                <MessageCircle className="w-4 h-4 mr-2" /> Continue on WhatsApp
              </Button>
            </a>
          </div>

          <div className={`mt-6 text-xs text-gray-500 text-center transition-all duration-700 delay-300 ${show ? "opacity-100" : "opacity-0"}`}>
            {bookingId && <>Booking ref: <span className="text-gray-300">#{bookingId}</span></>}
          </div>

          <div className={`mt-10 text-center transition-all duration-700 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <Link href="/">
              <Button variant="ghost" className="text-gray-400">
                ← Back to home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
