import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createCustomer, loginCustomer } from "@/lib/shopify-customer";
import { useCustomer } from "@/contexts/CustomerContext";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
      return;
    }
    setLoading(true);
    const result = await createCustomer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    });
    if (!result.success) {
      setLoading(false);
      setError(result.errors?.[0]?.message || "Could not create account.");
      return;
    }
    // Auto-login after registration
    const loginResult = await loginCustomer(email.trim(), password);
    setLoading(false);
    if (loginResult.success && loginResult.token) {
      setToken(loginResult.token);
      navigate("/account");
    } else {
      navigate("/account/login");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl tracking-widest text-foreground text-center mb-8">CREATE ACCOUNT</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-body">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display text-[10px] tracking-widest text-muted-foreground mb-2">FIRST NAME</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 px-4 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-display text-[10px] tracking-widest text-muted-foreground mb-2">LAST NAME</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-4 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
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
              CREATE ACCOUNT
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="font-body text-sm text-muted-foreground">Already have an account? </span>
            <Link to="/account/login" className="font-body text-sm text-primary hover:brightness-110 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default RegisterPage;
