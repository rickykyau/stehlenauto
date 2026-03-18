import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PROVIDER_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
  google: {
    label: "Signed in with Google",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  email: {
    label: "Signed in with Email",
    icon: <Mail className="w-5 h-5 text-muted-foreground" />,
  },
};

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("email");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login", { replace: true }); return; }

      const user = session.user;
      setEmail(user.email || "");
      setProvider(user.app_metadata?.provider || "email");

      const meta = user.user_metadata || {};
      const metaFirst = meta.given_name || meta.first_name || (meta.full_name ? meta.full_name.split(" ")[0] : "");
      const metaLast = meta.family_name || meta.last_name || (meta.full_name ? meta.full_name.split(" ").slice(1).join(" ") : "");

      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

      if (data) {
        // Use profile values, fall back to Google metadata if empty
        const fn = data.first_name || metaFirst;
        const ln = data.last_name || metaLast;
        setFirstName(fn);
        setLastName(ln);
        setPhone(data.phone || "");

        // Auto-save Google name to profile if profile fields are empty
        if ((!data.first_name || !data.last_name) && (metaFirst || metaLast)) {
          await supabase.from("profiles").update({
            first_name: fn || null,
            last_name: ln || null,
            updated_at: new Date().toISOString(),
          }).eq("user_id", user.id);
        }
      } else {
        // No profile row yet — use metadata
        setFirstName(metaFirst);
        setLastName(metaLast);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("profiles").upsert({
      user_id: session.user.id,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      phone: phone.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your profile has been updated." });
      try {
        await supabase.functions.invoke("sync-profile-to-shopify", {
          body: { first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), email },
        });
      } catch { /* silent */ }
    }
    setSaving(false);
  };

  const providerInfo = PROVIDER_INFO[provider] || PROVIDER_INFO.email;

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="max-w-xl mx-auto px-4 lg:px-8 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-xl mx-auto px-4 lg:px-8 py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <h1 className="font-display text-xl tracking-widest text-foreground mb-8">ACCOUNT SETTINGS</h1>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              value={email}
              disabled
              className="flex h-11 w-full border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Phone <span className="text-muted-foreground">(optional)</span></label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          {/* Sign-in Method */}
          <div className="border border-border bg-card/50 p-4 space-y-1">
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">SIGN-IN METHOD</span>
            <div className="flex items-center gap-3">
              {providerInfo.icon}
              <div>
                <p className="text-sm font-medium text-foreground">{providerInfo.label}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SAVE CHANGES"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
};

export default AccountSettingsPage;
