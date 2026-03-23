/**
 * Fitment matching utility — handles year ranges, make normalization,
 * partial matches, and universal products.
 */

// ── Types ──

export interface VehicleSelection {
  year: number;
  make: string;
  model: string;
}

export interface FitmentEntry {
  raw: string;
  yearStart: number;
  yearEnd: number;
  make: string;
  model: string;
  subModel?: string;
  qualifier?: string;
  bedLength?: string;
}

export type FitmentResult =
  | { status: "fits"; matchedEntries: FitmentEntry[] }
  | { status: "partial"; matchedEntries: FitmentEntry[]; warnings: string[] }
  | { status: "does_not_fit" }
  | { status: "universal" };

// ── Make Normalization ──

const MAKE_ALIASES: Record<string, string> = {
  "chevy": "chevrolet",
  "vw": "volkswagen",
  "mercedes-benz": "mercedes",
  "mercedes benz": "mercedes",
};

// "Dodge Ram" → treat "Ram" as an alias of "Dodge" for make matching
const MAKE_EQUIVALENTS: [string, string][] = [
  ["dodge", "ram"],
];

function normalizeMake(make: string): string {
  const lower = make.toLowerCase().trim();
  return MAKE_ALIASES[lower] || lower;
}

function makesMatch(a: string, b: string): boolean {
  const na = normalizeMake(a);
  const nb = normalizeMake(b);
  if (na === nb) return true;
  // Check equivalents
  for (const [x, y] of MAKE_EQUIVALENTS) {
    if ((na === x && nb === y) || (na === y && nb === x)) return true;
  }
  return false;
}

// ── Sub-model / qualifier patterns ──

const SUB_MODEL_KEYWORDS = [
  "classic",
  "new body style",
  "new body",
  "old body",
  "fifth generation",
  "5th gen",
];

const QUALIFIER_PATTERNS = [
  /without\s+\w+/i,
  /with\s+\w+/i,
  /excluding\s+\w+/i,
  /not\s+fit\s+.+/i,
];

// ── Tag / Title Parsing ──

/**
 * Parse a single fitment string (tag or title line) into a FitmentEntry.
 * Handles: "2019-2022 Ram 1500 Classic", "2020+ Ford F-150", "2010 Dodge Ram 2500"
 */
export function parseFitmentString(raw: string): FitmentEntry | null {
  const s = raw.trim();
  if (!s) return null;

  let yearStart = 0;
  let yearEnd = 0;
  let rest = s;

  // Year range: YYYY-YYYY or YYYY–YYYY
  const rangeMatch = s.match(/^(\d{4})\s*[-–]\s*(\d{4})\s*/);
  if (rangeMatch) {
    yearStart = parseInt(rangeMatch[1]);
    yearEnd = parseInt(rangeMatch[2]);
    rest = s.slice(rangeMatch[0].length);
  } else {
    // Year+: YYYY+
    const plusMatch = s.match(/^(\d{4})\+\s*/);
    if (plusMatch) {
      yearStart = parseInt(plusMatch[1]);
      yearEnd = 2099;
      rest = s.slice(plusMatch[0].length);
    } else {
      // Single year: YYYY
      const singleMatch = s.match(/^(\d{4})\s+/);
      if (singleMatch) {
        yearStart = parseInt(singleMatch[1]);
        yearEnd = yearStart;
        rest = s.slice(singleMatch[0].length);
      } else {
        return null; // No year found
      }
    }
  }

  if (yearStart < 1950 || yearStart > 2100) return null;

  // Extract make and model from the remaining text
  // Common pattern: "Make Model SubModel — qualifier"
  const dashSplit = rest.split(/\s*[—–]\s*/);
  const mainPart = dashSplit[0].trim();
  const qualifierPart = dashSplit.slice(1).join(" ").trim();

  // Split into words
  const words = mainPart.split(/\s+/);
  if (words.length === 0) return null;

  // First word (or first two words) is the make
  let make = "";
  let modelStart = 1;

  // Handle two-word makes
  const twoWordMakes = ["land rover", "dodge ram"];
  const firstTwo = words.slice(0, 2).join(" ").toLowerCase();
  if (words.length >= 2 && twoWordMakes.includes(firstTwo)) {
    make = words.slice(0, 2).join(" ");
    modelStart = 2;
  } else {
    make = words[0];
    modelStart = 1;
  }

  // Remaining words are model + sub-model
  const modelWords = words.slice(modelStart);
  let model = "";
  let subModel = "";

  // Check for sub-model keywords
  const lowerJoined = modelWords.join(" ").toLowerCase();
  for (const kw of SUB_MODEL_KEYWORDS) {
    const idx = lowerJoined.indexOf(kw);
    if (idx >= 0) {
      // Everything before the keyword is model, the keyword is sub-model
      const beforeKw = modelWords.join(" ").slice(0, idx).trim();
      subModel = kw;
      model = beforeKw || modelWords.join(" ");
      break;
    }
  }

  if (!model && modelWords.length > 0) {
    model = modelWords.join(" ");
  }

  // Extract bed length from qualifier or model
  let bedLength: string | undefined;
  const bedMatch = (qualifierPart || model).match(/(\d+\.?\d*)\s*ft/i);
  if (bedMatch) {
    bedLength = `${bedMatch[1]} ft`;
  }

  // Qualifier patterns
  let qualifier = qualifierPart || undefined;
  if (!qualifier) {
    for (const pat of QUALIFIER_PATTERNS) {
      const qm = rest.match(pat);
      if (qm) {
        qualifier = qm[0];
        break;
      }
    }
  }

  return {
    raw: s,
    yearStart,
    yearEnd,
    make: make.trim(),
    model: model.trim(),
    subModel: subModel || undefined,
    qualifier,
    bedLength,
  };
}

// ── Model Matching ──

function modelsMatch(selectionModel: string, entryModel: string): boolean {
  if (!selectionModel || !entryModel) return true; // No model filter = any model matches

  const sel = selectionModel.toLowerCase().replace(/[-\s]/g, "");
  const ent = entryModel.toLowerCase().replace(/[-\s]/g, "");

  // Exact match after normalization
  if (sel === ent) return true;

  // Partial: "1500" matches "ram 1500" or "1500 classic"
  if (ent.includes(sel) || sel.includes(ent)) return true;

  return false;
}

// ── Main Matching Function ──

/**
 * Check if a product fits the selected vehicle.
 * 
 * @param tags - Product tags array
 * @param title - Product title
 * @param vehicle - Selected vehicle { year, make, model }
 * @returns FitmentResult
 */
export function checkProductFitment(
  tags: string[],
  title: string,
  vehicle: VehicleSelection
): FitmentResult {
  // Check universal
  if (tags.some((t) => t.toLowerCase() === "universal fit")) {
    return { status: "universal" };
  }

  // Parse fitment entries from tags and title
  const entries: FitmentEntry[] = [];

  // Parse from tags first
  for (const tag of tags) {
    const entry = parseFitmentString(tag);
    if (entry) entries.push(entry);
  }

  // Also parse from title as fallback
  const titleEntry = parseFitmentString(title);
  if (titleEntry) {
    // Only add if we don't already have a matching entry
    const isDupe = entries.some(
      (e) => e.yearStart === titleEntry.yearStart && e.yearEnd === titleEntry.yearEnd && e.make === titleEntry.make
    );
    if (!isDupe) entries.push(titleEntry);
  }

  if (entries.length === 0) {
    // No parseable fitment data — can't determine fit
    return { status: "does_not_fit" };
  }

  // Find entries that match make
  const makeMatches = entries.filter((e) => makesMatch(e.make, vehicle.make));
  if (makeMatches.length === 0) {
    // Also check if "Dodge Ram" in tags matches vehicle make "Ram" or "Dodge"
    // by checking combined make+model in entry against vehicle make
    const altMakeMatches = entries.filter((e) => {
      const combined = `${e.make} ${e.model}`.toLowerCase();
      return combined.includes(vehicle.make.toLowerCase()) ||
        makesMatch(e.make, vehicle.make);
    });
    if (altMakeMatches.length === 0) return { status: "does_not_fit" };
    return checkEntriesAgainstVehicle(altMakeMatches, vehicle);
  }

  return checkEntriesAgainstVehicle(makeMatches, vehicle);
}

function checkEntriesAgainstVehicle(
  makeMatches: FitmentEntry[],
  vehicle: VehicleSelection
): FitmentResult {
  // Find entries that match model
  const modelMatches = makeMatches.filter((e) => modelsMatch(vehicle.model, e.model));

  if (modelMatches.length === 0) {
    // Make matches but model doesn't
    return { status: "does_not_fit" };
  }

  // Find entries where year is in range
  const yearMatches = modelMatches.filter(
    (e) => vehicle.year >= e.yearStart && vehicle.year <= e.yearEnd
  );

  if (yearMatches.length === 0) {
    return { status: "does_not_fit" };
  }

  // Check for sub-model qualifiers that indicate partial match
  const withQualifiers = yearMatches.filter((e) => e.subModel || e.qualifier);
  const withoutQualifiers = yearMatches.filter((e) => !e.subModel && !e.qualifier);

  if (withoutQualifiers.length > 0) {
    // At least one clean match with no qualifiers
    return { status: "fits", matchedEntries: yearMatches };
  }

  if (withQualifiers.length > 0) {
    // All matches have qualifiers — partial match
    const warnings = withQualifiers.map((e) => {
      const parts: string[] = [];
      if (e.subModel) {
        parts.push(`Fits ${e.make} ${e.model} ${e.subModel} only`);
      }
      if (e.qualifier) {
        parts.push(e.qualifier);
      }
      return parts.join(". ") || `Check fitment details for ${e.raw}`;
    });
    return { status: "partial", matchedEntries: withQualifiers, warnings };
  }

  return { status: "fits", matchedEntries: yearMatches };
}

/**
 * Quick boolean check — does product fit or partially fit?
 * Used for filtering on browse pages.
 */
export function productFitsVehicle(
  tags: string[],
  title: string,
  vehicle: VehicleSelection
): FitmentResult {
  return checkProductFitment(tags, title, vehicle);
}
