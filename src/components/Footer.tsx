import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold text-gradient-gold">LUXE</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium quality products curated for the modern lifestyle. Experience luxury shopping with AI-powered assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">Products</Link>
              <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cart</Link>
              <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Orders</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">Support</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-muted-foreground">Shipping & Returns</span>
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
              <span className="text-sm text-muted-foreground">FAQ</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                rajparihar121314@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                +91 79766 82256
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                Ahmedabad, Gujarat
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 LUXE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
