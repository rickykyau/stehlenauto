import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Star, Truck, Loader2, ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useVehicle } from "@/contexts/VehicleContext";
import { toast } from "@/hooks/use-toast";

const YEARS = Array.from({ length: 30 }, (_, i) => (2025 - i).toString());
const MAKES = ["Ford", "Chevy", "Dodge", "GMC", "Toyota", "Nissan", "Jeep", "Ram"];
const MODELS: Record<string, string[]> = {
  Ford: ["F-150", "F-250", "F-350", "Ranger", "Bronco", "Explorer", "Expedition", "Mustang"],
  Chevy: ["Silverado 1500", "Silverado 2500", "Colorado", "Tahoe", "Suburban", "Traverse"],
  Dodge: ["Ram 1500", "Ram 2500", "Dakota", "Durango", "Charger", "Challenger"],
  GMC: ["Sierra 1500", "Sierra 2500", "Canyon", "Yukon", "Acadia"],
  Toyota: ["Tacoma", "Tundra", "4Runner", "Highlander", "RAV4"],
  Nissan: ["Frontier", "Titan", "Pathfinder", "Xterra", "Armada"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Gladiator", "Compass"],
  Ram: ["1500", "2500", "3500"],
};

interface UserVehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  is_primary: boolean;
}

const MyVehiclesPage = () => {
  const navigate = useNavigate();
  const { setVehicle } = useVehicle();
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [userId, setUserId] = useState("");

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login", { replace: true }); return; }
    setUserId(session.user.id);
    const { data } = await supabase.from("user_vehicles").select("*").eq("user_id", session.user.id).order("is_primary", { ascending: false });
    const v = (data || []) as UserVehicle[];
    setVehicles(v);
    // Set primary vehicle in context
    const primary = v.find(x => x.is_primary);
    if (primary) setVehicle({ year: primary.year, make: primary.make, model: primary.model });
    setLoading(false);
  };

  useEffect(() => { load(); }, [navigate]);

  const startEdit = (v: UserVehicle) => {
    setEditing(v.id);
    setYear(v.year);
    setMake(v.make);
    setModel(v.model);
  };

  const startNew = () => {
    setEditing("new");
    setYear("");
    setMake("");
    setModel("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !make || !model) return;
    setSaving(true);
    const isFirst = vehicles.length === 0;

    if (editing === "new") {
      await supabase.from("user_vehicles").insert({
        user_id: userId, year, make, model, is_primary: isFirst,
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Vehicle added" });
    } else {
      await supabase.from("user_vehicles").update({
        year, make, model, updated_at: new Date().toISOString(),
      }).eq("id", editing);
      toast({ title: "Vehicle updated" });
    }

    setEditing(null);
    setSaving(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("user_vehicles").delete().eq("id", id);
    toast({ title: "Vehicle removed" });
    await load();
  };

  const setPrimary = async (id: string) => {
    await supabase.from("user_vehicles").update({ is_primary: false, updated_at: new Date().toISOString() }).eq("user_id", userId);
    await supabase.from("user_vehicles").update({ is_primary: true, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Primary vehicle updated" });
    await load();
  };

  const selectClass = "flex h-12 w-full border border-input bg-background px-4 py-2 text-sm font-display tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary";

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
          <h1 className="font-display text-xl tracking-widest text-foreground">MY VEHICLES</h1>
          {!editing && (
            <button onClick={startNew} className="flex items-center gap-1 text-sm text-primary hover:underline font-display tracking-wider">
              <Plus className="w-4 h-4" /> ADD VEHICLE
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <select value={year} onChange={e => { setYear(e.target.value); setMake(""); setModel(""); }} className={selectClass}>
                  <option value="">YEAR</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={make} onChange={e => { setMake(e.target.value); setModel(""); }} disabled={!year} className={`${selectClass} disabled:opacity-40`}>
                  <option value="">MAKE</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={model} onChange={e => setModel(e.target.value)} disabled={!make} className={`${selectClass} disabled:opacity-40`}>
                  <option value="">MODEL</option>
                  {make && MODELS[make]?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving || !year || !make || !model} className="h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SAVE"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="h-11 px-6 border border-border text-foreground font-display text-sm tracking-widest hover:bg-accent transition-colors">CANCEL</button>
            </div>
          </form>
        ) : vehicles.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-sm tracking-widest text-foreground mb-2">NO VEHICLES SAVED</p>
            <p className="font-body text-sm text-muted-foreground mb-6">Save your vehicle to quickly find compatible parts.</p>
            <button onClick={startNew} className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-display text-sm tracking-widest hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> ADD VEHICLE
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map(v => (
              <div key={v.id} className="border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-display text-sm tracking-wider text-foreground">{v.year} {v.make} {v.model}</span>
                    {v.is_primary && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-display tracking-widest text-primary">
                        <Star className="w-3 h-3 fill-primary" /> PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(v)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {!v.is_primary && (
                  <button onClick={() => setPrimary(v.id)} className="mt-3 text-xs text-primary hover:underline font-display tracking-wider">SET AS PRIMARY</button>
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

export default MyVehiclesPage;
