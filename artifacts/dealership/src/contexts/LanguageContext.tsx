import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "sw";

interface Translations {
  nav: {
    home: string; inventory: string; showroom: string; about: string;
    services: string; contact: string; testDrive: string; compare: string; wishlist: string;
  };
  hero: { search: string; findVehicle: string; };
  inventory: { title: string; subtitle: string; filters: string; clearAll: string;
    search: string; make: string; bodyType: string; condition: string; sortBy: string;
    vehiclesFound: string; viewDetails: string; addCompare: string; saveWishlist: string;
    japaneseImport: string; allMakes: string; allTypes: string; allConditions: string;
    newest: string; oldest: string; priceAsc: string; priceDesc: string; };
  car: { available: string; reserved: string; sold: string; inTransit: string;
    new: string; preOwned: string; featured: string; viewingNow: string;
    justListed: string; mileage: string; fuel: string; transmission: string;
    location: string; inquire: string; testDrive: string; addToCompare: string;
    saveToWishlist: string; japaneseImport: string; auctionGrade: string;
    chassisNo: string; shippingStatus: string; departureDate: string; arrivalDate: string; };
  compare: { title: string; subtitle: string; addCar: string; clear: string; compare: string; noCarSelected: string; };
  wishlist: { title: string; subtitle: string; empty: string; remove: string; };
  calculator: { title: string; subtitle: string; calculate: string; };
  contact: { title: string; subtitle: string; send: string; };
  footer: { rights: string; };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: { home: "Home", inventory: "Inventory", showroom: "Showroom", about: "About",
      services: "Services", contact: "Contact", testDrive: "Test Drive",
      compare: "Compare", wishlist: "Wishlist" },
    hero: { search: "Search Make, Model, or Keyword...", findVehicle: "Find Vehicle" },
    inventory: { title: "Inventory", subtitle: "Discover our collection of exceptional vehicles.",
      filters: "Filters", clearAll: "Clear All", search: "Keyword...", make: "Make",
      bodyType: "Body Type", condition: "Condition", sortBy: "Sort By",
      vehiclesFound: "vehicles found", viewDetails: "View Details",
      addCompare: "Compare", saveWishlist: "Save", japaneseImport: "Japanese Imports Only",
      allMakes: "All Makes", allTypes: "All Body Types", allConditions: "All Conditions",
      newest: "Newest Added", oldest: "Oldest First", priceAsc: "Price: Low to High", priceDesc: "Price: High to Low" },
    car: { available: "Available", reserved: "Reserved", sold: "Sold", inTransit: "In Transit",
      new: "New", preOwned: "Pre-Owned", featured: "Featured", viewingNow: "viewing now",
      justListed: "Just Listed", mileage: "Mileage", fuel: "Fuel", transmission: "Transmission",
      location: "Location", inquire: "Inquire", testDrive: "Test Drive",
      addToCompare: "Add to Compare", saveToWishlist: "Save to Wishlist",
      japaneseImport: "Japanese Import", auctionGrade: "Auction Grade",
      chassisNo: "Chassis No.", shippingStatus: "Shipping Status",
      departureDate: "Japan Departure", arrivalDate: "Kenya Arrival" },
    compare: { title: "Vehicle Comparison", subtitle: "Compare up to 3 vehicles side by side.",
      addCar: "Add a Vehicle", clear: "Clear All", compare: "Compare",
      noCarSelected: "No vehicle selected" },
    wishlist: { title: "My Wishlist", subtitle: "Your saved vehicles.", empty: "Your wishlist is empty.",
      remove: "Remove" },
    calculator: { title: "KRA Import Duty Calculator", subtitle: "Estimate your import costs for vehicles coming from Japan.", calculate: "Calculate Duty" },
    contact: { title: "Contact Us", subtitle: "Our team is ready to assist you.", send: "Send Message" },
    footer: { rights: "All rights reserved." },
  },
  sw: {
    nav: { home: "Nyumbani", inventory: "Magari", showroom: "Chumba cha Maonyesho",
      about: "Kuhusu Sisi", services: "Huduma", contact: "Wasiliana Nasi",
      testDrive: "Jaribu Gari", compare: "Linganisha", wishlist: "Orodha Yangu" },
    hero: { search: "Tafuta Chapa, Mfano, au Neno...", findVehicle: "Tafuta Gari" },
    inventory: { title: "Magari Yetu", subtitle: "Gundua mkusanyiko wetu wa magari ya kipekee.",
      filters: "Vichujio", clearAll: "Futa Vyote", search: "Neno la kutafuta...", make: "Chapa",
      bodyType: "Aina ya Mwili", condition: "Hali", sortBy: "Panga Kwa",
      vehiclesFound: "magari yamepatikana", viewDetails: "Angalia Maelezo",
      addCompare: "Linganisha", saveWishlist: "Hifadhi", japaneseImport: "Magari ya Japan Pekee",
      allMakes: "Chapa Zote", allTypes: "Aina Zote", allConditions: "Hali Zote",
      newest: "Mpya Zaidi", oldest: "Kongwe Zaidi", priceAsc: "Bei: Chini kwenda Juu", priceDesc: "Bei: Juu kwenda Chini" },
    car: { available: "Inapatikana", reserved: "Imehifadhiwa", sold: "Imeuzwa", inTransit: "Inasafiri",
      new: "Mpya", preOwned: "Iliyotumiwa", featured: "Iliyoangaziwa", viewingNow: "wanaangalia sasa",
      justListed: "Imewekwa Hivi Karibuni", mileage: "Umbali", fuel: "Mafuta", transmission: "Gearbox",
      location: "Mahali", inquire: "Uliza", testDrive: "Jaribu",
      addToCompare: "Ongeza Kulinganisha", saveToWishlist: "Hifadhi",
      japaneseImport: "Bidhaa ya Japan", auctionGrade: "Daraja la Mnada",
      chassisNo: "Nambari ya Chassis", shippingStatus: "Hali ya Usafirishaji",
      departureDate: "Ondoka Japan", arrivalDate: "Fika Kenya" },
    compare: { title: "Kulinganisha Magari", subtitle: "Linganisha magari hadi 3 kwa wakati mmoja.",
      addCar: "Ongeza Gari", clear: "Futa Yote", compare: "Linganisha",
      noCarSelected: "Hakuna gari lililochaguliwa" },
    wishlist: { title: "Orodha Yangu", subtitle: "Magari yako yaliyohifadhiwa.", empty: "Orodha yako iko wazi.",
      remove: "Ondoa" },
    calculator: { title: "Kikokotoo cha Ushuru wa KRA", subtitle: "Kadiria gharama za kuingiza gari kutoka Japan.", calculate: "Hesabu Ushuru" },
    contact: { title: "Wasiliana Nasi", subtitle: "Timu yetu iko tayari kukusaidia.", send: "Tuma Ujumbe" },
    footer: { rights: "Haki zote zimehifadhiwa." },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("ae_language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ae_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
