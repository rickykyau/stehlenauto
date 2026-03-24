import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, Package, ShoppingBag, Loader2, MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface LineItem {
  title: string;
  quantity: number;
  price?: string;
  sku?: string;
  image_url?: string | null;
  // Legacy format from Shopify API edge function
  imageUrl?: string | null;
}

interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

interface Order {
  id: string;
  shopify_order_id: string;
  order_number: string;
  email: string | null;
  customer_name: string | null;
  total_price: number;
  currency_code: string;
  financial_status: string;
  fulfillment_status: string;
  line_items: LineItem[];
  shipping_address: ShippingAddress | null;
  created_at: string;
}

const financialBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "paid") return <Badge className="bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/20">Paid</Badge>;
  if (s === "refunded") return <Badge className="bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/20">Refunded</Badge>;
  if (s === "partially_refunded") return <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 hover:bg-orange-600/20">Partially Refunded</Badge>;
  return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 hover:bg-yellow-600/20">{status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Pending"}</Badge>;
};

const fulfillmentBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "fulfilled" || s === "shipped") return <Badge variant="outline" className="border-green-600/30 text-green-400">Fulfilled</Badge>;
  if (s === "partially_fulfilled") return <Badge variant="outline" className="border-yellow-600/30 text-yellow-400">Partially Fulfilled</Badge>;
  return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Unfulfilled</Badge>;
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login", { replace: true }); return; }

      try {
        const { data, error: qError } = await supabase
          .from("orders")
          .select("id, shopify_order_id, order_number, email, customer_name, total_price, currency_code, financial_status, fulfillment_status, line_items, shipping_address, created_at")
          .order("created_at", { ascending: false });

        if (qError) throw qError;
        setOrders((data as any[]) || []);
      } catch (e: any) {
        console.error("Failed to fetch orders:", e);
        setError("Unable to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const toggleExpand = (id: string) => {
    setExpandedOrder(prev => prev === id ? null : id);
  };

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
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const items = order.line_items || [];
              const address = order.shipping_address as ShippingAddress | null;

              return (
                <div key={order.id} className="border border-border bg-card">
                  {/* Header - always visible */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-display text-xs tracking-widest">ORDER {order.order_number}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Line item thumbnails */}
                    {items.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {items.slice(0, 4).map((item, i) => {
                          const imgUrl = item.image_url || item.imageUrl;
                          return (
                            <div key={i} className="flex-shrink-0 flex items-center gap-2">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item.title} className="w-10 h-10 object-cover rounded border border-border" />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                                {item.title} ×{item.quantity}
                              </span>
                            </div>
                          );
                        })}
                        {items.length > 4 && (
                          <span className="text-xs text-muted-foreground self-center">+{items.length - 4} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 flex-wrap">
                        {financialBadge(order.financial_status)}
                        {fulfillmentBadge(order.fulfillment_status)}
                      </div>
                      <span className="font-display text-sm text-primary">
                        ${order.total_price.toFixed(2)}
                      </span>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border p-5 space-y-4">
                      {/* Full line items */}
                      <div>
                        <h3 className="font-display text-xs tracking-widest mb-3">ITEMS</h3>
                        <div className="space-y-3">
                          {items.map((item, i) => {
                            const imgUrl = item.image_url || item.imageUrl;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                {imgUrl ? (
                                  <img src={imgUrl} alt={item.title} className="w-14 h-14 object-cover rounded border border-border" />
                                ) : (
                                  <div className="w-14 h-14 bg-muted rounded border border-border flex items-center justify-center">
                                    <Package className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                    {item.price && <> · ${parseFloat(item.price).toFixed(2)}</>}
                                    {item.sku && <> · SKU: {item.sku}</>}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shipping address */}
                      {address && (address.address1 || address.city) && (
                        <div>
                          <h3 className="font-display text-xs tracking-widest mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> SHIPPING ADDRESS
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {[address.first_name, address.last_name].filter(Boolean).join(" ")}<br />
                            {address.address1}
                            {address.address2 && <><br />{address.address2}</>}<br />
                            {[address.city, address.province, address.zip].filter(Boolean).join(", ")}
                            {address.country && <><br />{address.country}</>}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export default MyOrdersPage;
