import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  image: string;
  showSearch?: boolean;
}

export function HeroBanner({ title, subtitle, image, showSearch = false }: HeroBannerProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/inventory?search=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation("/inventory");
    }
  };

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt="Hero background" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
          
          {showSearch && (
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search Make, Model, or Keyword..."
                  className="pl-12 h-14 bg-background/80 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-primary text-base rounded-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-14 px-8 rounded-sm uppercase tracking-widest font-bold text-sm shrink-0">
                Find Vehicle
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
