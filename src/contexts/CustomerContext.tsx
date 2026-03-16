import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  getStoredToken,
  clearStoredToken,
  fetchCustomer,
  type ShopifyCustomer,
} from "@/lib/shopify-customer";

interface CustomerContextValue {
  customer: ShopifyCustomer | null;
  token: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

const CustomerContext = createContext<CustomerContextValue>({
  customer: null,
  token: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
  setToken: () => {},
});

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = useCallback(async (t: string) => {
    setLoading(true);
    const c = await fetchCustomer(t);
    if (c) {
      setCustomer(c);
      setTokenState(t);
    } else {
      clearStoredToken();
      setCustomer(null);
      setTokenState(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      loadCustomer(t);
    } else {
      setLoading(false);
    }
  }, [loadCustomer]);

  const refresh = useCallback(async () => {
    const t = getStoredToken();
    if (t) await loadCustomer(t);
  }, [loadCustomer]);

  const logout = useCallback(() => {
    clearStoredToken();
    setCustomer(null);
    setTokenState(null);
  }, []);

  const setToken = useCallback((t: string) => {
    loadCustomer(t);
  }, [loadCustomer]);

  return (
    <CustomerContext.Provider value={{ customer, token, loading, refresh, logout, setToken }}>
      {children}
    </CustomerContext.Provider>
  );
};
