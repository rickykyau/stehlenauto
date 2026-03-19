import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Ticket {
  id: string;
  user_id: string | null;
  conversation_id: string | null;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setTickets((data as Ticket[]) || []);
    setLoading(false);
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    setSaving(true);
    await supabase
      .from("support_tickets")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchTickets();
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, ...updates } as Ticket);
    }
    setSaving(false);
  };

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.id.includes(search)) return false;
    return true;
  });

  if (selectedTicket) {
    return (
      <div>
        <button
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to tickets
        </button>

        <div className="max-w-2xl space-y-4">
          <div className="border border-border bg-card p-4">
            <h3 className="font-display text-sm tracking-wider text-foreground mb-1">
              TICKET #{selectedTicket.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="font-body text-sm text-foreground mb-2">{selectedTicket.subject}</p>
            {selectedTicket.description && (
              <p className="font-body text-sm text-muted-foreground mb-3">{selectedTicket.description}</p>
            )}
            <p className="text-xs text-muted-foreground font-body">
              Created: {new Date(selectedTicket.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-display text-[10px] tracking-widest text-muted-foreground block mb-1">STATUS</label>
              <select
                value={selectedTicket.status}
                onChange={(e) => updateTicket(selectedTicket.id, { status: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm font-body text-foreground"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="font-display text-[10px] tracking-widest text-muted-foreground block mb-1">PRIORITY</label>
              <select
                value={selectedTicket.priority}
                onChange={(e) => updateTicket(selectedTicket.id, { priority: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm font-body text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-display text-[10px] tracking-widest text-muted-foreground block mb-1">INTERNAL NOTES</label>
            <Textarea
              value={notes || selectedTicket.internal_notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="bg-card"
              rows={4}
            />
            <button
              onClick={() => updateTicket(selectedTicket.id, { internal_notes: notes || selectedTicket.internal_notes })}
              disabled={saving}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 btn-press disabled:opacity-50"
            >
              {saving ? "SAVING..." : "SAVE NOTES"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." className="pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-sm font-body text-foreground">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-sm font-body text-foreground">
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="loading-bar w-24" /></div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["TICKET", "SUBJECT", "STATUS", "PRIORITY", "DATE", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-[10px] tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-display text-xs text-foreground">#{t.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm font-body text-foreground max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${
                      t.status === "open" ? "bg-amber-500/20 text-amber-400" :
                      t.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {t.status.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${
                      t.priority === "high" ? "bg-destructive/20 text-destructive" :
                      t.priority === "medium" ? "bg-amber-500/20 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-body text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedTicket(t); setNotes(t.internal_notes || ""); }}
                      className="text-primary text-xs font-display tracking-wider hover:underline"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm font-body">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
