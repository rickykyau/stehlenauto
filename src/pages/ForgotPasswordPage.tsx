import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { recoverPassword } from "@/lib/shopify-customer";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    const result = await recoverPassword(email.trim());
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.errors?.[0]?.message || "Could not send reset email.");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl tracking-widest text-foreground text-center mb-4">RESET PASSWORD</h1>
          <p className="font-body text-sm text-muted-foreground text-center mb-8">
            We'll send you a password reset link to your email.
          </p>
          {success ? (
            <div className="bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 px-4 py-4 text-sm text-[hsl(var(--success))] font-body text-center">
              If an account exists with that email, you'll receive a reset link shortly.
              <div className="mt-4">
                <Link to="/account/login" className="text-primary hover:brightness-110 transition-colors font-display text-xs tracking-widest">
                  BACK TO SIGN IN
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-body">
                  {error}
                </div>
              )}
              <div>
                <label className="block font-display text-[10px] tracking-widest text-muted-foreground mb-2">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                RESET PASSWORD
              </button>
            </form>
          )}
          {!success && (
            <div className="mt-6 text-center">
              <Link to="/account/login" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default ForgotPasswordPage;
