import { Link } from "wouter";
import { Car } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, Fuel, Gauge } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
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

  const defaultImage = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800";
  const image = car.gallery && car.gallery.length > 0 ? car.gallery[0] : defaultImage;

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={car.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {car.condition === 'new' ? (
            <Badge className="bg-primary hover:bg-primary/90 text-white border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-3 py-1">
              New
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-black/80 backdrop-blur-md text-white border border-white/10 rounded-sm uppercase tracking-widest text-[10px] font-bold px-3 py-1">
              Pre-Owned
            </Badge>
          )}
          
          {car.isFeatured && (
            <Badge variant="secondary" className="bg-accent/90 text-black border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-3 py-1">
              Featured
            </Badge>
          )}
        </div>

        {/* Availability */}
        <div className="absolute top-4 right-4">
          <Badge 
            variant="secondary" 
            className={`rounded-sm uppercase tracking-widest text-[10px] font-bold px-3 py-1 border-none ${
              car.availability === 'available' ? 'bg-green-600/90 text-white' : 
              car.availability === 'reserved' ? 'bg-orange-500/90 text-white' : 
              'bg-red-600/90 text-white'
            }`}
          >
            {car.availability}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-xs text-gray-400 mb-1">{car.year} • {car.make}</div>
            <Link href={`/cars/${car.slug}`}>
              <h3 className="font-serif text-xl font-semibold text-white hover:text-primary transition-colors cursor-pointer line-clamp-1">
                {car.title}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-6 mt-4">
          <span className="text-2xl font-bold text-white">{formatPrice(car.price)}</span>
          {car.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(car.discountedPrice)}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 pt-4 border-t border-white/5">
          <div className="flex items-center text-gray-400 text-xs">
            <Gauge className="w-4 h-4 mr-2 text-gray-500" />
            {formatMileage(car.mileage)}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Fuel className="w-4 h-4 mr-2 text-gray-500" />
            {car.fuelType}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Settings className="w-4 h-4 mr-2 text-gray-500" />
            {car.transmission}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span className="truncate">{car.location || "Los Angeles, CA"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/cars/${car.slug}`} className="flex-1">
            <Button className="w-full rounded-sm uppercase tracking-widest text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10">
              View Details
            </Button>
          </Link>
          <a 
            href={`https://wa.me/15552345678?text=I'm interested in the ${car.year} ${car.title}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <Button variant="outline" className="w-10 h-10 p-0 rounded-sm bg-green-600 hover:bg-green-700 text-white border-none transition-colors">
              <FaWhatsapp className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
