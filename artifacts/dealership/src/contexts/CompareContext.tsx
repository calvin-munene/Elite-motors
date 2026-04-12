import { createContext, useContext, useState, ReactNode } from "react";
import { Car } from "@workspace/api-client-react";

interface CompareContextType {
  compareList: Car[];
  addToCompare: (car: Car) => boolean;
  removeFromCompare: (carId: number) => void;
  clearCompare: () => void;
  isInCompare: (carId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Car[]>([]);

  const addToCompare = (car: Car): boolean => {
    if (compareList.length >= 3) return false;
    if (compareList.find(c => c.id === car.id)) return true;
    setCompareList(prev => [...prev, car]);
    return true;
  };

  const removeFromCompare = (carId: number) => {
    setCompareList(prev => prev.filter(c => c.id !== carId));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (carId: number) => compareList.some(c => c.id === carId);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
