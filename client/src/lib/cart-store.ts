import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@shared/schema';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  getPrice: () => number;
  removeItem: (id: string) => void;
  updateItemWarranty: (id: string, warranty: CartItem['warranty']) => void;
  updateItemInsurance: (id: string, insurance: CartItem['insurance']) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getWarrantyTotal: () => number;
  getInsuranceTotal: () => number;
  getVAT: () => number;
  getTotal: () => number;
  getInsuranceItems: () => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem: CartItem = { ...item, id };
        
        set((state) => ({
          items: [...state.items, newItem]
        }));
      },

      getPrice: () => {
        return get().items.filter(item => item.price)
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateItemWarranty: (id, warranty) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, warranty } : item
          )
        }));
      },
      
      updateItemInsurance: (id, insurance) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, insurance } : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },
      
      getWarrantyTotal: () => {
        return get().items.reduce((total, item) => 
          total + (item.warranty?.price || 0), 0
        );
      },
      
      getInsuranceTotal: () => {
        return get().items.reduce((total, item) => 
          total + (item.insurance?.price || 0), 0
        );
      },
      
      getVAT: () => {
        const subtotal = get().getSubtotal();
        const warrantyTotal = get().getWarrantyTotal();
        return Math.round((subtotal + warrantyTotal) * 0.15);
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const warrantyTotal = get().getWarrantyTotal();
        return Math.round((subtotal + warrantyTotal) * 1.15);
      },
      
      getInsuranceItems: () => {
        return get().items.filter(item => item.insurance);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
