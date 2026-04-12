import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  image?: string;
}

export function CTABanner({
  title = "Ready to Experience Excellence?",
  subtitle = "Schedule a test drive today and discover the AutoElite difference.",
  buttonText = "Book Test Drive",
  buttonHref = "/test-drive",
  image = "https://images.unsplash.com/photo-1503376712341-ea19a33bb58e?w=1600"
}: CTABannerProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt="Luxury Car" 
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          {subtitle}
        </p>
        <Link href={buttonHref}>
          <Button size="lg" className="rounded-none uppercase tracking-widest font-bold px-8 h-14">
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
}
