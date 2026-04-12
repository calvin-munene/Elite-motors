import { useGetCarBySlug, useGetRelatedCars } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CarCard } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info, Shield, ArrowLeft, Fuel, Settings, Gauge, MapPin } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function CarDetail() {
  const { slug } = useParams();
  const { data: car, isLoading, error } = useGetCarBySlug(slug as string, {
    query: {
      enabled: !!slug
    }
  });

  const { data: relatedCarsData } = useGetRelatedCars(car?.id as number, { limit: 3 }, {
    query: {
      enabled: !!car?.id
    }
  });

  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Vehicle Not Found</h1>
            <p className="text-gray-400 mb-8">The vehicle you are looking for may have been sold or removed.</p>
            <Link href="/inventory">
              <Button>Back to Inventory</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (miles: number) => {
    return new Intl.NumberFormat('en-US').format(miles) + ' mi';
  };

  const images = car.gallery && car.gallery.length > 0 
    ? car.gallery 
    : ["https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider mb-6">
            <Link href="/inventory" className="hover:text-white transition-colors flex items-center">
              <ArrowLeft className="w-3 h-3 mr-2" />
              Inventory
            </Link>
            <span className="mx-3">/</span>
            <span>{car.make}</span>
            <span className="mx-3">/</span>
            <span className="text-white">{car.model}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Images & Details */}
            <div className="lg:col-span-2 space-y-12">
              {/* Gallery */}
              <div className="space-y-4">
                <div className="aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-card">
                  <img 
                    src={images[activeImage]} 
                    alt={`${car.year} ${car.title}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-4">
                    {images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-[4/3] rounded border-2 overflow-hidden cursor-pointer ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        onClick={() => setActiveImage(idx)}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Overview</h2>
                <div className="prose prose-invert max-w-none text-gray-400">
                  <p>{car.description || car.shortDescription || "No description available for this vehicle."}</p>
                </div>
              </section>

              {/* Specs Table */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Make</span>
                    <span className="text-white font-medium">{car.make}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Model</span>
                    <span className="text-white font-medium">{car.model}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Year</span>
                    <span className="text-white font-medium">{car.year}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Body Style</span>
                    <span className="text-white font-medium">{car.bodyType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Exterior Color</span>
                    <span className="text-white font-medium">{car.color}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Engine</span>
                    <span className="text-white font-medium">{car.engineSize || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Transmission</span>
                    <span className="text-white font-medium">{car.transmission}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Drivetrain</span>
                    <span className="text-white font-medium">{car.drivetrain || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">Fuel Type</span>
                    <span className="text-white font-medium">{car.fuelType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 uppercase tracking-wider text-xs">VIN</span>
                    <span className="text-white font-medium">{car.vin || "Available upon request"}</span>
                  </div>
                </div>
              </section>

              {/* Features */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {car.safetyFeatures && car.safetyFeatures.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-primary" /> Safety
                      </h3>
                      <ul className="space-y-2">
                        {car.safetyFeatures.map((f, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-400">
                            <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {car.comfortFeatures && car.comfortFeatures.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-primary" /> Comfort & Convenience
                      </h3>
                      <ul className="space-y-2">
                        {car.comfortFeatures.map((f, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-400">
                            <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Pricing & CTAs */}
            <div>
              <div className="bg-card border border-white/10 rounded-lg p-8 sticky top-28">
                <div className="flex gap-2 mb-4">
                  <Badge className="bg-white/10 text-white hover:bg-white/20 border-none uppercase tracking-widest text-[10px] font-bold">
                    {car.condition === 'new' ? 'New' : 'Pre-Owned'}
                  </Badge>
                  <Badge className={`${car.availability === 'available' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} hover:bg-white/20 border-none uppercase tracking-widest text-[10px] font-bold`}>
                    {car.availability}
                  </Badge>
                </div>

                <h1 className="font-serif text-3xl font-bold text-white mb-2">{car.title}</h1>
                <p className="text-gray-400 mb-6">{car.trim || `${car.year} • ${car.make} ${car.model}`}</p>

                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-4xl font-bold text-white">{formatPrice(car.price)}</span>
                  {car.discountedPrice && (
                    <span className="text-lg text-gray-500 line-through">{formatPrice(car.discountedPrice)}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-background rounded-md p-4 flex items-center">
                    <Gauge className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Mileage</div>
                      <div className="text-sm text-white font-medium">{formatMileage(car.mileage)}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-md p-4 flex items-center">
                    <Fuel className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Fuel</div>
                      <div className="text-sm text-white font-medium">{car.fuelType}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-md p-4 flex items-center">
                    <Settings className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Trans</div>
                      <div className="text-sm text-white font-medium">{car.transmission}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-md p-4 flex items-center">
                    <MapPin className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Location</div>
                      <div className="text-sm text-white font-medium truncate">{car.location || "Showroom"}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href={`/test-drive?carId=${car.id}`}>
                    <Button className="w-full h-14 text-sm font-bold uppercase tracking-widest rounded-sm" disabled={car.availability !== 'available'}>
                      Book Test Drive
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href={`https://wa.me/15552345678?text=I'm interested in the ${car.year} ${car.title}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full h-12 text-xs font-bold uppercase tracking-widest rounded-sm border-green-600/30 text-green-500 hover:bg-green-600 hover:text-white">
                        <FaWhatsapp className="w-4 h-4 mr-2" /> WhatsApp
                      </Button>
                    </a>
                    <Link href={`/financing?carId=${car.id}`}>
                      <Button variant="outline" className="w-full h-12 text-xs font-bold uppercase tracking-widest rounded-sm border-white/20 text-white hover:bg-white/10">
                        Finance
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Vehicles */}
          {relatedCarsData && relatedCarsData.length > 0 && (
            <div className="mt-32">
              <h2 className="font-serif text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Related Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedCarsData.map(relatedCar => (
                  <CarCard key={relatedCar.id} car={relatedCar} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
