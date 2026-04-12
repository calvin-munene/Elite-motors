import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useCompare } from "@/contexts/CompareContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetSettings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Plus, Check, Minus, Trophy, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Car } from "@workspace/api-client-react";

interface SpecRow {
  label: string;
  key: string;
  format?: string;
  bestFn?: (vals: number[]) => number;
}

interface SpecSection {
  title: string;
  rows: SpecRow[];
}

const SPEC_SECTIONS: SpecSection[] = [
  {
    title: "Price & Value",
    rows: [
      { label: "Asking Price", key: "price", format: "price", bestFn: (vals) => Math.min(...vals) },
      { label: "Condition", key: "condition" },
      { label: "Availability", key: "availability" },
      { label: "Financing Available", key: "financingAvailable", format: "boolean" },
    ],
  },
  {
    title: "Basic Information",
    rows: [
      { label: "Year", key: "year", bestFn: (vals) => Math.max(...vals) },
      { label: "Make", key: "make" },
      { label: "Model", key: "model" },
      { label: "Body Type", key: "bodyType" },
      { label: "Color", key: "color" },
      { label: "Location", key: "location" },
    ],
  },
  {
    title: "Performance & Mechanics",
    rows: [
      { label: "Engine Size", key: "engineSize" },
      { label: "Transmission", key: "transmission" },
      { label: "Fuel Type", key: "fuelType" },
      { label: "Drivetrain", key: "drivetrain" },
      { label: "Mileage", key: "mileage", format: "mileage", bestFn: (vals) => Math.min(...vals) },
    ],
  },
  {
    title: "Dimensions",
    rows: [
      { label: "Seats", key: "seats" },
      { label: "Doors", key: "doors" },
    ],
  },
  {
    title: "Japanese Import Details",
    rows: [
      { label: "Japanese Import", key: "isJapaneseImport", format: "boolean" },
      { label: "Auction Grade", key: "auctionGrade" },
      { label: "Shipping Status", key: "shippingStatus" },
    ],
  },
];

function getVal(car: Car, key: string): any {
  return (car as any)[key];
}

const SHIPPING_LABELS: Record<string, string> = {
  at_auction: "At Auction", purchased: "Purchased", in_transit: "In Transit",
  arrived: "Arrived Mombasa", clearing: "Clearing Port", ready: "Ready",
};

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsapp || "254700234567";

  const formatValue = (value: any, format?: string): React.ReactNode => {
    if (value === null || value === undefined || value === "") return <span className="text-gray-600">—</span>;
    if (format === "price") return <span className="font-bold text-primary text-base">{formatPrice(Number(value))}</span>;
    if (format === "mileage") return `${new Intl.NumberFormat("en-KE").format(Number(value))} km`;
    if (format === "boolean") return value
      ? <span className="text-green-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Yes</span>
      : <span className="text-gray-600 flex items-center gap-1"><Minus className="w-3.5 h-3.5" /> No</span>;
    if (typeof value === "string" && SHIPPING_LABELS[value]) return SHIPPING_LABELS[value];
    return String(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-primary uppercase tracking-widest font-bold mb-2">Side-by-Side</p>
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
              <Link href="/inventory"><Button>Browse Inventory</Button></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">

                {/* Car header cards */}
                <thead>
                  <tr>
                    <th className="text-left pb-6 pr-4 w-40 align-bottom">
                      <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Specifications</span>
                    </th>
                    {compareList.map(car => (
                      <th key={car.id} className="pb-6 pr-4 min-w-[240px] align-top">
                        <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
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
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">{car.year} • {car.make}</p>
                              <h3 className="font-serif text-base font-bold text-white line-clamp-1">{car.title}</h3>
                              <p className="text-primary font-bold text-xl mt-1">{formatPrice(car.price)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/cars/${car.slug}`} className="flex-1">
                                <Button size="sm" className="w-full rounded-sm text-[10px] uppercase tracking-wider h-8">
                                  View Details
                                </Button>
                              </Link>
                              <a
                                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hi, I want to enquire about the ${car.year} ${car.title} (${formatPrice(car.price)}) I'm comparing on AutoElite Motors.`}
                                target="_blank" rel="noopener noreferrer"
                                title="Chat with sales rep about this car"
                              >
                                <Button size="sm" variant="outline" className="rounded-sm h-8 w-8 p-0 bg-green-600/10 border-green-600/30 text-green-400 hover:bg-green-600 hover:text-white">
                                  <FaWhatsapp className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                              <a
                                href={`https://wa.me/?text=Compare: ${car.year} ${car.title} at ${formatPrice(car.price)} — ${window.location.origin}/cars/${car.slug}`}
                                target="_blank" rel="noopener noreferrer"
                                title="Share this car on WhatsApp"
                              >
                                <Button size="sm" variant="outline" className="rounded-sm h-8 w-8 p-0 bg-white/5 border-white/10 text-gray-400 hover:bg-white/10">
                                  <Share2 className="w-3 h-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                    {compareList.length < 3 && (
                      <th className="pb-6 pr-4 min-w-[240px] align-top">
                        <Link href="/inventory">
                          <div className="border-2 border-dashed border-white/10 rounded-2xl aspect-[16/10] flex flex-col items-center justify-center text-gray-600 hover:border-primary/40 hover:text-gray-400 transition-colors cursor-pointer">
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="text-sm">{t.compare.addCar}</span>
                          </div>
                        </Link>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {SPEC_SECTIONS.map((section, sIdx) => (
                    <>
                      {/* Section header row */}
                      <tr key={`section-${sIdx}`}>
                        <td colSpan={compareList.length + (compareList.length < 3 ? 2 : 1)} className="pt-6 pb-2 pr-4">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">
                            {section.title}
                          </div>
                        </td>
                      </tr>

                      {/* Spec rows */}
                      {section.rows.map((row, rIdx) => {
                        const rawVals = compareList.map(c => getVal(c, row.key));
                        const allSame = rawVals.every(v => String(v) === String(rawVals[0]));
                        const bestVal = (row as any).bestFn && rawVals.every(v => v !== null && v !== undefined && v !== "")
                          ? (row as any).bestFn(rawVals.map(Number))
                          : null;

                        return (
                          <tr key={row.key} className={rIdx % 2 === 0 ? "bg-white/[0.02]" : ""}>
                            <td className="text-xs text-gray-500 font-semibold uppercase tracking-wider py-3.5 pr-4">
                              {row.label}
                            </td>
                            {compareList.map((car, cIdx) => {
                              const val = getVal(car, row.key);
                              const isBest = bestVal !== null && Number(val) === bestVal;
                              const isDiff = !allSame && compareList.length > 1;

                              return (
                                <td
                                  key={car.id}
                                  className={`py-3.5 pr-4 text-sm transition-all ${
                                    isBest ? "text-white" :
                                    isDiff ? "text-gray-200" :
                                    "text-gray-400"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {formatValue(val, row.format)}
                                    {isBest && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-1.5 py-0.5">
                                        <Trophy className="w-2.5 h-2.5" /> Best
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            {compareList.length < 3 && <td className="py-3.5 pr-4" />}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
