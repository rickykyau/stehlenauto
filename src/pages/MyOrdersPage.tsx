import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, ShoppingBag, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface OrderLineItem {
  title: string;
  quantity: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: string;
  currency: string;
  lineItems: OrderLineItem[];
}

const statusLabel = (s: string | null) => {
  if (!s) return null;
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login", { replace: true }); return; }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-customer-orders");
        if (fnError) throw fnError;
        setOrders(data?.orders || []);
      } catch (e: any) {
        console.error("Failed to fetch orders:", e);
        setError("Unable to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="font-display text-xl tracking-widest text-foreground mb-8">MY ORDERS</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : orders.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border bg-card p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-display text-xs tracking-widest">ORDER {order.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                {/* Line item thumbnails */}
                {order.lineItems.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {order.lineItems.map((item, i) => (
                      <div key={i} className="flex-shrink-0 flex items-center gap-2">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-10 h-10 object-cover rounded border border-border" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                          {item.title} ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {order.financialStatus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {statusLabel(order.financialStatus)}
                      </span>
                    )}
                    {order.fulfillmentStatus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {statusLabel(order.fulfillmentStatus)}
                      </span>
                    )}
                  </div>
                  <span className="font-display text-sm text-primary">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export default MyOrdersPage;
