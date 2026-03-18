import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Star, Loader2, MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Address {
  id: string;
  full_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

const EMPTY: Omit<Address, "id" | "is_default"> = {
  full_name: "", address_line_1: "", address_line_2: null, city: "", state: "", zip_code: "", country: "US",
};

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const MyAddressesPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState(EMPTY);
  const [userId, setUserId] = useState<string>("");

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login", { replace: true }); return; }
    setUserId(session.user.id);
    const { data } = await supabase.from("addresses").select("*").eq("user_id", session.user.id).order("is_default", { ascending: false });
    setAddresses((data || []) as Address[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [navigate]);

  const startEdit = (addr: Address) => {
    setEditing(addr.id);
    setForm({ full_name: addr.full_name, address_line_1: addr.address_line_1, address_line_2: addr.address_line_2, city: addr.city, state: addr.state, zip_code: addr.zip_code, country: addr.country });
  };

  const startNew = () => {
    setEditing("new");
    setForm({ ...EMPTY });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.address_line_1 || !form.city || !form.state || !form.zip_code) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const isFirst = addresses.length === 0;

    if (editing === "new") {
      const { error } = await supabase.from("addresses").insert({
        user_id: userId,
        ...form,
        is_default: isFirst,
        updated_at: new Date().toISOString(),
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address added" });
    } else {
      const { error } = await supabase.from("addresses").update({
        ...form,
        updated_at: new Date().toISOString(),
      }).eq("id", editing);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address updated" });
    }

    // Sync to Shopify in background
    try {
      await supabase.functions.invoke("sync-address-to-shopify", {
        body: { ...form, email: (await supabase.auth.getSession()).data.session?.user.email },
      });
    } catch { /* silent */ }

    setEditing(null);
    setSaving(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Address deleted" });
      await load();
    }
  };

  const setDefault = async (id: string) => {
    // Unset all defaults first
    await supabase.from("addresses").update({ is_default: false, updated_at: new Date().toISOString() }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Default address updated" });
    await load();
  };

  if (loading) {
    return (<><SiteHeader /><main className="max-w-xl mx-auto px-4 lg:px-8 py-10"><div className="animate-pulse h-40 bg-muted rounded" /></main><SiteFooter /></>);
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-xl mx-auto px-4 lg:px-8 py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-xl tracking-widest text-foreground">MY ADDRESSES</h1>
          {!editing && (
            <button onClick={startNew} className="flex items-center gap-1 text-sm text-primary hover:underline font-display tracking-wider">
              <Plus className="w-4 h-4" /> ADD NEW
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="border border-border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Full name" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Address Line 1 *</label>
              <input value={form.address_line_1} onChange={e => setForm({ ...form, address_line_1: e.target.value })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Street address" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Address Line 2</label>
              <input value={form.address_line_2 || ""} onChange={e => setForm({ ...form, address_line_2: e.target.value || null })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Apt, suite, etc." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">City *</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">State *</label>
                <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none" required>
                  <option value="">Select</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">ZIP *</label>
                <input value={form.zip_code} onChange={e => setForm({ ...form, zip_code: e.target.value })} className="flex h-11 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SAVE"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="h-11 px-6 border border-border text-foreground font-display text-sm tracking-widest hover:bg-accent transition-colors">CANCEL</button>
            </div>
          </form>
        ) : addresses.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-sm tracking-widest text-foreground mb-2">NO ADDRESSES SAVED</p>
            <p className="font-body text-sm text-muted-foreground mb-6">Add a shipping address to speed up checkout.</p>
            <button onClick={startNew} className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> ADD ADDRESS
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(addr => (
              <div key={addr.id} className="border border-border bg-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-display text-sm tracking-wider text-foreground">{addr.full_name}</span>
                    {addr.is_default && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-display tracking-widest text-primary">
                        <Star className="w-3 h-3 fill-primary" /> DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(addr)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ""}<br />
                  {addr.city}, {addr.state} {addr.zip_code}
                </p>
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} className="mt-3 text-xs text-primary hover:underline font-display tracking-wider">SET AS DEFAULT</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export default MyAddressesPage;
