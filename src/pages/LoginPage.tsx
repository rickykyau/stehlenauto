import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { loginCustomer } from "@/lib/shopify-customer";
import { useCustomer } from "@/contexts/CustomerContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = await loginCustomer(email.trim(), password);
    setLoading(false);
    if (result.success && result.token) {
      setToken(result.token);
      navigate("/account");
    } else {
      setError(result.errors?.[0]?.message || "Invalid email or password.");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl tracking-widest text-foreground text-center mb-8">SIGN IN</h1>
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
            <div>
              <label className="block font-display text-[10px] tracking-widest text-muted-foreground mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              SIGN IN
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/account/forgot-password" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Forgot Password?
            </Link>
          </div>
          <div className="mt-6 text-center">
            <span className="font-body text-sm text-muted-foreground">Don't have an account? </span>
            <Link to="/account/register" className="font-body text-sm text-primary hover:brightness-110 transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default LoginPage;
