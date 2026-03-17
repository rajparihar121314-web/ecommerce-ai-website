import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category?: string;
}

export default function ProductCard({ id, name, price, image_url, category }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    setAdding(true);
    await addToCart(id, 1);
    setAdding(false);
  };

  return (
    <Link
      to={`/products/${id}`}
      className="group block rounded-lg overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:glow-gold"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        {category && (
          <span className="text-xs text-primary font-medium uppercase tracking-wider">{category}</span>
        )}
        <h3 className="font-display text-sm font-semibold mt-1 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-base font-semibold text-primary">₹{price.toLocaleString("en-IN")}</p>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            aria-label="Add to cart"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
