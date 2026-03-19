import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Car, Mail, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

interface UserDetail {
  profile: UserRow;
  email: string;
  authMethod: string;
  vehicles: any[];
  addresses: any[];
  activity: any[];
  lastActive: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [allRes, weekRes, monthRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
    ]);

    setUsers(allRes.data ?? []);
    setTotalCount(allRes.count ?? 0);
    setNewThisWeek(weekRes.count ?? 0);
    setNewThisMonth(monthRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const loadUserDetail = async (profile: UserRow) => {
    if (expandedUser === profile.user_id) {
      setExpandedUser(null);
      setUserDetail(null);
      return;
    }
    setExpandedUser(profile.user_id);
    setDetailLoading(true);

    const [vehiclesRes, addressesRes, activityRes, lastActiveRes] = await Promise.all([
      supabase.from("user_vehicles").select("*").eq("user_id", profile.user_id),
      supabase.from("addresses").select("*").eq("user_id", profile.user_id),
      supabase.from("user_activity_log").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_activity_log").select("created_at").eq("user_id", profile.user_id).order("created_at", { ascending: false }).limit(1),
    ]);

    setUserDetail({
      profile,
      email: "—",
      authMethod: "email",
      vehicles: vehiclesRes.data ?? [],
      addresses: addressesRes.data ?? [],
      activity: activityRes.data ?? [],
      lastActive: lastActiveRes.data?.[0]?.created_at ?? null,
    });
    setDetailLoading(false);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase();
    return name.includes(s) || u.user_id.includes(s);
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: totalCount },
          { label: "New This Week", value: newThisWeek },
          { label: "New This Month", value: newThisMonth },
        ].map((s) => (
          <div key={s.label} className="border border-border bg-card p-4">
            <p className="font-display text-[9px] tracking-widest text-muted-foreground uppercase">{s.label}</p>
            <p className="font-display text-2xl text-foreground mt-1">{loading ? "–" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      {/* Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">NAME</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">PHONE</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground">SIGNUP DATE</th>
              <th className="px-4 py-2.5 font-display text-[9px] tracking-widest text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <>
                <tr
                  key={u.user_id}
                  onClick={() => loadUserDetail(u)}
                  className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer"
                >
                  <td className="px-4 py-3 font-body text-foreground">
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-body text-muted-foreground">{u.phone || "—"}</td>
                  <td className="px-4 py-3 font-body text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {expandedUser === u.user_id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </td>
                </tr>
                {expandedUser === u.user_id && (
                  <tr key={`${u.user_id}-detail`}>
                    <td colSpan={4} className="bg-accent/20 px-6 py-5">
                      {detailLoading ? (
                        <div className="loading-bar w-24 mx-auto" />
                      ) : userDetail ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Vehicles */}
                          <div>
                            <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">SAVED VEHICLES</h4>
                            {userDetail.vehicles.length === 0 ? (
                              <p className="font-body text-xs text-muted-foreground">None</p>
                            ) : (
                              <div className="space-y-1">
                                {userDetail.vehicles.map((v: any) => (
                                  <div key={v.id} className="flex items-center gap-2">
                                    <Car className="w-3.5 h-3.5 text-primary" />
                                    <span className="font-body text-sm text-foreground">{v.year} {v.make} {v.model}</span>
                                    {v.is_primary && <span className="text-[9px] font-display tracking-wider text-primary">PRIMARY</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Addresses */}
                          <div>
                            <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">ADDRESSES</h4>
                            {userDetail.addresses.length === 0 ? (
                              <p className="font-body text-xs text-muted-foreground">None</p>
                            ) : (
                              <div className="space-y-2">
                                {userDetail.addresses.map((a: any) => (
                                  <div key={a.id} className="font-body text-xs text-muted-foreground">
                                    <p className="text-foreground text-sm">{a.full_name}</p>
                                    <p>{a.address_line_1}, {a.city}, {a.state} {a.zip_code}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Activity */}
                          <div className="md:col-span-2">
                            <h4 className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">
                              RECENT ACTIVITY ({userDetail.activity.length})
                              {userDetail.lastActive && (
                                <span className="ml-2 text-primary">
                                  Last: {new Date(userDetail.lastActive).toLocaleString()}
                                </span>
                              )}
                            </h4>
                            {userDetail.activity.length === 0 ? (
                              <p className="font-body text-xs text-muted-foreground">No activity recorded</p>
                            ) : (
                              <div className="max-h-48 overflow-y-auto border border-border">
                                <table className="w-full text-xs">
                                  <tbody>
                                    {userDetail.activity.map((a: any) => (
                                      <tr key={a.id} className="border-b border-border last:border-0">
                                        <td className="px-3 py-1.5">
                                          <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary font-display text-[8px] tracking-wider">
                                            {a.event_type}
                                          </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-muted-foreground truncate max-w-[200px]">
                                          {a.page_url || "—"}
                                        </td>
                                        <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                                          {new Date(a.created_at).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
