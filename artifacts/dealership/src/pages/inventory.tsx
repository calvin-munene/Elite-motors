import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CarCard } from "@/components/CarCard";
import { useListCars, useGetCarMakes, ListCarsParams } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useLocation, useSearch } from "wouter";

export default function Inventory() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [filters, setFilters] = useState<ListCarsParams>({
    limit: 12,
    offset: 0,
    category: initialCategory,
    search: initialSearch,
    sortBy: "newest" as any
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: inventoryData, isLoading } = useListCars(filters);
  const { data: makes } = useGetCarMakes();

  const handleFilterChange = (key: keyof ListCarsParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      offset: 0 // Reset pagination on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 12, offset: 0, sortBy: "newest" as any });
  };

  const bodyTypes = ["SUV", "Sedan", "Coupe", "Convertible", "Hatchback", "Pickup", "Van", "Wagon"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Inventory</h1>
            <p className="text-gray-400">Discover our collection of exceptional vehicles.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-card border border-white/5 rounded-lg p-6 sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold text-white">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs uppercase tracking-wider text-gray-400 hover:text-white">
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input 
                        placeholder="Keyword..." 
                        className="pl-9 bg-background border-white/10 text-white"
                        value={filters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Make */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Make</label>
                    <Select value={filters.make || "all"} onValueChange={(v) => handleFilterChange("make", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder="All Makes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Makes</SelectItem>
                        {makes?.map(make => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Body Type</label>
                    <Select value={filters.bodyType || "all"} onValueChange={(v) => handleFilterChange("bodyType", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder="All Body Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Body Types</SelectItem>
                        {bodyTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Condition</label>
                    <Select value={filters.condition || "all"} onValueChange={(v) => handleFilterChange("condition", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder="All Conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Pre-Owned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 block">Sort By</label>
                    <Select value={filters.sortBy || "newest"} onValueChange={(v) => handleFilterChange("sortBy", v)}>
                      <SelectTrigger className="bg-background border-white/10 text-white">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest Added</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <p className="text-gray-400">{inventoryData?.total || 0} vehicles found</p>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                  Filters
                </Button>
              </div>

              <div className="hidden lg:block mb-6 text-gray-400">
                {inventoryData?.total || 0} vehicles found
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[400px] rounded-lg bg-card border border-white/5 animate-pulse" />
                  ))}
                </div>
              ) : inventoryData?.cars.length === 0 ? (
                <div className="bg-card border border-white/5 rounded-lg p-12 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters to find what you're looking for.</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {inventoryData?.cars.map(car => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                  
                  {/* Pagination placeholder */}
                  {inventoryData && inventoryData.total > (filters.limit || 12) && (
                    <div className="mt-12 flex justify-center">
                      <Button variant="outline" className="border-white/20 text-white">
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
    </div>
  );
}
