import { describe, expect, it } from 'vitest';
import {
  csvEscape,
  exportFilename,
  toCSV,
  toExportPayload,
  toJSON,
} from '../lib/exportData';
import type { LoggedWorkout } from '../lib/workouts';

const HISTORY: LoggedWorkout[] = [
  {
    id: 'w1',
    date: '2026-01-02',
    plan: 'gym',
    sess: 'push',
    name: 'Push, day',
    type: 'workout',
    slots: [
      {
        slot: 'Flat "chest" press',
        kind: 'bar',
        done: true,
        force: false,
        sets: [
          { w: '60', r: '10' },
          { w: '62.5', r: '8' },
        ],
      },
      {
        slot: 'Pull-up',
        kind: 'bw',
        done: true,
        force: false,
        sets: [{ w: '', r: '12' }],
      },
    ],
  },
  {
    id: 'w2',
    date: '2026-01-03',
    plan: 'gym',
    sess: null,
    name: 'Rest',
    type: 'rest',
    slots: [],
  },
];

describe('toCSV', () => {
  it('emits a header plus one row per logged set, skipping rest days', () => {
    const csv = toCSV(HISTORY);
    const lines = csv.trimEnd().split('\r\n');
    expect(lines[0]).toBe('date,session,exercise,equipment,set_number,weight,reps');
    // 2 press sets + 1 pull-up set = 3 rows; rest day contributes none.
    expect(lines).toHaveLength(4);
  });

  it('numbers sets per slot starting at 1 and maps kind to a label', () => {
    const lines = toCSV(HISTORY).trimEnd().split('\r\n');
    // First press set: date, session (quoted for comma), exercise (quoted for "),
    // equipment=Barbell, set_number=1, weight, reps
    expect(lines[1]).toBe('2026-01-02,"Push, day","Flat ""chest"" press",Barbell,1,60,10');
    expect(lines[2]).toBe('2026-01-02,"Push, day","Flat ""chest"" press",Barbell,2,62.5,8');
    // Bodyweight pull-up: kind bw -> Bodyweight, empty weight
    expect(lines[3]).toBe('2026-01-02,"Push, day",Pull-up,Bodyweight,1,,12');
  });

  it('always ends on a record boundary', () => {
    expect(toCSV(HISTORY).endsWith('\r\n')).toBe(true);
    expect(toCSV([])).toBe('date,session,exercise,equipment,set_number,weight,reps\r\n');
  });
});

describe('csvEscape', () => {
  it('leaves plain values untouched', () => {
    expect(csvEscape('bar')).toBe('bar');
    expect(csvEscape(5)).toBe('5');
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
  });

  it('quotes and doubles quotes for commas, quotes, and newlines', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('toJSON / toExportPayload', () => {
  it('builds a clean nested structure with set numbers and equipment labels', () => {
    const now = new Date('2026-01-04T00:00:00.000Z');
    const payload = toExportPayload(HISTORY, now);
    expect(payload.app).toBe('gym-trainer');
    expect(payload.exportedAt).toBe('2026-01-04T00:00:00.000Z');
    expect(payload.workoutCount).toBe(2);
    const w = payload.workouts[0];
    expect(w.date).toBe('2026-01-02');
    expect(w.session).toBe('push');
    expect(w.slots[0]).toMatchObject({ exercise: 'Flat "chest" press', equipment: 'Barbell', kind: 'bar' });
    expect(w.slots[0].sets).toEqual([
      { setNumber: 1, weight: '60', reps: '10' },
      { setNumber: 2, weight: '62.5', reps: '8' },
    ]);
    expect(w.slots[1]).toMatchObject({ equipment: 'Bodyweight' });
  });

  it('is pretty-printed and round-trips through JSON.parse', () => {
    const json = toJSON(HISTORY, new Date('2026-01-04T00:00:00.000Z'));
    expect(json).toContain('\n  ');
    const parsed = JSON.parse(json);
    expect(parsed.workouts).toHaveLength(2);
    expect(parsed.workouts[0].slots[0].sets[1].weight).toBe('62.5');
  });
});

describe('exportFilename', () => {
  it('formats a date-stamped filename with the right extension', () => {
    const d = new Date(2026, 0, 5); // Jan 5 2026, local
    expect(exportFilename('csv', d)).toBe('gym-trainer-export-2026-01-05.csv');
    expect(exportFilename('json', d)).toBe('gym-trainer-export-2026-01-05.json');
  });
});
