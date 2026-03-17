import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, Mail, Phone, MapPin, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface FaqItem {
  q: string;
  a: string;
}

interface HelpSection {
  title: string;
  icon?: string;
  bullets?: string[];
  faqs?: FaqItem[];
  linkTo?: string;
  linkLabel?: string;
}

const SECTIONS: HelpSection[] = [
  {
    title: "Shipping & Delivery",
    bullets: [
      "Free shipping on ALL orders within the contiguous United States",
      "Orders processed and shipped within 1-2 business days",
      "Standard Shipping: 5-7 business days",
      "Expedited Shipping: 2-3 business days",
    ],
    linkTo: "/shipping-policy",
    linkLabel: "View full shipping policy →",
  },
  {
    title: "Returns & Refunds",
    bullets: [
      "30-day return policy from date of receipt",
      "Product must be unused and in original packaging",
      "Contact contact@stehlenautomotive.com to start a return",
      "Refunds processed within 5-7 business days after receiving the item",
    ],
    linkTo: "/refund-policy",
    linkLabel: "View full return policy →",
  },
  {
    title: "Product Warranty",
    bullets: [
      "1 Year Limited Warranty for all Stehlen products",
      "Covers defects in material or workmanship under normal use",
      "Contact support with order number and photos for warranty claims",
    ],
  },
  {
    title: "Fitment & Compatibility",
    bullets: [
      "Each product shows specific vehicle fitment (years, makes, models)",
      'Use "SELECT YOUR VEHICLE" to filter parts that fit your vehicle',
      "Fitment Guaranteed — fits your vehicle or money back",
    ],
  },
  {
    title: "Installation",
    bullets: [
      "Most products designed for DIY installation",
      "No drilling required for most bolt-on accessories",
      "Product pages include installation time estimates and required tools",
    ],
  },
  {
    title: "Contact Us",
    bullets: [
      "Email: contact@stehlenautomotive.com",
      "Phone: (626) 274-9779",
      "Business Hours: Monday - Friday, 9am - 5pm PST",
      "Location: Walnut, California",
    ],
  },
  {
    title: "FAQ",
    faqs: [
      {
        q: "How do I know if a part fits my vehicle?",
        a: "Each product page shows specific vehicle fitment information. Use the vehicle selector to filter compatible parts.",
      },
      {
        q: "Do you offer installation?",
        a: "We do not offer installation services, but most products are designed for DIY installation with included instructions.",
      },
      {
        q: "What if a part doesn't fit?",
        a: "We offer a fitment guarantee. If the part doesn't fit your specified vehicle, contact us for a full refund or exchange.",
      },
      {
        q: "How do I track my order?",
        a: "You'll receive a tracking number via email once your order ships.",
      },
    ],
  },
];

function matchesSearch(section: HelpSection, query: string): boolean {
  const q = query.toLowerCase();
  if (section.title.toLowerCase().includes(q)) return true;
  if (section.bullets?.some((b) => b.toLowerCase().includes(q))) return true;
  if (section.linkLabel?.toLowerCase().includes(q)) return true;
  if (section.faqs?.some((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))) return true;
  return false;
}

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  const filtered = useMemo(() => {
    if (!search.trim()) return SECTIONS.map((s, i) => ({ section: s, index: i }));
    return SECTIONS
      .map((s, i) => ({ section: s, index: i }))
      .filter(({ section }) => matchesSearch(section, search));
  }, [search]);

  // Auto-expand all when searching
  const isExpanded = (i: number) => (search.trim() ? true : !!expanded[i]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <div className="border-b border-border px-4 lg:px-8 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider mb-2">HELP CENTER</h1>
        <p className="font-display text-xs tracking-widest text-muted-foreground mb-8">
          FIND ANSWERS TO COMMON QUESTIONS
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="How can we help you?"
            className="w-full bg-card border border-border pl-11 pr-4 py-3 font-display text-xs tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="font-display text-xs tracking-widest text-muted-foreground">
              NO RESULTS FOUND FOR "{search.toUpperCase()}"
            </p>
          </div>
        )}

        {filtered.map(({ section, index }) => (
          <div key={index} className="border border-border bg-card">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group"
            >
              <h2 className="font-display text-xs tracking-widest font-bold text-primary">
                {section.title.toUpperCase()}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  isExpanded(index) ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded(index) && (
              <div className="px-5 pb-5 border-t border-border pt-4">
                {/* Bullet list */}
                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, bi) => (
                      <li key={bi} className="flex items-start gap-3">
                        <span className="w-1 h-1 mt-2 bg-primary shrink-0" />
                        <span className="font-display text-[11px] tracking-wide text-muted-foreground leading-relaxed">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.linkTo && (
                  <Link to={section.linkTo} className="inline-block mt-3 font-display text-[11px] tracking-wide text-primary hover:underline">
                    {section.linkLabel}
                  </Link>
                )}

                {/* FAQ items */}
                {section.faqs && (
                  <div className="space-y-4">
                    {section.faqs
                      .filter((f) => {
                        if (!search.trim()) return true;
                        const q = search.toLowerCase();
                        return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
                      })
                      .map((faq, fi) => (
                        <div key={fi}>
                          <p className="font-display text-[11px] tracking-wide text-foreground font-bold mb-1">
                            {faq.q}
                          </p>
                          <p className="font-display text-[11px] tracking-wide text-muted-foreground leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Contact CTA */}
        <div className="text-center pt-8 pb-4">
          <p className="font-display text-xs tracking-widest text-muted-foreground mb-4">
            STILL NEED HELP?
          </p>
          <Link
            to="/contact"
            className="inline-block border border-primary bg-primary/10 px-8 py-3 font-display text-xs tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default HelpCenterPage;
