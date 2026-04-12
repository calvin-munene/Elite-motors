import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AIChatbot } from "@/components/AIChatbot";
import { CarCard } from "@/components/CarCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist, clearWishlist } = useWishlist();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary fill-current" />
                {t.wishlist.title}
              </h1>
              <p className="text-gray-400">{t.wishlist.subtitle}</p>
            </div>
            {wishlist.length > 0 && (
              <Button variant="outline" onClick={clearWishlist} className="border-white/10 text-gray-400 hover:text-white">
                Clear All
              </Button>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-3">{t.wishlist.empty}</h2>
              <p className="text-gray-400 mb-8">Browse our inventory and save vehicles you're interested in</p>
              <Link href="/inventory">
                <Button>Browse Inventory</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">{wishlist.length} vehicle{wishlist.length !== 1 ? "s" : ""} saved</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
      <AIChatbot />
    </div>
  );
}
