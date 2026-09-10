// Small date-display helpers. The app is kg/British-English, so we prefer a
// human, unambiguous "Thu 10 Sep" over raw ISO or US MM/DD.

// Accepts an ISO date ('2026-09-10') or full ISO timestamp and renders a short,
// unambiguous label like "Thu 10 Sep". Returns '' for anything unparseable.
export function humanDate(iso: string | null | undefined): string {
  if (!iso) return '';
  // Anchor a bare date at local noon so the weekday can't slip across a TZ.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}
