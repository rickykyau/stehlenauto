import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2, Loader2, ExternalLink } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { trackEvent } from "@/lib/analytics";
import PromoCodeInput from "./PromoCodeInput";

interface AppliedPromo {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number | null;
}

const CartDrawer = () => {
  const {
    items, isOpen, isLoading, isSyncing,
    closeCart, removeItem, updateQuantity, clearCart,
    syncCart, getCheckoutUrl,
  } = useCartStore();

  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);

  const discount = appliedPromo
    ? appliedPromo.discount_type === "percentage"
      ? subtotal * (appliedPromo.discount_value / 100)
      : Math.min(appliedPromo.discount_value, subtotal)
    : 0;
  const total = subtotal - discount;

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Sync cart when drawer opens
  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  // Clear promo when cart empties
  useEffect(() => { if (items.length === 0) setAppliedPromo(null); }, [items.length]);

  const handleCheckout = async () => {
    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) return;

    const totalValue = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
    trackEvent("begin_checkout", {
      currency: "USD",
      value: totalValue,
      items: items.map((i) => ({
        item_id: i.product.node.id,
        item_name: i.product.node.title,
        item_brand: "Stehlen",
        price: parseFloat(i.price.amount),
        quantity: i.quantity,
      })),
    });

    // Allow time for the event to send before redirect
    await new Promise((r) => setTimeout(r, 150));

    const url = appliedPromo
      ? `${checkoutUrl}${checkoutUrl.includes("?") ? "&" : "?"}discount=${appliedPromo.code}`
      : checkoutUrl;
    window.open(url, "_blank");
    closeCart();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-card z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-[0.2em]">YOUR CART</span>
            {itemCount > 0 && (
              <span className="font-display text-[10px] tracking-wider text-muted-foreground">({itemCount})</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
            <p className="font-display text-xs tracking-widest text-muted-foreground">YOUR CART IS EMPTY</p>
            <Link
              to="/collections/all"
              onClick={closeCart}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-[11px] tracking-widest hover:brightness-110 transition-all btn-press"
            >
              SHOP ALL PARTS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => {
                const image = item.product.node.images?.edges?.[0]?.node?.url || "/placeholder.svg";
                return (
                  <div key={item.variantId} className="flex gap-4 p-5 border-b border-border">
                    {/* Thumbnail */}
                    <Link to={`/products/${item.product.node.handle}`} onClick={closeCart} className="w-20 h-20 bg-muted shrink-0 overflow-hidden border border-border">
                      <img src={image} alt={item.product.node.title} className="w-full h-full object-cover" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.node.handle}`} onClick={closeCart} className="font-body text-sm leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 block">
                        {item.product.node.title}
                      </Link>
                      {item.variantTitle !== "Default Title" && (
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="font-display text-sm text-primary font-bold mt-1">
                        ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center font-display text-xs border-x border-border">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          disabled={isLoading}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border shrink-0">
              {/* Promo Code */}
              <div className="px-5 pt-4">
                <PromoCodeInput
                  subtotal={subtotal}
                  appliedPromo={appliedPromo}
                  onApply={setAppliedPromo}
                  onRemove={() => setAppliedPromo(null)}
                />
              </div>

              {/* Subtotal */}
              <div className="px-5 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] tracking-widest text-muted-foreground">SUBTOTAL</span>
                  <span className="font-body text-sm text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[10px] tracking-widest text-primary">DISCOUNT</span>
                    <span className="font-body text-sm text-primary">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="font-display text-xs tracking-widest text-foreground">TOTAL</span>
                  <span className="font-display text-lg text-foreground font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <p className="px-5 pb-3 font-body text-[11px] text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>

              {/* Actions */}
              <div className="px-5 pb-5 space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || isSyncing}
                  className="w-full h-12 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      CHECKOUT
                    </>
                  )}
                </button>
                <button
                  onClick={closeCart}
                  className="w-full h-10 border border-border text-muted-foreground font-display text-[10px] tracking-widest hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  CONTINUE SHOPPING
                </button>
              </div>

              {/* Clear cart */}
              <div className="px-5 pb-4 text-center">
                <button onClick={clearCart} className="font-display text-[10px] tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                  CLEAR CART
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
