import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CTABanner } from "@/components/CTABanner";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=1600" 
              alt="Luxury Car Showroom" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          </div>
          
          <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-4xl">
            <h1 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">Our Story</h1>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-8">Redefining Automotive Excellence</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              For over two decades, AutoElite Motors has been the premier destination for discerning driving enthusiasts. We don't just sell cars; we curate an exceptional collection of the world's most prestigious vehicles.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24 bg-secondary">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="bg-card border border-white/5 p-12 rounded-lg">
                <h3 className="font-serif text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  To provide an unparalleled automotive purchasing and ownership experience, built on transparency, integrity, and a profound respect for our clients' time and expectations.
                </p>
              </div>
              <div className="bg-card border border-white/5 p-12 rounded-lg">
                <h3 className="font-serif text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-gray-400 leading-relaxed">
                  To be the global benchmark for luxury automotive retail, where passionate enthusiasts connect with exceptional engineering in an environment of absolute exclusivity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CTABanner 
          title="Meet The Team"
          subtitle="Our experts are ready to guide you to your perfect vehicle."
          buttonText="View Team"
          buttonHref="/team"
        />
      </main>
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
