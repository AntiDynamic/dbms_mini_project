export function normalizeKeywords(queryText = "") {
  return [...new Set(
    queryText
      .toLowerCase()
      .replace(/[^a-z0-9+\s]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
  )];
}
