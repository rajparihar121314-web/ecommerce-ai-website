import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-muted-foreground mb-6">Sign in to view your cart</p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-4xl font-bold mb-8">Shopping Cart</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
           <Link to="/shop" className="text-primary hover:underline font-medium">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center bg-card border border-border rounded-lg p-4 animate-fade-in">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold truncate">{item.product.name}</h3>
                <p className="text-primary font-semibold">₹{item.product.price.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-md">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground text-sm">−</button>
                  <span className="px-3 py-1 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground text-sm">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-display font-semibold">Total</span>
              <span className="font-bold text-primary text-2xl">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-lg"
            >
              Checkout — ₹{total.toLocaleString("en-IN")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
