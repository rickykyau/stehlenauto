import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login", { replace: true });
      else setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
          <div className="animate-pulse h-40 bg-muted rounded" />
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="font-display text-xl tracking-widest text-foreground mb-8">MY ORDERS</h1>

        {/* Empty state — ready for future Shopify order sync */}
        <div className="border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="font-display text-sm tracking-widest text-foreground mb-2">NO ORDERS YET</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            When you place an order, it will appear here with tracking details.
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            START SHOPPING
          </Link>
        </div>

        {/* Future: order list will render here
        <div className="space-y-4">
          {orders.map(order => (
            <div className="border border-border bg-card p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-display text-xs tracking-widest">ORDER #{order.number}</span>
                <span className="text-xs text-muted-foreground">{order.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">{order.status}</span>
                <span className="font-display text-sm text-primary">${order.total}</span>
              </div>
            </div>
          ))}
        </div>
        */}
      </main>
      <SiteFooter />
    </>
  );
};

export default MyOrdersPage;
