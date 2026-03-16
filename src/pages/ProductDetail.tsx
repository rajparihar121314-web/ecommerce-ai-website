import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, ArrowLeft, Package, Check } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setAdding(true);
    const success = await addToCart(product.id, qty);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;
    supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 animate-fade-in">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>

        <div className="space-y-6">
          {product.categories?.name && (
            <span className="text-xs text-primary font-medium uppercase tracking-wider">{product.categories.name}</span>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border border-border rounded-md">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                −
              </button>
              <span className="px-4 py-2 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-gradient-gold text-primary-foreground hover:opacity-90"
              }`}
            >
              {added ? (
                <><Check className="w-4 h-4" /> Added!</>
              ) : adding ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Adding...</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>

          {user && added && (
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-2.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/10 transition-colors text-sm"
            >
              View Cart →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
