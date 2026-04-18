import { useState, useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function VisualSearch() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setError("Image too large (max 8MB)"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setError(null);
      setResult(null);
      setLoading(true);
      try {
        const r = await fetch("/api/visual-search", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        if (!r.ok) throw new Error("Search failed");
        setResult(await r.json());
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-card to-background py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">AI Visual Search</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">Snap & Find</h1>
            <p className="text-gray-400 text-lg mb-10">Upload any car photo. Our AI identifies the make and model, then shows you matching vehicles from our showroom.</p>

            {!imageUrl && (
              <div onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl p-12 transition-colors cursor-pointer bg-card/50"
                onClick={() => fileInput.current?.click()}>
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-white font-bold mb-1">Drop a car photo here</p>
                <p className="text-sm text-gray-500">or click to browse · JPG, PNG up to 8MB</p>
              </div>
            )}
            <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {imageUrl && (
              <div className="text-left">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="md:w-1/2">
                    <img src={imageUrl} alt="Uploaded" className="rounded-lg border border-white/10 w-full" />
                    <Button onClick={() => { setImageUrl(null); setResult(null); }} variant="outline" className="mt-3 w-full">Try Another Photo</Button>
                  </div>
                  <div className="md:w-1/2">
                    {loading && (
                      <div className="text-center py-12">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">AI is analyzing the vehicle...</p>
                      </div>
                    )}
                    {error && <p className="text-red-400 bg-red-500/10 p-4 rounded">{error}</p>}
                    {result?.identification && (
                      <div className="bg-card border border-white/10 rounded-lg p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Identified</p>
                        <h3 className="text-2xl font-serif text-white mb-2">{result.identification.year_estimate || ""} {result.identification.make} {result.identification.model}</h3>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {result.identification.body_type && <span className="px-2 py-1 bg-primary/10 text-red-300 rounded">{result.identification.body_type.toUpperCase()}</span>}
                          {result.identification.color && <span className="px-2 py-1 bg-white/5 text-gray-300 rounded">{result.identification.color}</span>}
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">{Math.round((result.identification.confidence || 0) * 100)}% match</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-3">{result.identification.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {result?.cars?.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-serif text-3xl text-white mb-2">Matches in our showroom</h2>
              <p className="text-gray-400 mb-8">{result.cars.length} similar vehicles available</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.cars.map((c: any) => (
                  <Link key={c.id} href={`/cars/${c.slug}`} className="block bg-card border border-white/5 rounded-lg overflow-hidden hover:border-primary/50 transition-colors group">
                    <div className="aspect-video bg-background overflow-hidden">
                      {c.gallery?.[0] && <img src={c.gallery[0]} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold">{c.year} {c.title}</h3>
                      <p className="text-primary font-bold text-lg mt-1">{formatPrice(c.price)}</p>
                      <p className="text-xs text-gray-500 mt-1">{c.bodyType} · {c.transmission} · {c.color}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {result && result.cars?.length === 0 && (
          <section className="py-16 text-center">
            <p className="text-gray-400">No exact matches in stock right now.</p>
            <Link href="/contact" className="text-primary hover:underline mt-2 inline-block">Request this vehicle from our import desk →</Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
