import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  wishlistIds: string[];
  setWishlistIds: (ids: string[]) => void;
  addWishlistId: (id: string) => void;
  removeWishlistId: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      setWishlistIds: (ids) => {
        const unique = Array.from(new Set(ids));
        set({ wishlistIds: unique });
      },
      addWishlistId: (id) => {
        const current = get().wishlistIds;
        if (current.includes(id)) return;
        set({ wishlistIds: [...current, id] });
      },
      removeWishlistId: (id) => {
        set({ wishlistIds: get().wishlistIds.filter((x) => x !== id) });
      },
      clearWishlist: () => set({ wishlistIds: [] }),
      isInWishlist: (id) => get().wishlistIds.includes(id),
    }),
    {
      name: 'ksr-wishlist-storage',
    }
  )
);
