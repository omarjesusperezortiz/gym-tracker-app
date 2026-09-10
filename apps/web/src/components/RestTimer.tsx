// Rest timer for the Train screen.
//
// CORRECTNESS NOTE (web): remaining time is derived from an absolute END
// TIMESTAMP (restEndsAt = Date.now() + seconds*1000), NOT by decrementing a
// counter on each setInterval tick. Timers throttle or pause when the tab is
// backgrounded / the phone locks, so a tick-counting timer drifts badly. By
// recomputing `remaining = restEndsAt - Date.now()` on every tick (and whenever
// the tab regains focus), the countdown stays accurate no matter how the
// browser throttled us in between.
//
// PLATFORM LIMITATION: a true alarm that fires while the app is FULLY CLOSED is
// not possible on the web — there is no background execution once the tab/PWA is
// killed. The in-app beep + vibrate + flash below only run while the page is
// alive (foreground or briefly backgrounded). A reliable "rest over" alert with
// the app closed is a native/Expo feature (local notifications), out of scope
// for the web build.
import { useCallback, useEffect, useRef, useState } from 'react';

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

// Short WebAudio chime — no asset needed and works from a user-gesture-primed
// AudioContext. Guarded so it's a no-op where WebAudio is unavailable.
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    play(880, 0, 0.18);
    play(1320, 0.2, 0.22);
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    /* ignore — audio is a nice-to-have */
  }
}

export interface RestTimerProps {
  /** Total rest length in seconds. */
  seconds: number;
  /** Called when the user skips or the countdown completes and is dismissed. */
  onClose: () => void;
}

export function RestTimer({ seconds, onClose }: RestTimerProps) {
  // Absolute instant the rest ends; paused timers store the remaining ms instead.
  const [endsAt, setEndsAt] = useState<number>(() => Date.now() + seconds * 1000);
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(seconds * 1000);
  const [flash, setFlash] = useState(false);
  const firedRef = useRef(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const total = seconds * 1000;
  const paused = pausedRemaining != null;

  const finish = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    beep();
    // navigator.vibrate is Android-only; iOS Safari ignores it. Guarded.
    try {
      navigator.vibrate?.(200);
    } catch {
      /* ignore */
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  }, []);

  // Single rAF-ish interval that always recomputes from the absolute end time.
  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const left = endsAt - Date.now();
      setRemainingMs(left);
      if (left <= 0) finish();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt, paused, finish]);

  // Recompute immediately when the tab regains focus, so a backgrounded timer
  // snaps to the true remaining time instead of showing a stale frame.
  useEffect(() => {
    const onVis = () => {
      if (!paused && document.visibilityState === 'visible') {
        setRemainingMs(endsAt - Date.now());
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [endsAt, paused]);

  // Wake Lock: keep the screen awake while resting. Fully guarded — unsupported
  // on iOS < 16.4 and desktops without the API; failure is silent.
  useEffect(() => {
    let released = false;
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
    if (wl) {
      wl.request('screen')
        .then((lock) => {
          if (released) {
            void lock.release();
          } else {
            wakeLockRef.current = lock;
          }
        })
        .catch(() => {
          /* ignore — screen may still sleep, that's fine */
        });
    }
    return () => {
      released = true;
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  const displayMs = paused ? (pausedRemaining as number) : remainingMs;
  const done = displayMs <= 0;
  const frac = Math.max(0, Math.min(1, displayMs / total));
  const dashOffset = RING_C * (1 - frac);

  function togglePause() {
    if (paused) {
      setEndsAt(Date.now() + (pausedRemaining as number));
      setPausedRemaining(null);
    } else {
      setPausedRemaining(Math.max(0, endsAt - Date.now()));
    }
  }

  function addFifteen() {
    firedRef.current = false;
    if (paused) {
      setPausedRemaining((r) => (r ?? 0) + 15000);
    } else {
      setEndsAt((e) => e + 15000);
    }
  }

  return (
    <div className={`resttimer${flash ? ' flash' : ''}${done ? ' done' : ''}`} role="timer" aria-live="off">
      <div className="rt-inner">
        <div className="rt-ring">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle className="rt-bg" cx="64" cy="64" r={RING_R} />
            <circle
              className="rt-fg"
              cx="64"
              cy="64"
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 64 64)"
            />
          </svg>
          <div className="rt-center">
            <div className="rt-time">{mmss(displayMs / 1000)}</div>
            <div className="rt-lbl">{done ? 'rest over' : paused ? 'paused' : 'rest'}</div>
          </div>
        </div>
        <div className="rt-ctrls">
          <button className="rt-btn" onClick={togglePause} disabled={done}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="rt-btn" onClick={addFifteen}>
            +15s
          </button>
          <button className="rt-btn primary" onClick={onClose}>
            {done ? 'Done' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}
