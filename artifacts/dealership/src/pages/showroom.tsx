import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CTABanner } from "@/components/CTABanner";
import { useGetSettings } from "@workspace/api-client-react";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

export default function Showroom() {
  const { data: settings } = useGetSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">Our Showroom</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience automotive excellence in our state-of-the-art facility. 
              Designed to showcase the world's finest vehicles in their best light.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=800" 
                alt="Showroom Interior" 
                className="w-full h-80 object-cover rounded-lg border border-white/10"
              />
              <div className="grid grid-cols-2 gap-6">
                <img 
                  src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400" 
                  alt="Showroom Detail" 
                  className="w-full h-48 object-cover rounded-lg border border-white/10"
                />
                <img 
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400" 
                  alt="Showroom Detail" 
                  className="w-full h-48 object-cover rounded-lg border border-white/10"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="font-serif text-3xl font-bold text-white mb-8">Visit Us</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Location</h3>
                    <p className="text-gray-400">
                      {settings?.address || "4820 Automotive Boulevard"}<br />
                      {settings?.city || "Los Angeles, CA 90001"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Hours of Operation</h3>
                    <p className="text-gray-400">
                      {settings?.openingHours || "Mon-Sat 9AM-7PM, Sun 11AM-5PM"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Contact</h3>
                    <p className="text-gray-400">
                      {settings?.phone || "+1 (555) 234-5678"}<br />
                      {settings?.email || "sales@autoelitemotors.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-[500px] rounded-lg overflow-hidden border border-white/10">
            {settings?.googleMapsUrl ? (
              <iframe 
                src={settings.googleMapsUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-gray-500">
                Map location not configured
              </div>
            )}
          </div>
        </div>
      </main>

      <CTABanner 
        title="Schedule a Private Viewing" 
        subtitle="Book a dedicated appointment with one of our specialists."
        buttonText="Book Appointment"
      />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
