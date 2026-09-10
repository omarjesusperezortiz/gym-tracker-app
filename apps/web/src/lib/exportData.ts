// Data ownership: let the user pull their entire workout history back out of the
// app in open formats. Pure formatters (toCSV / toJSON) are unit-tested; the
// download side-effect is isolated in triggerDownload so it can be feature-
// detected and skipped in non-browser environments.
import { KIND_LABEL } from '@gym-tracker/core';
import type { LoggedWorkout } from './workouts';

// ── Filenames ────────────────────────────────────────────────
export function exportFilename(ext: 'csv' | 'json', date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `gym-trainer-export-${y}-${m}-${d}.${ext}`;
}

// ── CSV ──────────────────────────────────────────────────────
// RFC-4180-ish escaping: wrap in quotes when the value contains a comma, quote,
// CR or LF, and double any embedded quotes.
export function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const CSV_HEADER = ['date', 'session', 'exercise', 'equipment', 'set_number', 'weight', 'reps'] as const;

function equipmentLabel(kind: LoggedWorkout['slots'][number]['kind']): string {
  return KIND_LABEL[kind] ?? kind;
}

// One row per logged SET. Rest-day markers (no slots) contribute no rows.
export function toCSV(workouts: LoggedWorkout[]): string {
  const rows: string[] = [CSV_HEADER.join(',')];
  for (const w of workouts) {
    const session = w.name || w.sess || '';
    for (const slot of w.slots) {
      const equip = equipmentLabel(slot.kind);
      slot.sets.forEach((set, i) => {
        rows.push(
          [
            csvEscape(w.date),
            csvEscape(session),
            csvEscape(slot.slot),
            csvEscape(equip),
            csvEscape(i + 1),
            csvEscape(set.w),
            csvEscape(set.r),
          ].join(',')
        );
      });
    }
  }
  // Trailing newline so the file ends cleanly on a record boundary.
  return rows.join('\r\n') + '\r\n';
}

// ── JSON ─────────────────────────────────────────────────────
export interface ExportSet {
  setNumber: number;
  weight: string;
  reps: string;
}
export interface ExportSlot {
  exercise: string;
  equipment: string;
  kind: string;
  done: boolean;
  sets: ExportSet[];
}
export interface ExportWorkout {
  date: string;
  plan: string;
  session: string | null;
  name: string;
  type: string;
  slots: ExportSlot[];
}
export interface ExportPayload {
  app: string;
  exportedAt: string;
  workoutCount: number;
  workouts: ExportWorkout[];
}

export function toExportPayload(workouts: LoggedWorkout[], now = new Date()): ExportPayload {
  return {
    app: 'gym-trainer',
    exportedAt: now.toISOString(),
    workoutCount: workouts.length,
    workouts: workouts.map((w) => ({
      date: w.date,
      plan: w.plan,
      session: w.sess,
      name: w.name,
      type: w.type,
      slots: w.slots.map((slot) => ({
        exercise: slot.slot,
        equipment: equipmentLabel(slot.kind),
        kind: slot.kind,
        done: slot.done,
        sets: slot.sets.map((set, i) => ({ setNumber: i + 1, weight: set.w, reps: set.r })),
      })),
    })),
  };
}

// Pretty-printed for human readability — this is a "take my data" artifact, not
// a wire format.
export function toJSON(workouts: LoggedWorkout[], now = new Date()): string {
  return JSON.stringify(toExportPayload(workouts, now), null, 2);
}

// ── Download side-effect ─────────────────────────────────────
// Feature-detected: returns false (no throw) when the Blob/URL APIs aren't
// available, so callers can surface a graceful message instead of crashing.
export function triggerDownload(filename: string, contents: string, mime: string): boolean {
  if (
    typeof document === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false;
  }
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has definitely been dispatched.
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}

export function downloadCSV(workouts: LoggedWorkout[], now = new Date()): boolean {
  return triggerDownload(exportFilename('csv', now), toCSV(workouts), 'text/csv;charset=utf-8');
}

export function downloadJSON(workouts: LoggedWorkout[], now = new Date()): boolean {
  return triggerDownload(exportFilename('json', now), toJSON(workouts, now), 'application/json');
}
