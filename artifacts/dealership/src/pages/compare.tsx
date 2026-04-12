import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AIChatbot } from "@/components/AIChatbot";
import { useCompare } from "@/contexts/CompareContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check, Minus } from "lucide-react";
import { Car } from "@workspace/api-client-react";

const SPEC_ROWS = [
  { label: "Year", key: "year" },
  { label: "Make", key: "make" },
  { label: "Model", key: "model" },
  { label: "Body Type", key: "bodyType" },
  { label: "Price", key: "price", format: "price" },
  { label: "Condition", key: "condition" },
  { label: "Mileage", key: "mileage", format: "mileage" },
  { label: "Engine Size", key: "engineSize" },
  { label: "Transmission", key: "transmission" },
  { label: "Fuel Type", key: "fuelType" },
  { label: "Drivetrain", key: "drivetrain" },
  { label: "Seats", key: "seats" },
  { label: "Doors", key: "doors" },
  { label: "Color", key: "color" },
  { label: "Location", key: "location" },
  { label: "Availability", key: "availability" },
  { label: "Financing Available", key: "financingAvailable", format: "boolean" },
  { label: "Japanese Import", key: "isJapaneseImport", format: "boolean" },
  { label: "Auction Grade", key: "auctionGrade" },
  { label: "Shipping Status", key: "shippingStatus" },
];

function getVal(car: Car, key: string): any {
  return (car as any)[key];
}

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const formatValue = (value: any, format?: string, car?: Car, key?: string): React.ReactNode => {
    if (value === null || value === undefined || value === "") return <span className="text-gray-600">—</span>;
    if (format === "price") return <span className="font-bold text-primary">{formatPrice(Number(value))}</span>;
    if (format === "mileage") return `${new Intl.NumberFormat("en-KE").format(Number(value))} km`;
    if (format === "boolean") return value ? (
      <span className="text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Yes</span>
    ) : (
      <span className="text-gray-500 flex items-center gap-1"><Minus className="w-4 h-4" /> No</span>
    );
    return String(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-4xl font-bold text-white mb-2">{t.compare.title}</h1>
              <p className="text-gray-400">{t.compare.subtitle}</p>
            </div>
            {compareList.length > 0 && (
              <Button variant="outline" onClick={clearCompare} className="border-white/10 text-gray-400 hover:text-white">
                {t.compare.clear}
              </Button>
            )}
          </div>

          {compareList.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-3">No vehicles selected</h2>
              <p className="text-gray-400 mb-8">Add vehicles from the inventory to compare them side by side</p>
              <Link href="/inventory">
                <Button>Browse Inventory</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs uppercase tracking-wider text-gray-500 font-bold py-4 pr-6 w-40">Specification</th>
                    {compareList.map(car => (
                      <th key={car.id} className="text-left pb-4 pr-6 min-w-[220px]">
                        <div className="bg-card border border-white/8 rounded-xl overflow-hidden">
                          <div className="relative aspect-[16/10]">
                            <img
                              src={car.gallery?.[0] || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800"}
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeFromCompare(car.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-gray-400 mb-1">{car.year} • {car.make}</p>
                            <h3 className="font-serif text-base font-bold text-white line-clamp-1">{car.title}</h3>
                            <p className="text-primary font-bold text-lg mt-1">{formatPrice(car.price)}</p>
                            <Link href={`/cars/${car.slug}`}>
                              <Button size="sm" className="w-full mt-3 rounded-sm text-xs uppercase tracking-wider">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                    {compareList.length < 3 && (
                      <th className="pb-4 pr-6 min-w-[220px]">
                        <Link href="/inventory">
                          <div className="border-2 border-dashed border-white/10 rounded-xl aspect-[16/10] flex flex-col items-center justify-center text-gray-500 hover:border-primary/40 hover:text-gray-300 transition-colors cursor-pointer">
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="text-sm">{t.compare.addCar}</span>
                          </div>
                        </Link>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row, i) => (
                    <tr key={row.key} className={i % 2 === 0 ? "bg-white/2" : ""}>
                      <td className="text-xs text-gray-400 font-bold uppercase tracking-wider py-3.5 pr-6">{row.label}</td>
                      {compareList.map(car => {
                        const val = getVal(car, row.key);
                        const vals = compareList.map(c => getVal(c, row.key));
                        const allSame = vals.every(v => v === vals[0]);
                        return (
                          <td key={car.id} className={`py-3.5 pr-6 text-sm ${!allSame && compareList.length > 1 ? "text-white" : "text-gray-300"}`}>
                            {formatValue(val, row.format, car, row.key)}
                          </td>
                        );
                      })}
                      {compareList.length < 3 && <td className="py-3.5 pr-6"></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
      <AIChatbot />
    </div>
  );
}
