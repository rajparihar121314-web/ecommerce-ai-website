import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, ShoppingCart, Package, CreditCard, Banknote, CheckCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  type?: "text" | "products" | "order-confirm" | "payment-select" | "address-form" | "order-success";
  orderId?: string;
}

interface AddressData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! 👋 I'm your LUXE Shopping Assistant. I can help you find products, add them to cart, and place orders — all right here! Try asking:\n\n• \"Show me electronics under ₹5000\"\n• \"I want headphones\"\n• \"Show trending products\"", type: "text" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingCartItems, setPendingCartItems] = useState<{ product_id: string; product_name: string; price: number; quantity: number }[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "online" | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { addToCart, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showAddressForm]);

  const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

  const send = async (overrideInput?: string) => {
    const text = overrideInput || input.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text, type: "text" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...chatHistory, { role: "user", content: text }] }),
      });

      if (!resp.ok) throw new Error("Request failed");
      const data = await resp.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: data.error, type: "text" }]);
      } else if (data.products?.length > 0) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          products: data.products,
          type: "products",
        }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again.", type: "text" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setMessages(prev => [...prev, { role: "assistant", content: "Please sign in first to add items to your cart. Go to the Sign In page and come back!", type: "text" }]);
      return;
    }
    setLoading(true);
    const success = await addToCart(product.id);
    if (success) {
      setPendingCartItems(prev => [...prev, { product_id: product.id, product_name: product.name, price: product.price, quantity: 1 }]);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ **${product.name}** added to cart! (₹${product.price.toLocaleString("en-IN")})\n\nWould you like to place the order now?`,
        type: "order-confirm",
      }]);
    }
    setLoading(false);
  };

  const handleOrderConfirm = (wantsOrder: boolean) => {
    if (!wantsOrder) {
      setMessages(prev => [...prev,
        { role: "user", content: "No, I'll continue shopping", type: "text" },
        { role: "assistant", content: "No problem! Keep browsing. Ask me anytime when you're ready to order. 😊", type: "text" },
      ]);
      return;
    }
    setMessages(prev => [...prev,
      { role: "user", content: "Yes, place my order!", type: "text" },
      { role: "assistant", content: "Choose your payment method:", type: "payment-select" },
    ]);
  };

  const handlePaymentSelect = (method: "cod" | "online") => {
    setSelectedPayment(method);
    const label = method === "cod" ? "Cash on Delivery" : "Online Payment";
    setMessages(prev => [...prev,
      { role: "user", content: label, type: "text" },
      { role: "assistant", content: `Great! You selected **${label}**. Please enter your delivery address:`, type: "address-form" },
    ]);
    setShowAddressForm(true);
  };

  const handlePlaceOrder = async () => {
    const { fullName, phone, address, city, state, pincode } = addressData;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Please fill all address fields.", type: "text" }]);
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Please enter a valid 10-digit phone number.", type: "text" }]);
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Please enter a valid 6-digit pincode.", type: "text" }]);
      return;
    }

    setLoading(true);
    setShowAddressForm(false);
    const shippingAddress = `${fullName}\n${phone}\n${address}\n${city}, ${state} - ${pincode}`;
    const total = pendingCartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = total >= 999 ? 0 : 49;
    const grandTotal = total + shippingFee;

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "place_order",
          payload: {
            userId: user!.id,
            items: pendingCartItems,
            paymentMethod: selectedPayment,
            shippingAddress,
            total: grandTotal,
          },
        }),
      });
      const data = await resp.json();
      if (data.success) {
        await fetchCart();
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `🎉 **Order Placed Successfully!**\n\n📦 Order ID: **#${data.orderId.slice(0, 8)}**\n💰 Total: **₹${grandTotal.toLocaleString("en-IN")}**\n💳 Payment: **${selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment"}**\n📍 Delivery to: ${city}, ${state}\n\nYou can track your order on the Orders page. Happy shopping! 🛍️`,
          type: "order-success",
          orderId: data.orderId,
        }]);
        setPendingCartItems([]);
        setSelectedPayment(null);
        setAddressData({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });
      } else {
        throw new Error(data.error || "Order failed");
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Order failed: ${e.message}. Please try again.`, type: "text" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg glow-gold hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[600px] flex flex-col rounded-xl border border-border bg-card shadow-2xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-gold">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <div>
            <span className="font-display font-semibold text-primary-foreground text-sm">LUXE Smart Assistant</span>
            <p className="text-[10px] text-primary-foreground/70">Search • Select • Order</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)}>
          <X className="w-5 h-5 text-primary-foreground/80 hover:text-primary-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px] max-h-[440px]">
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {renderMarkdown(m.content)}
              </div>
            </div>

            {/* Product Cards */}
            {m.type === "products" && m.products && (
              <div className="ml-9 mt-2 space-y-2">
                {m.products.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-muted rounded-lg p-2 border border-border">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs font-bold text-primary">₹{p.price.toLocaleString("en-IN")}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={loading}
                      className="flex-shrink-0 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order Confirm Buttons */}
            {m.type === "order-confirm" && i === messages.length - 1 && (
              <div className="ml-9 mt-2 flex gap-2">
                <button onClick={() => handleOrderConfirm(true)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Yes, Order Now
                </button>
                <button onClick={() => handleOrderConfirm(false)} className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold hover:opacity-90 border border-border">
                  Continue Shopping
                </button>
              </div>
            )}

            {/* Payment Selection */}
            {m.type === "payment-select" && i === messages.length - 1 && (
              <div className="ml-9 mt-2 space-y-2">
                <button onClick={() => handlePaymentSelect("cod")} className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted hover:border-primary transition-colors">
                  <Banknote className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Cash on Delivery</p>
                    <p className="text-[10px] text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </button>
                <button onClick={() => handlePaymentSelect("online")} className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted hover:border-primary transition-colors">
                  <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Online Payment</p>
                    <p className="text-[10px] text-muted-foreground">UPI, Card, Net Banking</p>
                  </div>
                </button>
              </div>
            )}

            {/* Order Success */}
            {m.type === "order-success" && (
              <div className="ml-9 mt-2">
                <button
                  onClick={() => navigate("/orders")}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1"
                >
                  <Package className="w-3 h-3" /> View Orders
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline Address Form */}
        {showAddressForm && (
          <div className="ml-9 bg-muted rounded-lg p-3 border border-border space-y-2">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Delivery Address</span>
            </div>
            {(["fullName", "phone", "address", "city", "state", "pincode"] as const).map(field => (
              <input
                key={field}
                type="text"
                placeholder={field === "fullName" ? "Full Name" : field === "phone" ? "Phone (10 digits)" : field === "pincode" ? "Pincode (6 digits)" : field.charAt(0).toUpperCase() + field.slice(1)}
                value={addressData[field]}
                onChange={e => setAddressData(prev => ({ ...prev, [field]: e.target.value }))}
                maxLength={field === "phone" ? 10 : field === "pincode" ? 6 : undefined}
                className="w-full bg-secondary text-foreground text-xs px-2.5 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ))}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-2 rounded-md bg-gradient-gold text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 mt-1"
            >
              {loading ? "Placing Order..." : "🛍️ Place Order"}
            </button>
          </div>
        )}

        {loading && !showAddressForm && (
          <div className="flex gap-2 items-center text-muted-foreground text-xs ml-9">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search products, ask anything..."
            className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  // Simple bold markdown rendering
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
