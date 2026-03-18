import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login", { replace: true }); return; }
      setEmail(session.user.email || "");
      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
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
      // Sync to Shopify in background
      try {
        await supabase.functions.invoke("sync-profile-to-shopify", {
          body: { first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), email },
        });
      } catch { /* silent */ }
    }
    setSaving(false);
  };

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
