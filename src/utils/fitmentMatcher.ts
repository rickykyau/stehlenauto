/**
 * Fitment matching utility — handles year ranges, make normalization,
 * partial matches, universal products, and unknown fitment states.
 */

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
  | { status: "universal" }
  | { status: "unknown" };

const MAKE_ALIASES: Record<string, string> = {
  chevy: "chevrolet",
  vw: "volkswagen",
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
};

const MAKE_EQUIVALENTS: [string, string][] = [
  ["dodge", "ram"],
  ["dodge", "dodge ram"],
  ["ram", "dodge ram"],
];

const SUB_MODEL_KEYWORDS = [
  "classic",
  "new body style",
  "new body",
  "old body",
  "fifth generation",
  "5th gen",
];

const QUALIFIER_PATTERNS = [/without\s+\w+/i, /with\s+\w+/i, /excluding\s+\w+/i, /not\s+fit\s+.+/i];

function normalizeMake(make: string): string {
  const lower = make.toLowerCase().trim();
  return MAKE_ALIASES[lower] || lower;
}

function makesMatch(a: string, b: string): boolean {
  const na = normalizeMake(a);
  const nb = normalizeMake(b);
  if (na === nb) return true;

  for (const [x, y] of MAKE_EQUIVALENTS) {
    if ((na === x && nb === y) || (na === y && nb === x)) return true;
  }

  if (na === "dodge ram" || nb === "dodge ram") {
    const other = na === "dodge ram" ? nb : na;
    if (other === "dodge" || other === "ram") return true;
  }

  return false;
}

function titleContainsMake(title: string, make: string): boolean {
  const lowerTitle = title.toLowerCase();
  const normalizedMake = normalizeMake(make);

  if (lowerTitle.includes(normalizedMake)) return true;
  if (make.toLowerCase() !== normalizedMake && lowerTitle.includes(make.toLowerCase())) return true;

  if (makesMatch(make, "dodge") && lowerTitle.includes("ram")) return true;
  if (makesMatch(make, "ram") && lowerTitle.includes("dodge")) return true;
  if (makesMatch(make, "chevrolet") && lowerTitle.includes("chevy")) return true;
  if (makesMatch(make, "volkswagen") && lowerTitle.includes("vw")) return true;

  return false;
}

function fallbackFromTitle(title: string, vehicle: VehicleSelection): FitmentResult {
  const titleLower = title.toLowerCase();
  const yearStr = String(vehicle.year);

  const yearRanges = titleLower.matchAll(/(\d{4})\s*[-–]\s*(\d{4})/g);
  for (const match of yearRanges) {
    const start = parseInt(match[1], 10);
    const end = parseInt(match[2], 10);

    if (vehicle.year >= start && vehicle.year <= end && titleContainsMake(titleLower, vehicle.make)) {
      return {
        status: "partial",
        matchedEntries: [],
        warnings: ["Fitment based on title match — please verify compatibility"],
      };
    }
  }

  const plusRanges = titleLower.matchAll(/(\d{4})\+/g);
  for (const match of plusRanges) {
    const start = parseInt(match[1], 10);

    if (vehicle.year >= start && titleContainsMake(titleLower, vehicle.make)) {
      return {
        status: "partial",
        matchedEntries: [],
        warnings: ["Fitment based on title match — please verify compatibility"],
      };
    }
  }

  if (titleLower.includes(yearStr)) {
    return { status: "unknown" };
  }

  return { status: "unknown" };
}

export function parseFitmentString(raw: string): FitmentEntry | null {
  const s = raw.trim();
  if (!s) return null;

  let yearStart = 0;
  let yearEnd = 0;
  let rest = s;

  const rangeMatch = s.match(/^(\d{4})\s*[-–]\s*(\d{4})\s*/);
  if (rangeMatch) {
    yearStart = parseInt(rangeMatch[1], 10);
    yearEnd = parseInt(rangeMatch[2], 10);
    rest = s.slice(rangeMatch[0].length);
  } else {
    const plusMatch = s.match(/^(\d{4})\+\s*/);
    if (plusMatch) {
      yearStart = parseInt(plusMatch[1], 10);
      yearEnd = 2099;
      rest = s.slice(plusMatch[0].length);
    } else {
      const singleMatch = s.match(/^(\d{4})\s+/);
      if (singleMatch) {
        yearStart = parseInt(singleMatch[1], 10);
        yearEnd = yearStart;
        rest = s.slice(singleMatch[0].length);
      } else {
        return null;
      }
    }
  }

  if (yearStart < 1950 || yearStart > 2100) return null;

  const dashSplit = rest.split(/\s*[—–]\s*/);
  const mainPart = dashSplit[0].trim();
  const qualifierPart = dashSplit.slice(1).join(" ").trim();
  const words = mainPart.split(/\s+/);
  if (words.length === 0) return null;

  let make = "";
  let modelStart = 1;
  const twoWordMakes = ["land rover", "dodge ram"];
  const firstTwo = words.slice(0, 2).join(" ").toLowerCase();

  if (words.length >= 2 && twoWordMakes.includes(firstTwo)) {
    make = words.slice(0, 2).join(" ");
    modelStart = 2;
  } else {
    make = words[0];
  }

  const modelWords = words.slice(modelStart);
  let model = "";
  let subModel = "";

  const lowerJoined = modelWords.join(" ").toLowerCase();
  for (const keyword of SUB_MODEL_KEYWORDS) {
    const index = lowerJoined.indexOf(keyword);
    if (index >= 0) {
      const beforeKeyword = modelWords.join(" ").slice(0, index).trim();
      subModel = keyword;
      model = beforeKeyword || modelWords.join(" ");
      break;
    }
  }

  if (!model && modelWords.length > 0) {
    model = modelWords.join(" ");
  }

  let bedLength: string | undefined;
  const bedMatch = (qualifierPart || model).match(/(\d+\.?\d*)\s*ft/i);
  if (bedMatch) {
    bedLength = `${bedMatch[1]} ft`;
  }

  let qualifier = qualifierPart || undefined;
  if (!qualifier) {
    for (const pattern of QUALIFIER_PATTERNS) {
      const qualifierMatch = rest.match(pattern);
      if (qualifierMatch) {
        qualifier = qualifierMatch[0];
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

function modelsMatch(selectionModel: string, entryModel: string): boolean {
  if (!selectionModel || !entryModel) return true;

  const selected = selectionModel.toLowerCase().replace(/[-\s]/g, "");
  const entry = entryModel.toLowerCase().replace(/[-\s]/g, "");

  if (selected === entry) return true;
  if (entry.includes(selected) || selected.includes(entry)) return true;

  return false;
}

function normalizeVehicleSelection(vehicle: VehicleSelection): VehicleSelection {
  const make = vehicle.make.toLowerCase().trim();
  const model = vehicle.model.toLowerCase().trim();

  if (make === "dodge" && model === "ram") {
    return { year: vehicle.year, make: "Dodge Ram", model: "" };
  }

  if (make === "ram") {
    return { year: vehicle.year, make: "Dodge Ram", model: vehicle.model };
  }

  return vehicle;
}

export function checkProductFitment(tags: string[], title: string, vehicle: VehicleSelection): FitmentResult {
  const normalizedVehicle = normalizeVehicleSelection(vehicle);
  if (tags.some((tag) => tag.toLowerCase() === "universal fit")) {
    return { status: "universal" };
  }

  const entries: FitmentEntry[] = [];

  for (const tag of tags) {
    const entry = parseFitmentString(tag);
    if (entry) entries.push(entry);
  }

  const titleEntry = parseFitmentString(title);
  if (titleEntry) {
    const isDuplicate = entries.some(
      (entry) =>
        entry.yearStart === titleEntry.yearStart &&
        entry.yearEnd === titleEntry.yearEnd &&
        entry.make === titleEntry.make &&
        entry.model === titleEntry.model,
    );

    if (!isDuplicate) entries.push(titleEntry);
  }

  if (entries.length === 0) {
    return fallbackFromTitle(title, normalizedVehicle);
  }

  const makeMatches = entries.filter((entry) => makesMatch(entry.make, normalizedVehicle.make));
  if (makeMatches.length === 0) {
    const altMakeMatches = entries.filter((entry) => {
      const combined = `${entry.make} ${entry.model}`.toLowerCase();
      return combined.includes(normalizedVehicle.make.toLowerCase()) || makesMatch(entry.make, normalizedVehicle.make);
    });

    if (altMakeMatches.length === 0) return { status: "does_not_fit" };
    return checkEntriesAgainstVehicle(altMakeMatches, normalizedVehicle);
  }

  return checkEntriesAgainstVehicle(makeMatches, normalizedVehicle);
}

function checkEntriesAgainstVehicle(entries: FitmentEntry[], vehicle: VehicleSelection): FitmentResult {
  const modelMatches = entries.filter((entry) => modelsMatch(vehicle.model, entry.model));
  if (modelMatches.length === 0) {
    return { status: "does_not_fit" };
  }

  const yearMatches = modelMatches.filter((entry) => vehicle.year >= entry.yearStart && vehicle.year <= entry.yearEnd);
  if (yearMatches.length === 0) {
    return { status: "does_not_fit" };
  }

  const withQualifiers = yearMatches.filter((entry) => entry.subModel || entry.qualifier);
  const withoutQualifiers = yearMatches.filter((entry) => !entry.subModel && !entry.qualifier);

  if (withoutQualifiers.length > 0) {
    return { status: "fits", matchedEntries: yearMatches };
  }

  if (withQualifiers.length > 0) {
    const warnings = withQualifiers.map((entry) => {
      const parts: string[] = [];
      if (entry.subModel) parts.push(`Fits ${entry.make} ${entry.model} ${entry.subModel} only`);
      if (entry.qualifier) parts.push(entry.qualifier);
      return parts.join(". ") || `Check fitment details for ${entry.raw}`;
    });

    return { status: "partial", matchedEntries: withQualifiers, warnings };
  }

  return { status: "unknown" };
}

export function productFitsVehicle(tags: string[], title: string, vehicle: VehicleSelection): FitmentResult {
  return checkProductFitment(tags, title, vehicle);
}
