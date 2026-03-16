import { useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCustomer } from "@/contexts/CustomerContext";
import { useEffect } from "react";

const OrderDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, loading } = useCustomer();
  const order = location.state?.order;

  useEffect(() => {
    if (!loading && !customer) navigate("/account/login");
  }, [loading, customer, navigate]);

  if (!order) {
    return (
      <>
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 py-10 min-h-[60vh]">
          <p className="font-body text-sm text-muted-foreground">Order not found.</p>
          <Link to="/account" className="text-primary font-display text-xs tracking-widest mt-4 inline-block">← BACK TO ACCOUNT</Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const lineItems = order.lineItems.edges;

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link to="/account" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-display text-[10px] tracking-widest mb-6">
          <ChevronLeft className="w-3.5 h-3.5" /> BACK TO ACCOUNT
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl tracking-widest text-foreground">{order.name}</h1>
          <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">
            {order.fulfillmentStatus.replace(/_/g, " ")}
          </span>
        </div>

        <p className="font-body text-sm text-muted-foreground mb-6">
          Placed on {new Date(order.processedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {/* Line items */}
        <div className="border border-border bg-card mb-6">
          <div className="px-5 py-3 border-b border-border">
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">ITEMS</span>
          </div>
          {lineItems.map(({ node: item }: { node: { title: string; quantity: number; variant: { image: { url: string; altText: string | null } | null; price: { amount: string } } | null } }, i: number) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0">
              {item.variant?.image?.url ? (
                <img src={item.variant.image.url} alt={item.variant.image.altText || item.title} className="w-16 h-16 object-cover bg-muted shrink-0" loading="lazy" />
              ) : (
                <div className="w-16 h-16 bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground">{item.title}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-display text-sm text-primary">
                ${item.variant ? parseFloat(item.variant.price.amount).toFixed(2) : "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border border-border bg-card mb-6">
          <div className="px-5 py-3 border-b border-border">
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">ORDER TOTAL</span>
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${parseFloat(order.subtotalPrice?.amount || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">${parseFloat(order.totalShippingPrice?.amount || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">${parseFloat(order.totalTax?.amount || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-display text-sm border-t border-border pt-2 mt-2">
              <span className="text-foreground tracking-widest">TOTAL</span>
              <span className="text-primary">${parseFloat(order.totalPrice.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="border border-border bg-card">
            <div className="px-5 py-3 border-b border-border">
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">SHIPPING ADDRESS</span>
            </div>
            <div className="px-5 py-4">
              <p className="font-body text-sm text-foreground">{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p className="font-body text-sm text-muted-foreground">{order.shippingAddress.address2}</p>}
              <p className="font-body text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
              </p>
              <p className="font-body text-sm text-muted-foreground">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* Tracking */}
        {order.statusUrl && (
          <div className="mt-6 text-center">
            <a
              href={order.statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 px-6 items-center bg-primary text-primary-foreground font-display text-[10px] tracking-widest hover:brightness-110 transition-all btn-press"
            >
              VIEW ORDER STATUS
            </a>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export default OrderDetailPage;
