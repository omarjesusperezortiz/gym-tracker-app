import { describe, expect, it } from 'vitest';
import { catalog } from '@gym-tracker/core';
import type { MuscleGroup } from '@gym-tracker/core';
import { localRecoFallback, sessionMuscles, type RecoPrefs } from '../lib/reco';
import type { LoggedWorkout } from '../lib/workouts';

const GYM = catalog.plans.gym.sessions;

function logged(sess: string, daysAgo: number): LoggedWorkout {
  return {
    id: `${sess}-${daysAgo}`,
    date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    plan: 'gym',
    sess,
    name: GYM[sess].name,
    type: 'workout',
    slots: [],
  };
}

const prefs = (focusMuscles: MuscleGroup[], goal: RecoPrefs['goal'] = 'muscle'): RecoPrefs => ({ goal, focusMuscles });

// Everything logged recently except one session, so the "least recently
// trained" signal points at a known answer unless focus overrides it.
function allRecentExcept(except: string[]): LoggedWorkout[] {
  return Object.keys(GYM)
    .filter((k) => !except.includes(k))
    .map((k) => logged(k, 1));
}

describe('sessionMuscles', () => {
  it('reads each catalog session s muscle blurb correctly', () => {
    const of = (k: string) => [...sessionMuscles(GYM[k].muscles)].sort();
    expect(of('push')).toEqual(['arms', 'chest', 'core', 'shoulders'].sort());
    expect(of('pull')).toEqual(['arms', 'back', 'shoulders'].sort());
    expect(of('fullupper')).toEqual(['arms', 'back', 'chest', 'shoulders'].sort());
    expect(of('legs')).toEqual(['core', 'legs'].sort());
    expect(of('arms')).toEqual(['arms']);
    expect(of('shoulders')).toEqual(['shoulders']);
    expect(of('chest')).toEqual(['arms', 'chest'].sort());
    expect(of('back')).toEqual(['back', 'shoulders'].sort());
    // "a bit of everything" is full body.
    expect(of('fullbody')).toEqual(['arms', 'back', 'chest', 'core', 'legs', 'shoulders'].sort());
  });

  it('treats lower back as core, not back', () => {
    // The core session is "abs · obliques · lower back".
    expect([...sessionMuscles(GYM.core.muscles)]).toEqual(['core']);
  });

  it('classifies every catalog session into at least one group', () => {
    const unmapped = Object.values(catalog.plans).flatMap((plan) =>
      Object.entries(plan.sessions).filter(([, s]) => sessionMuscles(s.muscles).size === 0)
    );
    expect(unmapped).toEqual([]);
  });
});

describe('localRecoFallback without prefs', () => {
  it('still picks the least-recently trained broad session', () => {
    const reco = localRecoFallback([...allRecentExcept(['pull']), logged('pull', 30)]);
    expect(reco.session).toBe('pull');
    expect(reco.reason).toMatch(/least-recently trained/);
  });

  it('only ever suggests broad sessions', () => {
    // Even with the focused sessions long overdue, no focus means no focused picks.
    const reco = localRecoFallback(Object.keys(GYM).map((k) => (k === 'arms' ? logged(k, 90) : logged(k, 2))));
    expect(GYM[reco.session].group).toBe('broad');
  });
});

describe('localRecoFallback with focus muscles', () => {
  it('promotes a focused session that hits the focus list', () => {
    // Arms hasn't been trained in ages and arms are the focus → suggest Arms,
    // even though it's a focused (not broad) session.
    const history = [...allRecentExcept(['arms']), logged('arms', 40)];
    const reco = localRecoFallback(history, prefs(['arms']));
    expect(reco.session).toBe('arms');
    expect(reco.reason).toMatch(/Hits your focus: arms\./);
  });

  it('never suggests a focused session outside the focus list', () => {
    const history = [...allRecentExcept(['arms']), logged('arms', 40)];
    const reco = localRecoFallback(history, prefs(['chest']));
    expect(reco.session).not.toBe('arms');
  });

  it('prefers the broad session covering more of the focus list', () => {
    // Push (chest/shoulders/arms/core) and Pull (back/arms/shoulders) are both a
    // week stale; a chest+arms focus should tip it to Push.
    const history = Object.keys(GYM).map((k) => (k === 'push' || k === 'pull' ? logged(k, 7) : logged(k, 1)));
    expect(localRecoFallback(history, prefs(['chest', 'arms'])).session).toBe('push');
    // …and a back focus should tip the same history the other way.
    expect(localRecoFallback(history, prefs(['back'])).session).toBe('pull');
  });

  it('deprioritises a leg-heavy session when legs are not a focus', () => {
    // Legs is the most overdue session and would be pooled in by a core focus
    // (it is "legs · core"), but with no leg focus the penalty pushes it below
    // the equally-stale Core session.
    const history = Object.keys(GYM).map((k) => (k === 'legs' || k === 'core' ? logged(k, 20) : logged(k, 1)));
    expect(localRecoFallback(history, prefs(['core'])).session).toBe('core');
    // Add legs to the focus and it wins.
    expect(localRecoFallback(history, prefs(['core', 'legs'])).session).toBe('legs');
  });

  it('mentions a never-trained session before a merely stale one', () => {
    const history = Object.keys(GYM)
      .filter((k) => k !== 'pull')
      .map((k) => logged(k, 20));
    const reco = localRecoFallback(history, prefs(['chest']));
    expect(reco.session).toBe('pull');
    expect(reco.reason).toMatch(/haven't logged .* yet/);
  });
});

describe('localRecoFallback goal messaging', () => {
  const history = allRecentExcept([]);

  it('adds a rep-range cue per goal', () => {
    expect(localRecoFallback(history, prefs([], 'strength')).reason).toMatch(/heavy — low reps/);
    expect(localRecoFallback(history, prefs([], 'muscle')).reason).toMatch(/8–12 range/);
    expect(localRecoFallback(history, prefs([], 'fat_loss')).reason).toMatch(/rests short/);
    expect(localRecoFallback(history, prefs([], 'endurance')).reason).toMatch(/Higher reps/);
    expect(localRecoFallback(history, prefs([], 'maintain')).reason).toMatch(/ticking over/);
  });

  it('says nothing about rep ranges when there are no prefs', () => {
    const reason = localRecoFallback(history).reason;
    expect(reason).not.toMatch(/reps/);
    expect(reason).not.toMatch(/Hits your focus/);
  });
});
