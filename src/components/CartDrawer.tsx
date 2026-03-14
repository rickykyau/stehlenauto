import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5 border-b border-border">
                  {/* Thumbnail */}
                  <Link to={`/products/${item.slug}`} onClick={closeCart} className="w-20 h-20 bg-muted shrink-0 overflow-hidden border border-border">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} onClick={closeCart} className="font-body text-sm leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 block">
                      {item.title}
                    </Link>
                    <p className="font-display text-sm text-primary font-bold mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center font-display text-xs border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border shrink-0">
              {/* Subtotal */}
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="font-display text-xs tracking-widest text-muted-foreground">SUBTOTAL</span>
                <span className="font-display text-lg text-foreground font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <p className="px-5 pb-3 font-body text-[11px] text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>

              {/* Actions */}
              <div className="px-5 pb-5 space-y-2">
                <button
                  className="w-full h-12 bg-primary text-primary-foreground font-display text-xs font-bold tracking-widest hover:brightness-110 transition-all btn-press"
                >
                  CHECKOUT
                </button>
                <button
                  onClick={() => { closeCart(); }}
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
