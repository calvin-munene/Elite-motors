import { useState } from "react";
import { Link, useLocation } from "wouter";
import { History, X } from "lucide-react";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export function RecentlyViewed() {
  const { recentCars } = useRecentlyViewed();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  if (location.startsWith("/admin") || recentCars.length === 0) return null;

  const displayCars = recentCars.slice(0, 3);

  return (
    <div className="fixed bottom-24 left-4 z-40">
      {isOpen && (
        <div className="mb-2 bg-[#141414] border border-white/10 rounded-xl shadow-2xl w-72 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/5">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Recently Viewed</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {displayCars.map(car => (
              <Link key={car.id} href={`/cars/${car.slug}`} onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                    <img
                      src={car.gallery?.[0] || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200"}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold line-clamp-1">{car.title}</p>
                    <p className="text-primary text-xs font-semibold">{formatPrice(car.price)}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">{car.year} • {car.make}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {recentCars.length > 3 && (
            <div className="px-4 py-2 text-center border-t border-white/5">
              <span className="text-[10px] text-gray-500">+{recentCars.length - 3} more viewed</span>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-11 h-11 rounded-full bg-[#141414] border border-white/15 flex items-center justify-center shadow-lg hover:bg-white/10 transition-colors relative"
        title="Recently viewed vehicles"
      >
        <History className="w-4.5 h-4.5 text-gray-400" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-[9px] font-bold flex items-center justify-center">
          {recentCars.length}
        </span>
      </button>
    </div>
  );
}
