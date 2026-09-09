import type { Kind, LoggedSet } from '../types';

export const KIND_LABEL: Record<Kind, string> = {
  bar: 'Barbell',
  cable: 'Cable',
  machine: 'Machine',
  db: 'Dumbbell',
  bw: 'Bodyweight',
};

export function parseTarget(scheme: string): number {
  const m = scheme.match(/(\d+)\s*×/);
  return m ? parseInt(m[1], 10) : 3;
}

export function isTimeScheme(scheme: string | undefined): boolean {
  return /\d\s*s(\/|\b)/i.test(scheme || '');
}

export function fmtLast(set: LoggedSet | undefined, weighted: boolean, timeBased: boolean): string {
  if (!set) return '';
  if (!weighted) return timeBased ? `${set.r || '–'}s` : `${set.r || '–'}`;
  return `${set.w || '–'}×${set.r || '–'}`;
}
