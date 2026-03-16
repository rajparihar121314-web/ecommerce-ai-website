import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, CreditCard, Banknote, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-6">Sign in to checkout</p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/shop" className="text-primary hover:underline font-medium">Continue Shopping</Link>
      </div>
    );
  }

  const shippingFee = total >= 999 ? 0 : 49;
  const grandTotal = total + shippingFee;

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast({ title: "Missing details", description: "Please fill in all address fields", variant: "destructive" });
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast({ title: "Invalid pincode", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid phone", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    const fullAddress = `${fullName}\n${phone}\n${address}\n${city}, ${state} - ${pincode}`;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: grandTotal,
        shipping_address: fullAddress,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (error || !order) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
      product_name: item.product.name,
    }));

    await supabase.from("order_items").insert(orderItems);

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Order Confirmed! 🎉",
      message: `Order #${order.id.slice(0, 8)} placed. Total: ₹${grandTotal.toLocaleString("en-IN")}. Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`,
    });

    await clearCart();
    toast({ title: "Order placed successfully! 🎉", description: "You can track your order in the Orders page." });
    navigate("/orders");
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Delivery Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="10-digit number" maxLength={10} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Address *</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm min-h-[80px]"
                  placeholder="House no, Street, Landmark" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">City *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="City" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">State *</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="State" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pincode *</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
                  className="mt-1 w-full bg-secondary text-foreground px-4 py-2.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="6-digit pincode" maxLength={6} />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Payment Method</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Banknote className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
                {paymentMethod === "cod" && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>
              <button
                onClick={() => setPaymentMethod("online")}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                }`}
              >
                <CreditCard className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">Online Payment</p>
                  <p className="text-sm text-muted-foreground">UPI, Card, Net Banking</p>
                </div>
                {paymentMethod === "online" && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                <span className={shippingFee === 0 ? "text-green-500 font-medium" : "text-foreground"}>
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee === 0 && (
                <p className="text-xs text-green-500">Free shipping on orders ₹999+</p>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
            >
              {loading ? "Placing Order..." : paymentMethod === "cod" ? `Place Order — ₹${grandTotal.toLocaleString("en-IN")}` : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              By placing this order, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
