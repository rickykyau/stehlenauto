import { useState } from "react";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface PromoResult {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number | null;
}

interface PromoCodeInputProps {
  subtotal: number;
  appliedPromo: PromoResult | null;
  onApply: (promo: PromoResult) => void;
  onRemove: () => void;
}

export default function PromoCodeInput({ subtotal, appliedPromo, onApply, onRemove }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (fetchError || !data) {
      setLoading(false);
      setError("Invalid promo code");
      trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal });
      return;
    }

    const now = new Date();
    if (!data.is_active) { setLoading(false); setError("This code is no longer active"); trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal }); return; }
    if (new Date(data.expires_at) <= now) { setLoading(false); setError("This code has expired"); trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal }); return; }
    if (new Date(data.starts_at) > now) { setLoading(false); setError("This code is not yet valid"); trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal }); return; }
    if (data.max_uses && data.current_uses >= data.max_uses) { setLoading(false); setError("This code has reached its usage limit"); trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal }); return; }
    if (data.minimum_order_amount && subtotal < data.minimum_order_amount) {
      setLoading(false);
      setError(`Minimum order of $${data.minimum_order_amount.toFixed(2)} required`);
      trackEvent("coupon_applied", { coupon_code: code.trim().toUpperCase(), success: false, cart_value: subtotal });
      return;
    }

    // Check per-user usage limit
    const maxPerUser = (data as any).max_uses_per_user;
    if (maxPerUser !== null && maxPerUser !== undefined) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { count } = await supabase
          .from("promo_code_usage")
          .select("id", { count: "exact", head: true })
          .eq("promo_code_id", data.id)
          .eq("user_id", session.user.id);
        if (count !== null && count >= maxPerUser) {
          setLoading(false);
          setError("You've already used this code the maximum number of times");
          return;
        }
      }
    }

    setLoading(false);
    onApply({
      id: data.id,
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      minimum_order_amount: data.minimum_order_amount,
    });
    setCode("");
  };

  if (appliedPromo) {
    const discountLabel = appliedPromo.discount_type === "percentage"
      ? `${appliedPromo.discount_value}% off`
      : `$${appliedPromo.discount_value.toFixed(2)} off`;

    return (
      <div className="flex items-center justify-between bg-primary/10 border border-primary/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-primary" />
          <span className="font-display text-[10px] tracking-wider text-primary">{appliedPromo.code}</span>
          <span className="font-body text-xs text-primary/70">({discountLabel})</span>
        </div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-0">
        <div className="flex items-center px-2.5 border border-r-0 border-border bg-muted">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Promo code"
          className="flex-1 h-9 border border-border bg-background px-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none uppercase"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="h-9 px-4 bg-primary text-primary-foreground font-display text-[10px] tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "APPLY"}
        </button>
      </div>
      {error && <p className="font-body text-xs text-destructive">{error}</p>}
    </div>
  );
}
