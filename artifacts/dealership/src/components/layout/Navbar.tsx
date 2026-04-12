import { Link, useLocation } from "wouter";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Inventory", href: "/inventory" },
    { name: "Showroom", href: "/showroom" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex flex-col cursor-pointer">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-white">
                AUTOELITE
              </span>
              <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">
                MOTORS
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary" : "text-gray-300"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center text-gray-300 text-sm">
              <Phone className="w-4 h-4 mr-2 text-primary" />
              <span>+1 (555) 234-5678</span>
            </div>
            <Link href="/test-drive">
              <Button className="rounded-none uppercase tracking-widest text-xs font-bold px-8">
                Test Drive
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className="block text-lg font-serif py-2 border-b border-border/50 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-4">
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <span>+1 (555) 234-5678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span>Los Angeles, CA</span>
              </div>
              <Link href="/test-drive">
                <Button
                  className="w-full rounded-none mt-4 uppercase tracking-widest"
                  onClick={() => setIsOpen(false)}
                >
                  Book Test Drive
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
