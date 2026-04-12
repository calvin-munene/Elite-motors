import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AIChatbot } from "@/components/AIChatbot";
import { CarCard } from "@/components/CarCard";
import { useListCars, useGetCarMakes, ListCarsParams } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Plane } from "lucide-react";
import { useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Inventory() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { t } = useLanguage();

  const [filters, setFilters] = useState<ListCarsParams & { japaneseImport?: boolean }>({
    limit: 12,
    offset: 0,
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: "newest" as any,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [japaneseImportOnly, setJapaneseImportOnly] = useState(false);

  const { data: inventoryData, isLoading } = useListCars(filters);
  const { data: makes } = useGetCarMakes();

  const handleFilterChange = (key: keyof ListCarsParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? undefined : value, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 12, offset: 0, sortBy: "newest" as any });
    setJapaneseImportOnly(false);
  };

  // Filter Japanese imports client-side
  const displayedCars = japaneseImportOnly
    ? (inventoryData?.cars || []).filter(c => (c as any).isJapaneseImport)
    : (inventoryData?.cars || []);

  const bodyTypes = ["SUV", "Sedan", "Coupe", "Convertible", "Hatchback", "Pickup", "Van", "Wagon", "Crossover"];
  const hasActiveFilters = filters.search || filters.make || filters.bodyType || filters.condition || japaneseImportOnly;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">{t.inventory.title}</h1>
            <p className="text-gray-400">{t.inventory.subtitle}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className={`lg:w-1/4 ${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="bg-card border border-white/5 rounded-xl p-6 sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold text-white">{t.inventory.filters}</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs uppercase tracking-wider text-gray-400 hover:text-white">
                      {t.inventory.clearAll}
                    </Button>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Search */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">{t.inventory.search.replace("...", "")}</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder={t.inventory.search}
                        className="pl-9 bg-background border-white/10 text-white"
                        value={filters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Make */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">{t.inventory.make}</label>
                    <Select value={filters.make || "all"} onValueChange={(v) => handleFilterChange("make", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder={t.inventory.allMakes} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.inventory.allMakes}</SelectItem>
                        {makes?.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">{t.inventory.bodyType}</label>
                    <Select value={filters.bodyType || "all"} onValueChange={(v) => handleFilterChange("bodyType", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder={t.inventory.allTypes} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.inventory.allTypes}</SelectItem>
                        {bodyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">{t.inventory.condition}</label>
                    <Select value={filters.condition || "all"} onValueChange={(v) => handleFilterChange("condition", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder={t.inventory.allConditions} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.inventory.allConditions}</SelectItem>
                        <SelectItem value="new">{t.car.new}</SelectItem>
                        <SelectItem value="used">{t.car.preOwned}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">{t.inventory.sortBy}</label>
                    <Select value={filters.sortBy || "newest"} onValueChange={(v) => handleFilterChange("sortBy", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{t.inventory.newest}</SelectItem>
                        <SelectItem value="price_asc">{t.inventory.priceAsc}</SelectItem>
                        <SelectItem value="price_desc">{t.inventory.priceDesc}</SelectItem>
                        <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Japanese Import Filter */}
                  <div className="pt-2 border-t border-white/8">
                    <button
                      onClick={() => setJapaneseImportOnly(!japaneseImportOnly)}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        japaneseImportOnly
                          ? "bg-blue-600/20 border border-blue-500/40 text-blue-300"
                          : "bg-white/5 border border-white/10 text-gray-300 hover:border-blue-500/30 hover:text-blue-200"
                      }`}
                    >
                      <Plane className="w-4 h-4 flex-shrink-0" />
                      {t.inventory.japaneseImport}
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-400 text-sm">
                  {japaneseImportOnly ? displayedCars.length : inventoryData?.total || 0} {t.inventory.vehiclesFound}
                  {japaneseImportOnly && <span className="ml-2 text-xs text-blue-400 bg-blue-900/20 border border-blue-500/20 rounded-full px-2.5 py-0.5">JDM only</span>}
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                  {t.inventory.filters}
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[400px] rounded-lg bg-card border border-white/5 animate-pulse" />
                  ))}
                </div>
              ) : displayedCars.length === 0 ? (
                <div className="bg-card border border-white/5 rounded-xl p-14 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters to find what you're looking for.</p>
                  <Button onClick={clearFilters}>{t.inventory.clearAll}</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
                  </div>
                  {inventoryData && !japaneseImportOnly && inventoryData.total > (filters.limit || 12) && (
                    <div className="mt-12 flex justify-center">
                      <Button
                        variant="outline"
                        className="border-white/20 text-white px-8"
                        onClick={() => setFilters(prev => ({ ...prev, limit: (prev.limit || 12) + 12 }))}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
      <AIChatbot />
    </div>
  );
}
