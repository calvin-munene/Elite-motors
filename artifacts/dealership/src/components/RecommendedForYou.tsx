import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCurrentSessionId } from "@/hooks/useVisitorTracking";

export function RecommendedForYou() {
  const [data, setData] = useState<any>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const sid = getCurrentSessionId();
    fetch(`/api/recommendations?sessionId=${sid}&limit=4`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data?.cars?.length) return null;

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">{data.personalized ? "Picked for you" : "Trending now"}</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">Recommended Vehicles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.cars.map((c: any) => (
            <Link key={c.id} href={`/cars/${c.slug}`} className="group block bg-card border border-white/5 rounded-lg overflow-hidden hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10">
              <div className="aspect-[4/3] bg-background overflow-hidden">
                {c.gallery?.[0] && <img src={c.gallery[0]} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{c.year} · {c.bodyType}</p>
                <h3 className="text-white font-bold mt-1 line-clamp-1">{c.title}</h3>
                <p className="text-primary font-bold text-lg mt-2">{formatPrice(c.discountedPrice || c.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
