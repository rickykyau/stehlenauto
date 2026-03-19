import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, MessageCircle, Clock, AlertTriangle, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: string;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  total_tokens: number;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  action_type: string | null;
  products_referenced: any;
  created_at: string;
}

export default function AdminChatLogsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Stats
  const todayCount = conversations.filter(c =>
    new Date(c.created_at).toDateString() === new Date().toDateString()
  ).length;
  const avgMessages = conversations.length
    ? Math.round(conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length)
    : 0;
  const escalatedCount = conversations.filter(c => c.status === "escalated").length;
  const escalationRate = conversations.length ? ((escalatedCount / conversations.length) * 100).toFixed(1) : "0";

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setConversations((data as Conversation[]) || []);
    setLoading(false);
  };

  const viewConversation = async (id: string) => {
    setSelectedConv(id);
    setMessagesLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setMessagesLoading(false);
  };

  const filtered = conversations.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.id.includes(search) && !c.user_id?.includes(search)) return false;
    return true;
  });

  if (selectedConv) {
    const conv = conversations.find(c => c.id === selectedConv);
    return (
      <div>
        <button
          onClick={() => setSelectedConv(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to conversations
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-sm tracking-wider text-foreground">CONVERSATION</h3>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {conv ? new Date(conv.created_at).toLocaleString() : ""} · {conv?.message_count} messages · Status: {conv?.status}
            </p>
          </div>
        </div>
        {messagesLoading ? (
          <div className="flex justify-center py-8"><div className="loading-bar w-24" /></div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 text-sm font-body ${
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  <p className="text-[10px] text-muted-foreground mb-1 font-display tracking-wider">
                    {msg.role.toUpperCase()} · {new Date(msg.created_at).toLocaleTimeString()}
                    {msg.action_type && ` · ACTION: ${msg.action_type}`}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.products_referenced && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Products referenced: {Array.isArray(msg.products_referenced) ? msg.products_referenced.length : 0}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TODAY", value: todayCount, icon: MessageCircle },
          { label: "AVG MESSAGES", value: avgMessages, icon: Clock },
          { label: "ESCALATIONS", value: escalatedCount, icon: AlertTriangle },
          { label: "ESCALATION RATE", value: `${escalationRate}%`, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="font-display text-[10px] tracking-widest text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or user..."
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-sm font-body text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="loading-bar w-24" /></div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["DATE", "MESSAGES", "TOKENS", "STATUS", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-[10px] tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(conv => (
                <tr key={conv.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-body text-foreground">
                    {new Date(conv.created_at).toLocaleDateString()} {new Date(conv.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-sm font-body text-foreground">{conv.message_count}</td>
                  <td className="px-4 py-3 text-sm font-body text-muted-foreground">{conv.total_tokens}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-display tracking-wider ${
                      conv.status === "escalated" ? "bg-destructive/20 text-destructive" :
                      conv.status === "active" ? "bg-green-500/20 text-green-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {conv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => viewConversation(conv.id)}
                      className="text-primary text-xs font-display tracking-wider hover:underline"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm font-body">
                    No conversations found
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
