import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Power, PowerOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  applies_to: string;
  product_ids: string[] | null;
  collection_ids: string[] | null;
  created_at: string;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discount_type: "percentage" as string,
  discount_value: 0,
  minimum_order_amount: "",
  max_uses: "",
  starts_at: new Date().toISOString().slice(0, 16),
  expires_at: "",
  is_active: true,
  applies_to: "all" as string,
};

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "disabled">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCodes = useCallback(async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes((data as any[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const filtered = codes.filter((c) => {
    const now = new Date();
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filter === "active") return c.is_active && new Date(c.expires_at) > now;
    if (filter === "expired") return new Date(c.expires_at) <= now;
    if (filter === "disabled") return !c.is_active;
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (c: PromoCode) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description ?? "",
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      minimum_order_amount: c.minimum_order_amount?.toString() ?? "",
      max_uses: c.max_uses?.toString() ?? "",
      starts_at: c.starts_at.slice(0, 16),
      expires_at: c.expires_at.slice(0, 16),
      is_active: c.is_active,
      applies_to: c.applies_to,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.expires_at || form.discount_value <= 0) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      minimum_order_amount: form.minimum_order_amount ? parseFloat(form.minimum_order_amount) : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      starts_at: new Date(form.starts_at).toISOString(),
      expires_at: new Date(form.expires_at).toISOString(),
      is_active: form.is_active,
      applies_to: form.applies_to,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("promo_codes").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("promo_codes").insert({
        ...payload,
        created_by: session?.user?.id ?? null,
      }));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error saving promo code", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Promo code updated" : "Promo code created" });
      setDialogOpen(false);
      fetchCodes();
    }
  };

  const toggleActive = async (c: PromoCode) => {
    await supabase.from("promo_codes").update({ is_active: !c.is_active, updated_at: new Date().toISOString() }).eq("id", c.id);
    fetchCodes();
  };

  const getStatus = (c: PromoCode) => {
    if (!c.is_active) return { label: "DISABLED", cls: "bg-muted text-muted-foreground" };
    if (new Date(c.expires_at) <= new Date()) return { label: "EXPIRED", cls: "bg-destructive/20 text-destructive" };
    return { label: "ACTIVE", cls: "bg-green-500/20 text-green-400" };
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56 h-9"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-9 border border-input bg-background text-foreground text-sm px-3 font-body focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Create Promo Code
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">CODE</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">DISCOUNT</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">USAGE</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">STATUS</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">DATES</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const status = getStatus(c);
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <span className="font-display text-xs tracking-wider text-foreground">{c.code}</span>
                    {c.description && <p className="font-body text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-body text-foreground">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3 font-body text-muted-foreground">
                    {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 font-display text-[9px] tracking-wider ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.starts_at).toLocaleDateString()} – {new Date(c.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(c)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title={c.is_active ? "Disable" : "Enable"}>
                        {c.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">
                  No promo codes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-widest">
              {editingId ? "EDIT PROMO CODE" : "CREATE PROMO CODE"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">CODE *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SPRING20" className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">DISCOUNT TYPE</Label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full h-10 border border-input bg-background text-foreground text-sm px-3 font-body"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-[10px] tracking-widest">DESCRIPTION</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Spring sale discount" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">VALUE *</Label>
                <Input type="number" min="0" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">MIN ORDER</Label>
                <Input type="number" min="0" value={form.minimum_order_amount} onChange={(e) => setForm({ ...form, minimum_order_amount: e.target.value })} placeholder="—" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">MAX USES</Label>
                <Input type="number" min="0" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="∞" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">STARTS AT *</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-display text-[10px] tracking-widest">EXPIRES AT *</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" />
                <span className="font-body text-sm text-foreground">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
