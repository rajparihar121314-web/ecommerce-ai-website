import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Package, ArrowRight, XCircle, MapPin, CreditCard, Banknote, Clock, CheckCircle2, Truck as TruckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-blue-500/10 text-blue-600", icon: CheckCircle2, label: "Confirmed" },
  shipped: { color: "bg-purple-500/10 text-purple-600", icon: TruckIcon, label: "Shipped" },
  delivered: { color: "bg-green-500/10 text-green-600", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "bg-destructive/10 text-destructive", icon: XCircle, label: "Cancelled" },
};

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(id, product_name, quantity, price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const cancelOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    toast({ title: "Order cancelled" });
    fetchOrders();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-4">Your Orders</h1>
        <p className="text-muted-foreground mb-6">Sign in to view your orders</p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 bg-card border border-border rounded-lg animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">No orders yet</p>
          <Link to="/shop" className="text-primary hover:underline font-medium">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrder === order.id;
            const currentStep = statusSteps.indexOf(order.status);
            const isCancelled = order.status === "cancelled";

            return (
              <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
                {/* Header */}
                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-6 text-left hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <p className="text-lg font-bold text-primary mt-1">₹{Number(order.total).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-6 space-y-6 animate-fade-in">
                    {/* Status Timeline */}
                    {!isCancelled && (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Order Status</h3>
                        <div className="flex items-center gap-1">
                          {statusSteps.map((step, i) => {
                            const isActive = i <= currentStep;
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}>
                                  {i + 1}
                                </div>
                                {i < statusSteps.length - 1 && (
                                  <div className={`flex-1 h-1 mx-1 rounded ${isActive && i < currentStep ? "bg-primary" : "bg-muted"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1">
                          {statusSteps.map((step) => (
                            <span key={step} className="text-[10px] text-muted-foreground capitalize">{step}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm bg-muted/30 rounded-md p-3">
                            <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                            <span className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.shipping_address && (
                        <div className="bg-muted/30 rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Delivery Address</h3>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
                        </div>
                      )}
                      <div className="bg-muted/30 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {order.payment_method === "online" ? (
                            <CreditCard className="w-4 h-4 text-primary" />
                          ) : (
                            <Banknote className="w-4 h-4 text-primary" />
                          )}
                          <h3 className="text-sm font-semibold text-foreground">Payment</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.payment_method === "online" ? "Online Payment" : "Cash on Delivery"}
                        </p>
                      </div>
                    </div>

                    {/* Cancel */}
                    {order.status === "pending" && (
                      <button onClick={() => cancelOrder(order.id)}
                        className="flex items-center gap-1 text-sm text-destructive hover:underline">
                        <XCircle className="w-4 h-4" /> Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
