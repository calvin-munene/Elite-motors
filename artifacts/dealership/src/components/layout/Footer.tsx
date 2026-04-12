import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

export function Footer() {
  const { data: settings } = useGetSettings();

  const phone = settings?.phone || "+1 (555) 234-5678";
  const email = settings?.email || "sales@autoelitemotors.com";
  const address = settings?.address || "4820 Automotive Boulevard";
  const city = settings?.city || "Los Angeles, CA 90001";
  const hours = settings?.openingHours || "Mon-Sat 9AM-7PM, Sun 11AM-5PM";

  return (
    <footer className="bg-[#0a0a0a] pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-white block">
                AUTOELITE
              </span>
              <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">
                MOTORS
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings?.tagline || "Experience the pinnacle of automotive excellence. We curate the world's most exceptional vehicles for the most discerning drivers."}
            </p>
            <div className="flex space-x-4">
              <a href={settings?.facebookUrl || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={settings?.instagramUrl || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={settings?.twitterUrl || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={settings?.youtubeUrl || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/inventory">
                  <span className="hover:text-primary transition-colors cursor-pointer">Inventory</span>
                </Link>
              </li>
              <li>
                <Link href="/showroom">
                  <span className="hover:text-primary transition-colors cursor-pointer">Our Showroom</span>
                </Link>
              </li>
              <li>
                <Link href="/financing">
                  <span className="hover:text-primary transition-colors cursor-pointer">Financing</span>
                </Link>
              </li>
              <li>
                <Link href="/trade-in">
                  <span className="hover:text-primary transition-colors cursor-pointer">Trade-In</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                <span>{address}<br />{city}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-primary mr-3 shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-3 shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to receive updates on new arrivals, special offers, and events.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-bold text-sm tracking-widest uppercase py-3 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} AutoElite Motors. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
