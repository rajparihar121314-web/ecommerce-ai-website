import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products(id, name, price, image_url)")
      .eq("user_id", user.id);
    if (!error && data) {
      setItems(data.map((d: any) => ({ ...d, product: d.products })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, qty = 1) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to add items to cart.", variant: "destructive" });
      return false;
    }
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    let error;
    if (existing) {
      const res = await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
      error = res.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    } else {
      toast({ title: "✅ Added to cart", description: "Item has been added to your cart." });
      await fetchCart();
      return true;
    }
  }, [user, fetchCart, toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId);
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }, [user]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
