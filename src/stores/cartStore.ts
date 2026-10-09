import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT } from '@constants/student';

export interface CartItem {
  id: string | number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string | number) => void;
  changeQty: (id: string | number, delta: number) => void;
  clearCart: () => void;
  totalQuantity: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find(i => String(i.id) === String(product.id));
          if (existing) {
            return {
              items: state.items.map(i =>
                String(i.id) === String(product.id)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => String(i.id) !== String(id)),
        }));
      },

      changeQty: (id, delta) => {
        set((state) => {
          const updated = state.items
            .map(i => {
              if (String(i.id) === String(id)) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : null;
              }
              return i;
            })
            .filter((i): i is CartItem => i !== null);
          return { items: updated };
        });
      },

      clearCart: () => set({ items: [] }),

      totalQuantity: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      totalAmount: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: `ktxgo-cart-${STUDENT.mssv}`,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
