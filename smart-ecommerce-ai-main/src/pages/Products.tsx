import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .order("name");

      if (error) {
        console.error("SUPABASE ERROR:", error);
      }

      setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-8">Shop</h1>

      {/* Search */}
      <div className="relative flex-1 mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground rounded-md border border-border focus:outline-none text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image_url={p.image_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
