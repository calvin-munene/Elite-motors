import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";
import { useState } from "react";

export function Footer() {
  const { data: settings } = useGetSettings();
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  const phone = settings?.phone || "+1 (555) 234-5678";
  const contactEmail = settings?.email || "sales@autoelitemotors.co.ke";
  const address = settings?.address || "4820 Automotive Boulevard";
  const city = settings?.city || "Los Angeles, CA 90001";
  const hours = settings?.openingHours || "Mon-Sat 9AM-7PM, Sun 11AM-5PM";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubState(data.message === "already_subscribed" ? "already" : "success");
        setEmail("");
      } else {
        setSubState("error");
      }
    } catch {
      setSubState("error");
    }
  };

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
                <span>{contactEmail}</span>
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
            {subState === "success" ? (
              <div className="flex items-center gap-3 bg-green-900/30 border border-green-500/30 rounded-lg px-4 py-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-400 font-bold text-sm">You're subscribed!</p>
                  <p className="text-green-400/70 text-xs mt-0.5">We'll keep you updated on new arrivals and offers.</p>
                </div>
              </div>
            ) : subState === "already" ? (
              <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-500/30 rounded-lg px-4 py-4">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-blue-400 text-sm">You're already subscribed — thank you!</p>
              </div>
            ) : (
              <form className="flex flex-col space-y-3" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setSubState("idle"); }}
                  placeholder="Your email address"
                  required
                  className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors rounded-sm"
                />
                {subState === "error" && (
                  <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={subState === "loading"}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-sm tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2 rounded-sm"
                >
                  {subState === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
                  ) : "Subscribe"}
                </button>
              </form>
            )}
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
