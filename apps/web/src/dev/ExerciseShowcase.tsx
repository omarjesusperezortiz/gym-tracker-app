import { useState } from 'react';
import { catalog } from '@gym-tracker/core';
import type { Plan } from '@gym-tracker/core';
import { ExerciseCard } from '../views/ExerciseCard';
import { ExerciseGif } from '../components/ExerciseGif';
import type { LiveSlotState } from '../state/AppState';
import '../styles/exercise-gif.css';

// Standalone showcase that mounts the REAL ExerciseCard + gif thumbnails with
// the actual catalog data — no login, no Supabase. Lets us (and Omar) see the
// gif integration inside the genuine components. Reached at ?showcase=exercises.

const gymPlan = catalog.plans.gym as unknown as Plan;
const session = gymPlan.sessions.fullupper;

function emptyState(): LiveSlotState {
  return { kind: 'barbell', done: false, force: false, sets: [{ w: '', r: '' }] } as unknown as LiveSlotState;
}

export function ExerciseShowcase() {
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <div className="page-head">
        <h1 className="page-title">Exercise media — in the real components</h1>
        <p className="page-sub">
          The actual ExerciseCard (Train) and Today list rows, rendering the mirrored, upscaled
          exercisedb gifs. 12 of 31 catalog movements mapped so far.
        </p>
      </div>

      <div className="sec-label">Today · exercise list (real rows)</div>
      <div className="today-exlist" style={{ marginBottom: 28 }}>
        {session.slots.map((sl, i) => (
          <div className="today-ex" key={sl[0] + i}>
            <ExerciseGif name={sl[0]} size="thumb" hideWhenMissing />
            <span className="today-exn">{i + 1}</span>
            {sl[0]}
          </div>
        ))}
      </div>

      <div className="sec-label">Train · real ExerciseCard with demo gif</div>
      {session.slots.slice(0, 4).map((sl, i) => (
        <ExerciseCard
          key={sl[0]}
          index={i}
          slotDef={sl}
          plan={gymPlan}
          state={emptyState()}
          onToggleDone={() => {}}
          onToggleForce={() => {}}
          onKindChange={() => {}}
          onSetChange={() => {}}
          onAddSet={() => {}}
          onDeleteSet={() => {}}
          onZoom={(src) => setZoom(src)}
        />
      ))}

      {zoom && (
        <div className="zoom-overlay" onClick={() => setZoom(null)}>
          <img src={zoom} alt="zoom" />
        </div>
      )}
    </div>
  );
}
