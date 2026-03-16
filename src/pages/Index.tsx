import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Headphones, Star, Quote, TrendingUp, Zap, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "100% safe checkout" },
  { icon: Headphones, title: "24/7 Support", desc: "AI-powered help" },
  { icon: Gift, title: "Easy Returns", desc: "7-day return policy" },
];

const testimonials = [
  { name: "Priya Sharma", city: "Mumbai", text: "Amazing quality products! The delivery was super fast and packaging was premium. Will shop again!", rating: 5, avatar: "PS" },
  { name: "Rahul Verma", city: "Delhi", text: "Best online shopping experience. The AI chat support helped me find exactly what I needed.", rating: 5, avatar: "RV" },
  { name: "Anita Patel", city: "Ahmedabad", text: "Love the curated collection. Every product feels luxurious and worth the price. Highly recommended!", rating: 5, avatar: "AP" },
  { name: "Vikram Singh", city: "Jaipur", text: "Cash on delivery option is great. Product quality exceeded my expectations. 5 stars!", rating: 5, avatar: "VS" },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "10K+", label: "Products" },
  { value: "500+", label: "Brands" },
  { value: "4.8★", label: "Average Rating" },
];

export default function Index() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes, trendingRes] = await Promise.all([
        supabase.from("products").select("id, name, price, image_url, categories(name)").eq("featured", true).limit(8),
        supabase.from("categories").select("*"),
        supabase.from("products").select("id, name, price, image_url, categories(name)").order("created_at", { ascending: false }).limit(4),
      ]);

      if (productsRes.data) setFeatured(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (trendingRes.data) setTrending(trendingRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const categoryIcons: Record<string, string> = {
    "Electronics": "📱",
    "Clothing": "👕",
    "Books": "📚",
    "Home & Garden": "🏡",
    "Sports": "⚽",
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="Luxury products" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              <Zap className="w-3 h-3" /> Trending Now — New Arrivals 2026
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.15]">
              Your One-Stop <br />
              <span className="text-gradient-gold">Premium</span> Shop
            </h1>
            <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
              From electronics to fashion, home decor to fitness — shop thousands of premium products with free delivery, easy returns & cash on delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-lg"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/shop?category=electronics"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-primary/30 text-foreground font-semibold hover:bg-primary/5 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-primary" /> Trending Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-gradient-gold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/30">
        <div className="container mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-card transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Browse</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Shop by Category</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">Find everything you need across our curated categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl mb-3 block">{categoryIcons[cat.name] || "📦"}</span>
                <h3 className="font-display text-base font-semibold relative z-10">{cat.name}</h3>
                <p className="text-xs text-primary mt-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">Shop Now →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Bestsellers</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Featured Products</h2>
            </div>
            <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg bg-card border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featured.length === 0 && (
            <p className="text-center text-muted-foreground">No featured products found.</p>
          )}

          {featured.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image_url={p.image_url}
                  category={p.categories?.name}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Just In</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">New Arrivals</h2>
            </div>
            <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              See More <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image_url={p.image_url}
                category={p.categories?.name}
              />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Reviews</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4 hover:border-primary/30 transition-colors">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-gold p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground mb-4 relative z-10">
            Get 20% Off Your First Order
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto relative z-10">
            Sign up now and get exclusive deals, early access to sales, and free shipping on your first purchase!
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-background text-foreground font-semibold hover:bg-background/90 transition-colors text-lg relative z-10"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">Get notified about new arrivals, exclusive deals, and special offers.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-secondary text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <button className="px-6 py-3 rounded-lg bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
