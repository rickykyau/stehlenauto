import { useMemo } from "react";
import type { ShopifyProduct } from "@/lib/shopify";
import type { RefineFilters } from "@/components/RefineSidebar";

/** Category handles → keywords for matching product_type */
const CATEGORY_KEYWORDS: Record<string, string> = {
  "bull-guards-grille-guards": "bull guard",
  "tonneau-covers": "tonneau cover",
  "trailer-hitches": "trailer hitch",
  "front-grilles": "grille",
  headlights: "headlight",
  "truck-bed-mats": "truck bed mat",
  "floor-mats": "floor mat",
  "running-boards-side-steps": "running board",
  "roof-racks-baskets": "roof rack",
  "chase-racks-sport-bars": "chase rack",
  "molle-panels": "molle panel",
  "under-seat-storage": "under seat storage",
};

const CATEGORIES = [
  { handle: "bull-guards-grille-guards", label: "Bull Guards & Grille Guards" },
  { handle: "tonneau-covers", label: "Tonneau Covers" },
  { handle: "trailer-hitches", label: "Trailer Hitches" },
  { handle: "front-grilles", label: "Front Grilles" },
  { handle: "headlights", label: "Headlights" },
  { handle: "truck-bed-mats", label: "Truck Bed Mats" },
  { handle: "floor-mats", label: "Floor Mats" },
  { handle: "running-boards-side-steps", label: "Running Boards & Side Steps" },
  { handle: "roof-racks-baskets", label: "Roof Racks & Baskets" },
  { handle: "chase-racks-sport-bars", label: "Chase Racks & Sport Bars" },
  { handle: "molle-panels", label: "MOLLE Panels" },
  { handle: "under-seat-storage", label: "Under Seat Storage" },
];

const MAKES = [
  "Chevy", "Chrysler", "Dodge", "Ford", "GMC", "Honda",
  "Jeep", "Nissan", "Ram", "Toyota", "Universal", "Volkswagen",
];

const MODELS_BY_MAKE: Record<string, string[]> = {
  Ford: ["Bronco", "Edge", "Escape", "Excursion", "Expedition", "Explorer", "F-150", "F-250", "F-350", "F-450", "Flex", "Focus", "Maverick", "Mustang", "Ranger", "Super Duty"],
  Chevy: ["Avalanche", "Blazer", "Colorado", "Equinox", "Express", "Malibu", "S-10", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Suburban", "Tahoe", "Trailblazer", "Traverse"],
  Dodge: ["Charger", "Challenger", "Dakota", "Durango", "Grand Caravan", "Journey", "Nitro"],
  GMC: ["Acadia", "Canyon", "Envoy", "Jimmy", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Terrain", "Yukon"],
  Toyota: ["4Runner", "Camry", "Corolla", "FJ Cruiser", "Highlander", "Land Cruiser", "RAV4", "Sequoia", "Tacoma", "Tundra"],
  Nissan: ["Armada", "Frontier", "Murano", "Pathfinder", "Rogue", "Titan", "Xterra"],
  Jeep: ["Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Liberty", "Patriot", "Renegade", "Wrangler"],
  Ram: ["1500", "2500", "3500"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  Chrysler: ["200", "300", "Pacifica", "Town & Country", "Voyager"],
  Volkswagen: ["Atlas", "Golf", "Jetta", "Passat", "Tiguan", "Touareg"],
  Universal: ["Universal"],
};

function parseYearRange(title: string): [number, number] | null {
  const rangeMatch = title.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  const plusMatch = title.match(/(\d{4})\+/);
  if (plusMatch) return [parseInt(plusMatch[1]), new Date().getFullYear()];
  const singleMatch = title.match(/^(\d{4})\s/);
  if (singleMatch) return [parseInt(singleMatch[1]), parseInt(singleMatch[1])];
  return null;
}

function matchesYear(title: string, year: string): boolean {
  const y = parseInt(year);
  const range = parseYearRange(title);
  if (!range) return false;
  return y >= range[0] && y <= range[1];
}

function matchesMake(title: string, make: string): boolean {
  return title.toLowerCase().includes(make.toLowerCase());
}

function matchesModel(title: string, model: string): boolean {
  return title.toLowerCase().includes(model.toLowerCase());
}

function matchesCategory(productType: string, handle: string): boolean {
  const keyword = CATEGORY_KEYWORDS[handle];
  if (!keyword) return false;
  return productType.toLowerCase().includes(keyword.toLowerCase());
}

/** Check if a product passes all specified filters */
function productMatchesFilters(
  product: ShopifyProduct,
  filters: Partial<RefineFilters>
): boolean {
  const title = product.node.title;
  const productType = product.node.productType || "";

  if (filters.year && !matchesYear(title, filters.year)) return false;
  if (filters.make && !matchesMake(title, filters.make)) return false;
  if (filters.model && !matchesModel(title, filters.model)) return false;
  if (filters.category && !matchesCategory(productType, filters.category)) return false;
  return true;
}

export interface AvailableOptions {
  years: Map<string, number>; // year → count
  makes: Map<string, number>;
  models: Map<string, number>;
  categories: Map<string, number>; // handle → count
}

/**
 * Compute available filter options from the loaded product set.
 * For each dimension, we filter products by ALL OTHER active filters
 * to determine which values in that dimension would yield results.
 */
export function useAvailableFilterOptions(
  products: ShopifyProduct[],
  filters: RefineFilters
): AvailableOptions {
  return useMemo(() => {
    // Filters excluding each dimension
    const filtersExceptYear = { make: filters.make, model: filters.model, category: filters.category };
    const filtersExceptMake = { year: filters.year, category: filters.category };
    const filtersExceptModel = { year: filters.year, make: filters.make, category: filters.category };
    const filtersExceptCategory = { year: filters.year, make: filters.make, model: filters.model };

    const years = new Map<string, number>();
    const makes = new Map<string, number>();
    const models = new Map<string, number>();
    const categories = new Map<string, number>();

    // Pre-filter products for each dimension
    const productsForYears = products.filter((p) => productMatchesFilters(p, filtersExceptYear));
    const productsForMakes = products.filter((p) => productMatchesFilters(p, filtersExceptMake));
    const productsForModels = products.filter((p) => productMatchesFilters(p, filtersExceptModel));
    const productsForCategories = products.filter((p) => productMatchesFilters(p, filtersExceptCategory));

    // Compute available years (scan all years 1980-2025)
    for (let y = 2025; y >= 1980; y--) {
      const yearStr = y.toString();
      const count = productsForYears.filter((p) => matchesYear(p.node.title, yearStr)).length;
      if (count > 0) years.set(yearStr, count);
    }

    // Compute available makes
    for (const make of MAKES) {
      const count = productsForMakes.filter((p) => matchesMake(p.node.title, make)).length;
      if (count > 0) makes.set(make, count);
    }

    // Compute available models
    const modelsToCheck = filters.make ? (MODELS_BY_MAKE[filters.make] || []) : Object.values(MODELS_BY_MAKE).flat();
    for (const model of modelsToCheck) {
      const count = productsForModels.filter((p) => matchesModel(p.node.title, model)).length;
      if (count > 0) models.set(model, count);
    }

    // Compute available categories
    for (const cat of CATEGORIES) {
      const count = productsForCategories.filter((p) => {
        const pt = p.node.productType || "";
        return matchesCategory(pt, cat.handle);
      }).length;
      if (count > 0) categories.set(cat.handle, count);
    }

    return { years, makes, models, categories };
  }, [products, filters]);
}

export { CATEGORIES, MAKES, MODELS_BY_MAKE };
