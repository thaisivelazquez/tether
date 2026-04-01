export function formatSidequestTimeLabel(iso: string): string {
  const start = new Date(iso);
  const now = new Date();
  const sDay = start.toDateString();
  const tDay = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (sDay === tDay) return 'today';
  if (sDay === tomorrow.toDateString()) return 'tomorrow';
  return start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTimeRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

export function minutesAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.floor(diff / 60000));
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  return `${h} hour${h === 1 ? '' : 's'} ago`;
}
