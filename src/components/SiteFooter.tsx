import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/stehlen-logo.png";

const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-border">
        {/* Brand */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-border">
          <img src={logo} alt="Stehlen Auto" className="h-6 mb-4" />
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Heavy-duty truck accessories. Engineered for precision. Built for the long haul.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Information */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-border">
          <h4 className="font-display text-xs tracking-[0.15em] text-muted-foreground mb-4">INFORMATION</h4>
          <ul className="space-y-2">
            {[
              { label: "Product Warranty", to: "/pages/warranty" },
              { label: "Terms & Conditions", to: "/policies/terms-of-service" },
              { label: "Returns Policy", to: "/policies/refund-policy" },
              { label: "Privacy Policy", to: "/policies/privacy-policy" },
            ].map((link) => (
              <li key={link.label}>
                <a href={link.to} className="font-body text-sm text-secondary-foreground hover:text-primary transition-colors">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-border">
          <h4 className="font-display text-xs tracking-[0.15em] text-muted-foreground mb-4">CUSTOMER SERVICE</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-body text-sm text-secondary-foreground">909-895-4522</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-body text-sm text-secondary-foreground">info@stehlenauto.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-body text-sm text-secondary-foreground">City of Industry, CA</span>
            </div>
            <p className="font-display text-[10px] tracking-wider text-muted-foreground mt-2">9AM–6PM MON–FRI PST</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="p-8">
          <h4 className="font-display text-xs tracking-[0.15em] text-muted-foreground mb-4">JOIN THE BUILD</h4>
          <p className="font-body text-sm text-muted-foreground mb-4">Get first access to new parts and exclusive deals.</p>
          <div className="flex border border-border">
            <input
              type="email"
              placeholder="EMAIL"
              className="flex-1 h-10 px-3 bg-input text-foreground font-display text-xs tracking-wider focus:outline-none"
            />
            <button className="h-10 px-4 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest btn-press hover:brightness-110">
              SIGN UP
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 flex items-center justify-between">
        <span className="font-display text-[10px] tracking-wider text-muted-foreground">© 2025 STEHLEN AUTO. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-4">
          <span className="font-display text-[10px] tracking-wider text-muted-foreground">SECURE CHECKOUT</span>
          <span className="font-display text-[10px] tracking-wider text-muted-foreground">AUTHORIZED DEALER</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
