import { useGetCarBySlug, useGetRelatedCars, useGetSettings } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CarCard } from "@/components/CarCard";
import { Car360Viewer } from "@/components/Car360Viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info, Shield, ArrowLeft, Fuel, Settings, Gauge, MapPin, Plane, Star, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Scale, Heart } from "lucide-react";

function LiveViewers({ carId }: { carId: number }) {
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 8) + 2);
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => Math.max(1, Math.min(15, prev + (Math.random() < 0.5 ? 1 : -1))));
    }, 10000);
    return () => clearInterval(interval);
  }, [carId]);
  return (
    <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
      {viewers} people viewing this now
    </div>
  );
}

export default function CarDetail() {
  const { slug } = useParams();
  const { data: car, isLoading, error } = useGetCarBySlug(slug as string, { query: { enabled: !!slug } });
  const { data: relatedCarsData } = useGetRelatedCars(car?.id as number, { limit: 3 }, { query: { enabled: !!car?.id } });
  const { data: settings } = useGetSettings();
  const { formatPrice } = useCurrency();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [view360, setView360] = useState(false);

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
            <p className="text-gray-400 mb-8">This vehicle may have been sold or removed.</p>
            <Link href="/inventory"><Button>Back to Inventory</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappNumber = settings?.whatsapp || "254700234567";
  const images = car.gallery && car.gallery.length > 0
    ? car.gallery
    : ["https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200"];

  const inCompare = isInCompare(car.id);
  const inWishlist = isInWishlist(car.id);

  const handleCompare = () => {
    if (inCompare) { removeFromCompare(car.id); toast({ title: "Removed from comparison" }); }
    else {
      const ok = addToCompare(car);
      if (!ok) toast({ title: "Comparison full", description: "Max 3 vehicles", variant: "destructive" });
      else toast({ title: "Added to comparison" });
    }
  };
  const handleWishlist = () => {
    if (inWishlist) { removeFromWishlist(car.id); toast({ title: "Removed from wishlist" }); }
    else { addToWishlist(car); toast({ title: "Saved to wishlist" }); }
  };

  const formatMileage = (km: number) => new Intl.NumberFormat("en-KE").format(km) + " km";

  const auctionGradeLabel: Record<string, string> = {
    "S": "S — Showroom Quality (Perfect)", "5": "Grade 5 — Excellent", "4.5": "Grade 4.5 — Very Good+",
    "4": "Grade 4 — Very Good", "3.5": "Grade 3.5 — Good+", "3": "Grade 3 — Good",
  };

  const shippingStatusLabel: Record<string, string> = {
    "at_auction": "At Auction in Japan", "purchased": "Purchased — Awaiting Export",
    "in_transit": "In Transit (Sea Freight)", "arrived": "Arrived in Kenya",
    "clearing": "Clearing at Port", "ready": "Ready for Delivery",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-6">
            <Link href="/inventory" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> {t.nav.inventory}
            </Link>
            <span>/</span><span>{car.make}</span><span>/</span>
            <span className="text-white">{car.model}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Gallery & Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Gallery / 360 toggle */}
              <div className="space-y-4">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setView360(false)}
                    className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors ${!view360 ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => setView360(true)}
                    className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${view360 ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                  >
                    360° View
                  </button>
                </div>

                {view360 ? (
                  <Car360Viewer images={images} title={car.title} />
                ) : (
                  <>
                    <div className="aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-card relative">
                      <img src={images[activeImage]} alt={`${car.year} ${car.title}`} className="w-full h-full object-cover" />
                      {/* Live viewers */}
                      <div className="absolute bottom-4 left-4">
                        <LiveViewers carId={car.id} />
                      </div>
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-5 gap-3">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`aspect-[4/3] rounded border-2 overflow-hidden cursor-pointer transition-all ${activeImage === idx ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"}`}
                            onClick={() => setActiveImage(idx)}
                          >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Japanese Import Details */}
              {car.isJapaneseImport && (
                <section className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6">
                  <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-400" />
                    Japanese Import Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {car.auctionGrade && (
                      <div className="bg-blue-900/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Auction Grade
                        </div>
                        <div className="text-white font-bold text-lg">{car.auctionGrade}</div>
                        <div className="text-blue-200/70 text-xs mt-1">
                          {auctionGradeLabel[car.auctionGrade] || `Grade ${car.auctionGrade}`}
                        </div>
                      </div>
                    )}
                    {car.chassisNumber && (
                      <div className="bg-blue-900/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">{t.car.chassisNo}</div>
                        <div className="text-white font-mono text-sm">{car.chassisNumber}</div>
                      </div>
                    )}
                    {car.shippingStatus && (
                      <div className="bg-blue-900/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">{t.car.shippingStatus}</div>
                        <div className="text-white text-sm">{shippingStatusLabel[car.shippingStatus] || car.shippingStatus}</div>
                      </div>
                    )}
                    {car.japanDepartureDate && (
                      <div className="bg-blue-900/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">{t.car.departureDate}</div>
                        <div className="text-white text-sm">{new Date(car.japanDepartureDate).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</div>
                      </div>
                    )}
                    {car.kenyaArrivalDate && (
                      <div className="bg-blue-900/20 rounded-lg p-3">
                        <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">{t.car.arrivalDate}</div>
                        <div className="text-white text-sm">{new Date(car.kenyaArrivalDate).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href="/kra-calculator">
                      <button className="flex items-center gap-2 text-xs text-blue-300 hover:text-blue-100 transition-colors border border-blue-500/30 hover:border-blue-400/50 rounded-full px-4 py-2">
                        <Calculator className="w-3.5 h-3.5" />
                        Calculate KRA Import Duty for this vehicle
                      </button>
                    </Link>
                  </div>
                </section>
              )}

              {/* Description */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Overview</h2>
                <div className="prose prose-invert max-w-none text-gray-400">
                  <p>{car.description || car.shortDescription || "No description available for this vehicle."}</p>
                </div>
              </section>

              {/* Specifications */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                  {[
                    ["Make", car.make], ["Model", car.model], ["Year", car.year],
                    ["Body Style", car.bodyType], ["Color", car.color],
                    ["Engine", car.engineSize || "N/A"], ["Transmission", car.transmission],
                    ["Drivetrain", car.drivetrain || "N/A"], ["Fuel Type", car.fuelType],
                    ["Mileage", formatMileage(car.mileage)],
                    ["Seats", car.seats || "N/A"], ["Doors", car.doors || "N/A"],
                    ["VIN", car.vin || "Available on request"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-white/5">
                      <span className="text-gray-500 uppercase tracking-wider text-xs">{label}</span>
                      <span className="text-white font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Features */}
              {(car.safetyFeatures?.length > 0 || car.comfortFeatures?.length > 0) && (
                <section>
                  <h2 className="font-serif text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {car.safetyFeatures && car.safetyFeatures.length > 0 && (
                      <div>
                        <h3 className="text-white font-bold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-primary" /> Safety</h3>
                        <ul className="space-y-2">
                          {car.safetyFeatures.map((f, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-400">
                              <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {car.comfortFeatures && car.comfortFeatures.length > 0 && (
                      <div>
                        <h3 className="text-white font-bold mb-4 flex items-center"><Info className="w-5 h-5 mr-2 text-primary" /> Comfort & Tech</h3>
                        <ul className="space-y-2">
                          {car.comfortFeatures.map((f, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-400">
                              <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Pricing & CTAs */}
            <div>
              <div className="bg-card border border-white/10 rounded-xl p-7 sticky top-28 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 text-white hover:bg-white/20 border-none uppercase tracking-widest text-[10px] font-bold rounded-sm">
                    {car.condition === "new" ? t.car.new : t.car.preOwned}
                  </Badge>
                  {car.isJapaneseImport && (
                    <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/20 uppercase tracking-widest text-[10px] font-bold rounded-sm">
                      <Plane className="w-2.5 h-2.5 mr-1" /> JDM
                    </Badge>
                  )}
                  <Badge className={`${car.availability === "available" ? "bg-green-600/20 text-green-400 border-green-600/20" : "bg-red-600/20 text-red-400 border-red-600/20"} border uppercase tracking-widest text-[10px] font-bold rounded-sm`}>
                    {car.availability}
                  </Badge>
                </div>

                <div>
                  <h1 className="font-serif text-2xl font-bold text-white mb-1">{car.title}</h1>
                  <p className="text-gray-400 text-sm">{car.trim || `${car.year} • ${car.make} ${car.model}`}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white">{formatPrice(car.price)}</span>
                    {car.discountedPrice && (
                      <span className="text-base text-gray-500 line-through">{formatPrice(car.discountedPrice)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <LiveViewers carId={car.id} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Gauge, label: "Mileage", value: formatMileage(car.mileage) },
                    { icon: Fuel, label: "Fuel", value: car.fuelType },
                    { icon: Settings, label: "Trans", value: car.transmission },
                    { icon: MapPin, label: "Location", value: car.location || "Nairobi" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-background rounded-lg p-3 flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">{label}</div>
                        <div className="text-xs text-white font-medium truncate max-w-[80px]">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Link href={`/test-drive?carId=${car.id}`}>
                    <Button className="w-full h-12 text-xs font-bold uppercase tracking-widest rounded-sm" disabled={car.availability !== "available"}>
                      Book Test Drive
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=I'm interested in the ${car.year} ${car.title} (${formatPrice(car.price)})`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full h-10 text-xs font-bold uppercase tracking-wider rounded-sm border-green-600/40 text-green-400 hover:bg-green-600 hover:text-white hover:border-green-600">
                        <FaWhatsapp className="w-4 h-4 mr-1.5" /> WhatsApp
                      </Button>
                    </a>
                    <Link href={`/financing?carId=${car.id}`}>
                      <Button variant="outline" className="w-full h-10 text-xs font-bold uppercase tracking-wider rounded-sm border-white/20 text-white hover:bg-white/10">
                        Finance
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleWishlist}
                      className={`h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors ${
                        inWishlist ? "bg-red-600/20 border-red-600/40 text-red-400" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
                      {inWishlist ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={handleCompare}
                      className={`h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border transition-colors ${
                        inCompare ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      {inCompare ? "Added" : "Compare"}
                    </button>
                  </div>
                </div>

                {/* Dealer info */}
                <div className="pt-4 border-t border-white/8 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> {settings?.address || "Ngong Road, Nairobi"}</div>
                  <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-primary" /> Verified Dealer • NTSA Compliant</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Vehicles */}
          {relatedCarsData && relatedCarsData.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Related Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedCarsData.map(relatedCar => <CarCard key={relatedCar.id} car={relatedCar} />)}
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
