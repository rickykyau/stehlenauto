/**
 * Keyword-based fuzzy search: splits query into words,
 * returns true if ALL words appear somewhere across the searchable fields.
 * Case-insensitive.
 */
export function fuzzyMatch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return true;

  const haystack = fields
    .filter(Boolean)
    .map((f) => (f as string).toLowerCase())
    .join(" ");

  return keywords.every((kw) => haystack.includes(kw));
}
