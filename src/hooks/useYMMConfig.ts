import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Hardcoded Fallback Defaults ────────────────────────

const DEFAULT_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chevy", "Chrysler",
  "Dodge", "Ford", "GMC", "Honda", "Hummer", "Hyundai", "Infiniti", "Isuzu",
  "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes", "Mercury",
  "Mini", "Mitsubishi", "Nissan", "Pontiac", "Ram", "Scion", "Subaru", "Suzuki",
  "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const DEFAULT_MODELS: Record<string, string[]> = {
  "Acura": ["Accord", "MDX"],
  "Audi": ["A3", "A4", "A5", "A6", "Q7"],
  "BMW": ["X3", "X5"],
  "Buick": ["Enclave", "Envision", "Regal"],
  "Cadillac": ["Escalade", "XT5"],
  "Chevrolet": ["Avalanche", "Blazer", "Colorado", "Equinox", "Express", "Impala", "S10", "Silverado", "Silverado 1500", "Silverado 2500", "Suburban", "Tahoe", "Traverse"],
  "Chevy": ["Avalanche", "Blazer", "Impala", "S10", "Silverado", "Suburban", "Tahoe", "Traverse"],
  "Chrysler": ["Town & Country"],
  "Dodge": ["Charger", "Dakota", "Durango", "Journey", "Nitro", "Ram", "1500", "2500", "3500"],
  "Ford": ["Edge", "Escape", "Excursion", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Mustang", "Ranger", "Super Duty"],
  "GMC": ["Envoy", "Savana", "Sierra", "Sierra 1500", "Sierra 2500", "Suburban", "Tahoe", "Yukon"],
  "Honda": ["Accord", "CR-V", "Civic", "Element", "Odyssey", "Pilot", "Ridgeline"],
  "Hummer": ["H3"],
  "Hyundai": ["Santa Fe", "Sonata", "Sorento", "Tucson"],
  "Infiniti": ["QX60"],
  "Isuzu": ["S10"],
  "Jeep": ["Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Liberty", "Patriot", "Wrangler"],
  "Kia": ["Sorento", "Telluride"],
  "Land Rover": ["Discovery", "Range Rover"],
  "Lexus": ["NX", "RX"],
  "Lincoln": ["MKX"],
  "Mazda": ["CX-5", "MX-5"],
  "Mercedes": [],
  "Mercury": ["Escape"],
  "Mini": ["Cooper"],
  "Mitsubishi": ["Outlander"],
  "Nissan": ["Altima", "Frontier", "Murano", "Pathfinder", "Titan", "Xterra"],
  "Pontiac": ["G6", "Grand Prix"],
  "Ram": ["1500", "2500", "3500"],
  "Scion": ["xB"],
  "Subaru": ["Crosstrek", "Impreza", "Outback", "WRX"],
  "Suzuki": [],
  "Tesla": ["Model 3", "Model X", "Model Y"],
  "Toyota": ["4Runner", "Camry", "FJ Cruiser", "Highlander", "Sienna", "Tacoma", "Tundra"],
  "Volkswagen": ["Golf", "Jetta", "Passat", "Tiguan"],
  "Volvo": ["XC90"],
};

const DEFAULT_YEARS = Array.from({ length: 47 }, (_, i) => (2026 - i).toString());

const DEFAULT_MAKE_COLLECTION_MAP: Record<string, string> = {
  "Acura": "acura-parts",
  "Audi": "audi-parts",
  "Buick": "buick-parts",
  "Chevrolet": "chevy-parts",
  "Chevy": "chevy-parts",
  "Chrysler": "chrysler-parts",
  "Dodge": "dodge-parts",
  "Ford": "ford-parts",
  "GMC": "gmc-parts",
  "Honda": "honda-parts",
  "Hyundai": "hyundai-parts",
  "Infiniti": "infiniti-parts",
  "Jeep": "jeep-parts",
  "Kia": "kia-parts",
  "Lexus": "lexus-parts",
  "Lincoln": "lincoln-parts",
  "Mazda": "mazda-parts",
  "Mercedes": "mercedes-benz-parts",
  "Mercury": "mercury-parts",
  "Nissan": "nissan-parts",
  "Pontiac": "pontiac-parts",
  "Ram": "dodge-parts",
  "Subaru": "subaru-parts",
  "Toyota": "toyota-parts",
  "Volkswagen": "volkswagen-parts",
};

export interface YMMConfig {
  makes: string[];
  models: Record<string, string[]>;
  years: string[];
  makeCollectionMap: Record<string, string>;
  isLoading: boolean;
}

// In-memory cache so we only fetch once per session
let cachedConfig: Omit<YMMConfig, "isLoading"> | null = null;
let fetchPromise: Promise<Omit<YMMConfig, "isLoading">> | null = null;

async function fetchYMMConfig(): Promise<Omit<YMMConfig, "isLoading">> {
  if (cachedConfig) return cachedConfig;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("ymm_config" as any)
        .select("makes, models, years, make_collection_map")
        .eq("id", 1)
        .maybeSingle();

      if (error || !data) throw new Error("No data");

      const row = data as any;
      const makes = Array.isArray(row.makes) && row.makes.length > 0 ? row.makes : DEFAULT_MAKES;
      const models = row.models && typeof row.models === "object" && Object.keys(row.models).length > 0 ? row.models : DEFAULT_MODELS;
      const years = Array.isArray(row.years) && row.years.length > 0 ? row.years : DEFAULT_YEARS;
      const makeCollectionMap = row.make_collection_map && typeof row.make_collection_map === "object" && Object.keys(row.make_collection_map).length > 0 ? row.make_collection_map : DEFAULT_MAKE_COLLECTION_MAP;

      cachedConfig = { makes, models, years, makeCollectionMap };
      return cachedConfig;
    } catch {
      cachedConfig = {
        makes: DEFAULT_MAKES,
        models: DEFAULT_MODELS,
        years: DEFAULT_YEARS,
        makeCollectionMap: DEFAULT_MAKE_COLLECTION_MAP,
      };
      return cachedConfig;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function useYMMConfig(): YMMConfig {
  const [config, setConfig] = useState<Omit<YMMConfig, "isLoading"> | null>(cachedConfig);
  const [isLoading, setIsLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setIsLoading(false);
      return;
    }
    fetchYMMConfig().then((c) => {
      setConfig(c);
      setIsLoading(false);
    });
  }, []);

  return {
    makes: config?.makes ?? DEFAULT_MAKES,
    models: config?.models ?? DEFAULT_MODELS,
    years: config?.years ?? DEFAULT_YEARS,
    makeCollectionMap: config?.makeCollectionMap ?? DEFAULT_MAKE_COLLECTION_MAP,
    isLoading,
  };
}

// Re-export defaults for backward compatibility
export { DEFAULT_MAKES, DEFAULT_MODELS, DEFAULT_YEARS, DEFAULT_MAKE_COLLECTION_MAP };
