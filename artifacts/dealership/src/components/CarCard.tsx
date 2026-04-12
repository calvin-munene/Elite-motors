import { Link } from "wouter";
import { Car } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, Fuel, Gauge, Heart, Scale, Plane, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useGetSettings } from "@workspace/api-client-react";

interface CarCardProps {
  car: Car;
}

function LiveViewers({ carId }: { carId: number }) {
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 8) + 1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.random() < 0.5 ? 1 : -1;
        return Math.max(1, Math.min(12, prev + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [carId]);

  return (
    <div className="flex items-center gap-1 text-[10px] text-orange-400">
      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
      {viewers} viewing now
    </div>
  );
}

function isRecentlyListed(createdAt: string): boolean {
  const created = new Date(createdAt);
  const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysAgo < 7;
}

export function CarCard({ car }: CarCardProps) {
  const { formatPrice } = useCurrency();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: settings } = useGetSettings();

  const whatsappNumber = settings?.whatsapp || "254700234567";
  const inCompare = isInCompare(car.id);
  const inWishlist = isInWishlist(car.id);

  const formatMileage = (km: number) => {
    return new Intl.NumberFormat("en-KE").format(km) + " km";
  };

  const defaultImage = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800";
  const image = car.gallery && car.gallery.length > 0 ? car.gallery[0] : defaultImage;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(car.id);
      toast({ title: "Removed from comparison" });
    } else {
      const success = addToCompare(car);
      if (!success) {
        toast({ title: "Comparison full", description: "You can compare up to 3 vehicles at once.", variant: "destructive" });
      } else {
        toast({ title: "Added to comparison", description: `${car.title} added. Visit Compare page.` });
      }
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(car.id);
      toast({ title: "Removed from wishlist" });
    } else {
      addToWishlist(car);
      toast({ title: "Saved to wishlist", description: `${car.title} saved.` });
    }
  };

  const getAvailabilityLabel = () => {
    switch (car.availability) {
      case "available": return t.car.available;
      case "reserved": return t.car.reserved;
      case "sold": return t.car.sold;
      case "in_transit": return t.car.inTransit;
      default: return car.availability;
    }
  };

  const availabilityColorMap: Record<string, string> = {
    available: "bg-green-600/90 text-white",
    reserved: "bg-orange-500/90 text-white",
    sold: "bg-red-600/90 text-white",
    in_transit: "bg-blue-600/90 text-white",
  };
  const availabilityColor = availabilityColorMap[car.availability] || "bg-gray-600/90 text-white";

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={car.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {car.condition === "new" ? (
            <Badge className="bg-primary hover:bg-primary/90 text-white border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
              {t.car.new}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-black/80 backdrop-blur-md text-white border border-white/10 rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
              {t.car.preOwned}
            </Badge>
          )}
          {car.isFeatured && (
            <Badge variant="secondary" className="bg-yellow-500/90 text-black border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
              {t.car.featured}
            </Badge>
          )}
          {car.isJapaneseImport && (
            <Badge variant="secondary" className="bg-blue-600/90 text-white border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
              <Plane className="w-2.5 h-2.5" /> JDM
            </Badge>
          )}
          {isRecentlyListed(car.createdAt) && (
            <Badge variant="secondary" className="bg-purple-600/90 text-white border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
              {t.car.justListed}
            </Badge>
          )}
        </div>

        {/* Top Right: Availability + Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <Badge variant="secondary" className={`rounded-sm uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 border-none ${availabilityColor}`}>
            {getAvailabilityLabel()}
          </Badge>
          <div className="flex gap-1.5">
            <button
              onClick={handleWishlist}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                inWishlist ? "bg-red-600 text-white" : "bg-black/60 text-white hover:bg-red-600/80"
              }`}
              title={t.car.saveToWishlist}
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleCompare}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                inCompare ? "bg-primary text-white" : "bg-black/60 text-white hover:bg-primary/80"
              }`}
              title={t.car.addToCompare}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live viewers overlay */}
        <div className="absolute bottom-2 left-3">
          <LiveViewers carId={car.id} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-0.5">{car.year} • {car.make}</div>
            <Link href={`/cars/${car.slug}`}>
              <h3 className="font-serif text-lg font-semibold text-white hover:text-primary transition-colors cursor-pointer line-clamp-1">
                {car.title}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-5 mt-3">
          <span className="text-xl font-bold text-white">{formatPrice(car.price)}</span>
          {car.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(car.discountedPrice)}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-5 pt-3 border-t border-white/5">
          <div className="flex items-center text-gray-400 text-xs">
            <Gauge className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {formatMileage(car.mileage)}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Fuel className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {car.fuelType}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Settings className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {car.transmission}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span className="truncate">{car.location || "Nairobi, Kenya"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/cars/${car.slug}`} className="flex-1">
            <Button className="w-full rounded-sm uppercase tracking-widest text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 h-9">
              {t.inventory.viewDetails}
            </Button>
          </Link>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hi, I'm interested in the ${car.year} ${car.title} (${formatPrice(car.price)}) at AutoElite Motors. Can you share more details?`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            title="Chat with sales rep on WhatsApp"
          >
            <Button variant="outline" className="w-9 h-9 p-0 rounded-sm bg-green-600 hover:bg-green-700 text-white border-none">
              <FaWhatsapp className="w-4 h-4" />
            </Button>
          </a>
          <a
            href={`https://wa.me/?text=Check out this ${car.year} ${car.title} for ${formatPrice(car.price)} at AutoElite Motors Nairobi! ${window.location.origin}/cars/${car.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            title="Share this vehicle on WhatsApp"
          >
            <Button variant="outline" className="w-9 h-9 p-0 rounded-sm bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10">
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
