import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { CTABanner } from "@/components/CTABanner";
import { CarCard } from "@/components/CarCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { BlogCard } from "@/components/BlogCard";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useGetFeaturedCars, useListTestimonials, useListBlogPosts, useGetSettings } from "@workspace/api-client-react";
import { RecommendedForYou } from "@/components/RecommendedForYou";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BadgeDollarSign, HeadphonesIcon, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredCars } = useGetFeaturedCars({ limit: 6 });
  const { data: testimonialsData } = useListTestimonials({ limit: 3, published: true });
  const { data: blogData } = useListBlogPosts({ limit: 3, published: true });
  const { data: settings } = useGetSettings();

  const defaultCategoryImages = {
    SUV: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    Luxury: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600",
    Sports: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600",
    Sedan: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600",
  };

  let settingsCategoryImages: Record<string, string> = {};
  try {
    if ((settings as any)?.categoryImages) {
      settingsCategoryImages = JSON.parse((settings as any).categoryImages);
    }
  } catch {}

  const categories = [
    { name: "SUV", image: settingsCategoryImages["SUV"] || defaultCategoryImages.SUV },
    { name: "Luxury", image: settingsCategoryImages["Luxury"] || defaultCategoryImages.Luxury },
    { name: "Sports", image: settingsCategoryImages["Sports"] || defaultCategoryImages.Sports },
    { name: "Sedan", image: settingsCategoryImages["Sedan"] || defaultCategoryImages.Sedan },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroBanner 
          title={settings?.heroTitle || "Discover Automotive Perfection"} 
          subtitle={settings?.heroSubtitle || "Explore our exclusive collection of premium, luxury, and performance vehicles."}
          image="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1600"
          showSearch={true}
        />

        {/* Featured Vehicles Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2">Our Collection</h2>
                <h3 className="font-serif text-3xl md:text-5xl font-bold text-white">Featured Vehicles</h3>
              </div>
              <Link href="/inventory">
                <Button variant="outline" className="mt-6 md:mt-0 rounded-sm border-white/20 text-white hover:bg-white/5 uppercase tracking-widest text-xs font-bold">
                  View All Inventory
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars?.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
              {(!featuredCars || featuredCars.length === 0) && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No featured vehicles currently available.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Browse by Category</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Find the perfect vehicle to match your lifestyle and driving preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.name} href={`/inventory?category=${category.name}`}>
                  <div className="group relative h-64 overflow-hidden rounded-lg cursor-pointer">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-2xl font-bold text-white uppercase tracking-wider">{category.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2">The AutoElite Advantage</h2>
                <h3 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">Why Choose Us</h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                  We don't just sell cars; we deliver an experience. Every vehicle in our showroom undergoes a rigorous inspection process to ensure it meets our exacting standards of excellence.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Verified Vehicles</h4>
                      <p className="text-gray-400 text-sm">Comprehensive multipoint inspection and detailed vehicle history report.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
                      <BadgeDollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Transparent Pricing</h4>
                      <p className="text-gray-400 text-sm">No hidden fees, no surprises. Just straightforward, competitive pricing.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
                      <HeadphonesIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Concierge Service</h4>
                      <p className="text-gray-400 text-sm">Dedicated support from your first inquiry through years of ownership.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden relative z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800" 
                    alt="Luxury car detail" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl z-0" />
                <div className="absolute -top-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl z-0" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonialsData?.testimonials && testimonialsData.testimonials.length > 0 && (
          <section className="py-24 bg-secondary">
            <div className="container mx-auto px-4 md:px-8">
              <div className="text-center mb-16">
                <h2 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2">Client Experiences</h2>
                <h3 className="font-serif text-3xl md:text-5xl font-bold text-white">What They Say</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonialsData.testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </section>
        )}

        <CTABanner />

        {/* Latest News */}
        {blogData?.posts && blogData.posts.length > 0 && (
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <h2 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2">Journal</h2>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold text-white">Latest News</h3>
                </div>
                <Link href="/blog">
                  <Button variant="outline" className="mt-6 md:mt-0 rounded-sm border-white/20 text-white hover:bg-white/5 uppercase tracking-widest text-xs font-bold">
                    View All Posts
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogData.posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}
        <RecommendedForYou />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
