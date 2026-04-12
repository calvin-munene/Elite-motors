import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car } from "@workspace/api-client-react";

interface RecentlyViewedContextType {
  recentCars: Car[];
  addRecentCar: (car: Car) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
  recentCars: [],
  addRecentCar: () => {},
});

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentCars, setRecentCars] = useState<Car[]>(() => {
    try {
      const stored = localStorage.getItem("ae_recentlyViewed");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ae_recentlyViewed", JSON.stringify(recentCars.slice(0, 5)));
    } catch {}
  }, [recentCars]);

  const addRecentCar = (car: Car) => {
    setRecentCars(prev => {
      const filtered = prev.filter(c => c.id !== car.id);
      return [car, ...filtered].slice(0, 5);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentCars, addRecentCar }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
