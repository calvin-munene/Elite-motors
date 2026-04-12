import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car } from "@workspace/api-client-react";

interface WishlistContextType {
  wishlist: Car[];
  addToWishlist: (car: Car) => void;
  removeFromWishlist: (carId: number) => void;
  isInWishlist: (carId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "ae_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Car[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (car: Car) => {
    if (!wishlist.find(c => c.id === car.id)) {
      setWishlist(prev => [...prev, car]);
    }
  };

  const removeFromWishlist = (carId: number) => {
    setWishlist(prev => prev.filter(c => c.id !== carId));
  };

  const isInWishlist = (carId: number) => wishlist.some(c => c.id === carId);

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
