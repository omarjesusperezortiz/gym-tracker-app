import {
  MUSCLES,
  classifyMuscles,
  muscleSetCounts,
  muscleIntensities,
  type MuscleHistoryEntry,
} from '../logic/muscleMap';

// Every canonical session slot in the catalog, and the muscles it must map to.
const CANONICAL: Array<[string, string[]]> = [
  ['Flat chest press', ['chest', 'triceps']],
  ['Incline press', ['chest', 'delts', 'triceps']],
  ['Chest fly', ['chest']],
  ['Chest dip', ['triceps', 'chest']],
  ['Overhead press', ['delts', 'triceps']],
  ['Side lateral raise', ['delts']],
  ['Front raise', ['delts']],
  ['Upright row', ['back', 'delts']],
  ['Rear delts', ['delts']],
  ['Triceps pushdown/ext', ['triceps']],
  ['Overhead triceps', ['triceps']],
  ['Horizontal row', ['back', 'biceps']],
  ['Vertical pull (lats)', ['back']],
  ['Lat pullover / straight-arm', ['back']],
  ['Shrugs (traps)', ['back']],
  ['Biceps curl', ['biceps']],
  ['Hammer curl', ['biceps']],
  ['Forearm / wrist', []],
  ['Squat', ['quads', 'glutes']],
  ['Lunge', ['quads', 'glutes']],
  ['Hamstring / RDL', ['hamstrings', 'glutes']],
  ['Calf raise', ['calves']],
  ['Plank', ['abs']],
  ['Plank (core)', ['abs']],
  ['Side Plank', ['abs']],
  ['Leg raise (core)', ['abs']],
  ['Hanging/Lying Leg Raise', ['abs']],
  ['Reverse Crunch', ['abs']],
  ['Bicycle Crunch', ['abs']],
  ['Russian Twist', ['abs']],
  ['Pallof Press (anti-rotation)', ['abs']],
];

const sorted = (m: string[]) => [...m].sort();

describe('classifyMuscles', () => {
  it.each(CANONICAL)('maps %s to the right muscles', (slot, expected) => {
    expect(sorted(classifyMuscles(slot))).toEqual(sorted(expected));
  });

  it('never reads Pallof Press as chest (anti-rotation, not a press)', () => {
    expect(classifyMuscles('Pallof Press (anti-rotation)')).toEqual(['abs']);
  });

  it('keeps a leg curl out of the biceps and in the hamstrings', () => {
    const m = classifyMuscles('Lying Leg Curls');
    expect(m).toContain('hamstrings');
    expect(m).not.toContain('biceps');
  });

  it('returns muscles in the canonical head-to-toe order', () => {
    const m = classifyMuscles('Flat chest press'); // chest before triceps
    expect(m).toEqual(['chest', 'triceps']);
  });
});

function w(date: string, slot: string, sets: Array<{ w: string; r: string }>): MuscleHistoryEntry {
  return { date, type: 'workout', slots: [{ slot, sets }] };
}

describe('muscleSetCounts', () => {
  const history: MuscleHistoryEntry[] = [
    w('2026-01-01T12:00:00.000Z', 'Flat chest press', [
      { w: '60', r: '8' },
      { w: '60', r: '8' },
    ]),
    w('2026-01-05T12:00:00.000Z', 'Squat', [{ w: '100', r: '5' }]),
    w('2026-01-08T12:00:00.000Z', 'Plank (core)', [{ w: '', r: '60' }]),
  ];

  it('counts logged sets per muscle, including compound overlap', () => {
    const counts = Object.fromEntries(muscleSetCounts(history).map((v) => [v.muscle, v.sets]));
    expect(counts.chest).toBe(2); // 2 chest-press sets
    expect(counts.triceps).toBe(2); // same press also hits triceps
    expect(counts.quads).toBe(1);
    expect(counts.glutes).toBe(1); // squat drives glutes too
    expect(counts.abs).toBe(1); // bodyweight plank still counts
    expect(counts.back).toBe(0);
  });

  it('records the most recent date each muscle was trained', () => {
    const chest = muscleSetCounts(history).find((v) => v.muscle === 'chest')!;
    const abs = muscleSetCounts(history).find((v) => v.muscle === 'abs')!;
    expect(chest.lastTrained).toBe('2026-01-01T12:00:00.000Z');
    expect(abs.lastTrained).toBe('2026-01-08T12:00:00.000Z');
  });

  it('returns every muscle even when untrained, with a null date', () => {
    const result = muscleSetCounts([]);
    expect(result).toHaveLength(MUSCLES.length);
    expect(result.every((v) => v.sets === 0 && v.lastTrained === null)).toBe(true);
  });

  it('ignores rest-day markers', () => {
    const counts = muscleSetCounts([{ date: '2026-01-02', type: 'rest', slots: [] }]);
    expect(counts.every((v) => v.sets === 0)).toBe(true);
  });
});

describe('muscleIntensities', () => {
  it('scales heavy/light/none against the hardest-trained muscle', () => {
    const volumes = MUSCLES.map((muscle) => ({ muscle, sets: 0, lastTrained: null as string | null }));
    volumes[0] = { muscle: 'chest', sets: 10, lastTrained: 'x' }; // top
    volumes[1] = { muscle: 'delts', sets: 6, lastTrained: 'x' }; // ≥ 50% → heavy
    volumes[2] = { muscle: 'back', sets: 2, lastTrained: 'x' }; // < 50% → light
    const i = muscleIntensities(volumes);
    expect(i.chest).toBe('heavy');
    expect(i.delts).toBe('heavy');
    expect(i.back).toBe('light');
    expect(i.quads).toBe('none');
  });

  it('marks everything none when nothing is trained', () => {
    const volumes = MUSCLES.map((muscle) => ({ muscle, sets: 0, lastTrained: null as string | null }));
    const i = muscleIntensities(volumes);
    expect(MUSCLES.every((m) => i[m] === 'none')).toBe(true);
  });
});
