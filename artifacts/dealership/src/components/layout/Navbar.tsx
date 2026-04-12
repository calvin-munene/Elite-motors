import { Link, useLocation } from "wouter";
import { Menu, X, Phone, MapPin, Globe, Heart, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useGetSettings } from "@workspace/api-client-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { data: settings } = useGetSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.inventory, href: "/inventory" },
    { name: t.nav.showroom, href: "/showroom" },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const phone = settings?.phone || "+254 700 234 567";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex flex-col cursor-pointer">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-white">
                {settings?.dealerName?.split(" ")[0]?.toUpperCase() || "AUTOELITE"}
              </span>
              <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">
                {settings?.dealerName?.split(" ").slice(1).join(" ").toUpperCase() || "MOTORS"}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-xs uppercase tracking-wider font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary" : "text-gray-300"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "sw" : "en")}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all"
              title="Switch language / Badilisha lugha"
            >
              <Globe className="w-3 h-3" />
              {language === "en" ? "EN" : "SW"}
            </button>

            {/* Compare */}
            <Link href="/compare">
              <button className="relative flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all" title="Compare vehicles">
                <Scale className="w-3 h-3" />
                {compareList.length > 0 && (
                  <span className="w-4 h-4 bg-primary rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {compareList.length}
                  </span>
                )}
              </button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all" title="Wishlist">
                <Heart className="w-3 h-3" />
                {wishlist.length > 0 && (
                  <span className="w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </Link>

            <div className="flex items-center text-gray-300 text-xs">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" />
              <span>{phone}</span>
            </div>
            <Link href="/test-drive">
              <Button className="rounded-none uppercase tracking-widest text-xs font-bold px-6 h-9">
                {t.nav.testDrive}
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="block text-lg font-serif py-2 border-b border-border/50 text-white" onClick={() => setIsOpen(false)}>
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/compare">
                <div className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setIsOpen(false)}>
                  <Scale className="w-4 h-4 text-primary" />
                  <span>{t.nav.compare} ({compareList.length})</span>
                </div>
              </Link>
              <Link href="/wishlist">
                <div className="flex items-center gap-2 text-gray-300 py-2" onClick={() => setIsOpen(false)}>
                  <Heart className="w-4 h-4 text-primary" />
                  <span>{t.nav.wishlist} ({wishlist.length})</span>
                </div>
              </Link>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setLanguage(language === "en" ? "sw" : "en")}
                className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white">
                <Globe className="w-4 h-4" /> {language === "en" ? "English" : "Kiswahili"}
              </button>
            </div>
            <div className="pt-4 flex flex-col space-y-4">
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span>{settings?.city || "Nairobi, Kenya"}</span>
              </div>
              <Link href="/test-drive">
                <Button className="w-full rounded-none mt-4 uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                  {t.nav.testDrive}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
