import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useListTestimonials } from "@workspace/api-client-react";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CTABanner } from "@/components/CTABanner";

export default function Testimonials() {
  const { data: testimonialsData } = useListTestimonials({ published: true, limit: 100 });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">Client Experiences</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Don't just take our word for it. Read what our distinguished clients have to say about their AutoElite experience.
            </p>
          </div>

          {testimonialsData?.testimonials && testimonialsData.testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonialsData.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-card border border-white/5 rounded-lg">
              No testimonials available at the moment.
            </div>
          )}
        </div>
      </main>

      <CTABanner 
        title="Ready to Start Your Journey?"
        subtitle="Join our family of satisfied clients."
        buttonText="View Inventory"
        buttonHref="/inventory"
      />
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
