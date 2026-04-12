import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CTABanner } from "@/components/CTABanner";
import { useListServices } from "@workspace/api-client-react";
import { Wrench, Shield, Key, Car, Sparkles, Coffee } from "lucide-react";

export default function Services() {
  const { data: services } = useListServices();

  const defaultIcons: Record<string, React.ReactNode> = {
    maintenance: <Wrench className="w-8 h-8 text-primary" />,
    warranty: <Shield className="w-8 h-8 text-primary" />,
    concierge: <Key className="w-8 h-8 text-primary" />,
    sourcing: <Car className="w-8 h-8 text-primary" />,
    detailing: <Sparkles className="w-8 h-8 text-primary" />,
    lounge: <Coffee className="w-8 h-8 text-primary" />
  };

  const getIcon = (iconName: string | null | undefined, title: string, index: number) => {
    if (iconName && defaultIcons[iconName.toLowerCase()]) {
      return defaultIcons[iconName.toLowerCase()];
    }
    const icons = Object.values(defaultIcons);
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">Premium Services</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Beyond our exceptional inventory, we offer a suite of tailored services designed to enhance every aspect of your ownership experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service, index) => (
              <div key={service.id} className="bg-card border border-white/5 p-8 rounded-lg hover:border-primary/50 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {getIcon(service.icon, service.title, index)}
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
            
            {/* Fallback if no services exist yet */}
            {(!services || services.length === 0) && (
              <>
                <div className="bg-card border border-white/5 p-8 rounded-lg hover:border-primary/50 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Key className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-4">Concierge Purchasing</h3>
                  <p className="text-gray-400 leading-relaxed">Let us locate your perfect vehicle through our global network. We handle negotiations, inspections, and transport.</p>
                </div>
                <div className="bg-card border border-white/5 p-8 rounded-lg hover:border-primary/50 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Wrench className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-4">White-Glove Maintenance</h3>
                  <p className="text-gray-400 leading-relaxed">Complimentary pickup and delivery for all scheduled maintenance, performed by certified technicians.</p>
                </div>
                <div className="bg-card border border-white/5 p-8 rounded-lg hover:border-primary/50 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-4">Extended Protection</h3>
                  <p className="text-gray-400 leading-relaxed">Comprehensive warranty options that provide peace of mind long after the original manufacturer warranty expires.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <CTABanner 
        title="Schedule a Service"
        subtitle="Contact our service department to arrange maintenance or inquire about our concierge offerings."
        buttonText="Contact Service"
        buttonHref="/contact"
      />
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
