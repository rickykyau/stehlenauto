import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setEntries((data as any[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const actions = [...new Set(entries.map((e) => e.action))];
  const entityTypes = [...new Set(entries.map((e) => e.entity_type))];

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      e.action.toLowerCase().includes(q) ||
      e.entity_type.toLowerCase().includes(q) ||
      (e.entity_id || "").toLowerCase().includes(q);
    const matchesAction = filterAction === "all" || e.action === filterAction;
    const matchesEntity = filterEntity === "all" || e.entity_type === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm font-body">{entries.length} audit entries</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit log…"
            className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-sm font-body text-foreground"
        >
          <option value="all">All Entities</option>
          {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">ACTION</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">ENTITY</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">DETAILS</th>
              <th className="px-4 py-3 font-display text-[9px] tracking-widest text-muted-foreground">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground text-xs">No audit entries yet</td></tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-display text-[9px] tracking-wider">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-foreground">
                    <span className="text-muted-foreground">{e.entity_type}</span>
                    {e.entity_id && <span className="ml-1 text-xs text-muted-foreground">({e.entity_id.slice(0, 8)}…)</span>}
                  </td>
                  <td className="px-4 py-3 font-body text-muted-foreground text-xs max-w-[300px] truncate">
                    {e.details ? JSON.stringify(e.details) : "—"}
                  </td>
                  <td className="px-4 py-3 font-body text-muted-foreground text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
