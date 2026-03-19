import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || cancelled) {
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!cancelled) {
        if (data && !error) {
          setIsAdmin(true);
          setAdminRole(data.role);
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
        setLoading(false);
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, adminRole, loading };
}
