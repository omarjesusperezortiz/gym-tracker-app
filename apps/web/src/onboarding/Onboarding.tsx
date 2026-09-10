// First-run wizard — a premium 5-step flow matching the approved prototype
// (/tmp/proto-onboarding-ref.html): Goal → Body → Height → Weight → Loading.
// Everything it collects is also editable later in Profile, so this is a
// friendly head start rather than the only way to set it up.
import { useEffect, useRef, useState } from 'react';
import { Dumbbell, Flame, HeartPulse, TrendingUp, Zap } from 'lucide-react';
import type { Equipment, Experience, Goal, MuscleGroup, UserPrefs } from '@gym-tracker/core';
import { useAppState } from '../state/AppState';
import { useToast } from '../components/Toast';
import { DEFAULT_PREFS, useLogBodyweight, usePrefs, useSavePrefs } from '../lib/useProfileData';
import { EXPERIENCES, SEXES } from '../components/PrefControls';
import { WheelPicker } from '../components/WheelPicker';
import { HRulerPicker } from '../components/HRulerPicker';
import '../styles/onboarding-extras.css';

interface Draft {
  displayName: string;
  sex: string | null;
  birthYear: string;
  heightCm: string;
  currentWeight: string;
  goalWeight: string;
  goal: Goal;
  focusMuscles: MuscleGroup[];
  experience: Experience;
  daysPerWeek: number;
  sessionMin: number;
  equipment: Equipment;
  units: 'kg' | 'lb';
}

function draftFrom(prefs: UserPrefs): Draft {
  return {
    displayName: prefs.displayName ?? '',
    sex: prefs.sex,
    birthYear: prefs.birthYear ? String(prefs.birthYear) : '',
    heightCm: prefs.heightCm ? String(prefs.heightCm) : '',
    currentWeight: '',
    goalWeight: prefs.goalWeightKg ? String(prefs.goalWeightKg) : '',
    goal: prefs.goal,
    focusMuscles: prefs.focusMuscles,
    experience: prefs.experience,
    daysPerWeek: prefs.daysPerWeek,
    sessionMin: prefs.sessionMin,
    equipment: prefs.equipment,
    units: prefs.units,
  };
}

const num = (v: string): number | null => {
  const n = parseFloat(v);
  return isNaN(n) || n <= 0 ? null : n;
};

const PILLS = 4;
const CURRENT_YEAR = new Date().getFullYear();

// The four goals shown in the prototype, each with a real lucide icon.
const GOAL_CARDS: { value: Goal; name: string; sub: string; Icon: typeof Dumbbell }[] = [
  { value: 'muscle', name: 'Build Muscle', sub: 'Add size & strength', Icon: Dumbbell },
  { value: 'fat_loss', name: 'Lose Weight', sub: 'Burn fat, lean out', Icon: Flame },
  { value: 'maintain', name: 'Stay Fit', sub: 'Keep moving & healthy', Icon: HeartPulse },
  { value: 'strength', name: 'Get Stronger', sub: 'Lift heavier over time', Icon: TrendingUp },
];

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// cm → 5'8" style label for the ft/in wheel display (storage stays in cm).
function cmToFtIn(cm: number): string {
  const totalIn = Math.round(cm / 2.54);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn % 12;
  return `${ft}'${inch}"`;
}

export function Onboarding() {
  const prefsQuery = usePrefs();
  const savePrefs = useSavePrefs();
  const logWeighIn = useLogBodyweight();
  const { dispatch } = useAppState();
  const { toast } = useToast();

  // Pre-filled from whatever is already saved, so re-running it from Profile
  // isn't starting from scratch.
  const [draft, setDraft] = useState<Draft>(() => draftFrom(prefsQuery.data ?? DEFAULT_PREFS));
  const [step, setStep] = useState(0);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // "Skip for now" — the single escape hatch. Enter the app now with whatever's
  // been entered plus sensible defaults, and mark onboarded so we never nag
  // again. Everything is editable later in Profile.
  function skipForNow() {
    savePrefs.mutate(
      { onboarded: true },
      {
        onSuccess: () => {
          dispatch({ type: 'SET_VIEW', view: 'home' });
          toast('You can finish your profile any time in Profile');
        },
        onError: (err) => toast(err.message || 'Could not skip'),
      }
    );
  }

  function finish() {
    const weight = num(draft.currentWeight);
    savePrefs.mutate(
      {
        displayName: draft.displayName.trim() || null,
        sex: draft.sex,
        birthYear: draft.birthYear ? Number(draft.birthYear) : null,
        heightCm: num(draft.heightCm),
        goalWeightKg: num(draft.goalWeight),
        goal: draft.goal,
        focusMuscles: draft.focusMuscles,
        experience: draft.experience,
        daysPerWeek: draft.daysPerWeek,
        sessionMin: draft.sessionMin,
        equipment: draft.equipment,
        units: draft.units,
        onboarded: true,
      },
      {
        onSuccess: () => {
          // Land on Home, ready to pick a session.
          dispatch({ type: 'SET_VIEW', view: 'home' });
          toast(draft.displayName.trim() ? `You're all set, ${draft.displayName.trim()}!` : "You're all set!");
        },
        onError: (err) => toast(err.message || 'Could not save your profile'),
      }
    );
    // A starting weight is worth keeping even if it's the only body detail given.
    if (weight) logWeighIn.mutate({ date: todayInput(), weightKg: weight });
  }

  const loading = step === 4;
  const filled = Math.min(step + 1, PILLS);

  return (
    <div className="ob">
      <div className="ob-prog" role="progressbar" aria-valuenow={filled} aria-valuemin={1} aria-valuemax={PILLS}>
        {Array.from({ length: PILLS }, (_, i) => (
          <i key={i} className={i < filled ? 'on' : ''} />
        ))}
      </div>

      <div className="ob-body" key={step}>
        {step === 0 && <GoalStep goal={draft.goal} onGoal={(g) => set('goal', g)} onNext={() => setStep(1)} />}
        {step === 1 && (
          <BodyStep
            draft={draft}
            set={set}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <HeightStep
            value={draft.heightCm}
            onChange={(v) => set('heightCm', v)}
            unit={heightUnit}
            onUnit={setHeightUnit}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <WeightStep
            value={draft.currentWeight}
            onChange={(v) => set('currentWeight', v)}
            units={draft.units}
            onUnits={(u) => set('units', u)}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {loading && <LoadingStep onDone={finish} />}
      </div>

      {/* The single, clearly-labelled escape hatch: leave now with sensible
          defaults, marked onboarded so the wizard never reappears. Hidden on the
          final building screen, which is already committing. */}
      {!loading && (
        <button className="ob-skipall" onClick={skipForNow} disabled={savePrefs.isPending}>
          Skip for now
        </button>
      )}
    </div>
  );
}

// ── Step 1: Goal ────────────────────────────────────────────────
function GoalStep({ goal, onGoal, onNext }: { goal: Goal; onGoal: (g: Goal) => void; onNext: () => void }) {
  return (
    <>
      <h1 className="ob-title">What's Your Fitness Goal?</h1>
      <p className="ob-sub">Pick what you want to achieve. We'll build a personalized training system just for you.</p>
      <div className="ob-goals">
        {GOAL_CARDS.map(({ value, name, sub, Icon }) => (
          <button
            key={value}
            type="button"
            className={`ob-goal${value === goal ? ' sel' : ''}`}
            aria-pressed={value === goal}
            onClick={() => onGoal(value)}
          >
            <span className="ob-fig">
              <Icon strokeWidth={2} />
            </span>
            <span className="ob-gname">{name}</span>
            <span className="ob-gsub">{sub}</span>
          </button>
        ))}
      </div>
      <div className="ob-spacer" />
      <div className="ob-foot">
        <button className="ob-cont" onClick={onNext}>
          Continue →
        </button>
      </div>
    </>
  );
}

// ── Step 2: Body ────────────────────────────────────────────────
type Setter = <K extends keyof Draft>(k: K, v: Draft[K]) => void;

function BodyStep({
  draft,
  set,
  onBack,
  onNext,
}: {
  draft: Draft;
  set: Setter;
  onBack: () => void;
  onNext: () => void;
}) {
  const [open, setOpen] = useState<'age' | 'gender' | 'experience' | null>(null);
  const toggle = (k: 'age' | 'gender' | 'experience') => setOpen((o) => (o === k ? null : k));
  const age = draft.birthYear ? String(CURRENT_YEAR - Number(draft.birthYear)) : '';
  const sexLabel = SEXES.find((s) => s.value === draft.sex)?.label;
  const expLabel = EXPERIENCES.find((e) => e.value === draft.experience)?.label;

  return (
    <>
      <h1 className="ob-title">Tell Us About Your Body</h1>
      <p className="ob-sub">This helps us build a plan that fits your body and adapts to your progress.</p>

      <div className="ob-drow filled">
        <label className="ob-namefield" style={{ width: '100%' }}>
          <input
            type="text"
            placeholder="Your name"
            value={draft.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            aria-label="Name"
          />
        </label>
      </div>

      <div className={`ob-drow${age ? ' filled' : ''}`}>
        <button type="button" className="ob-drow-head" onClick={() => toggle('age')} aria-expanded={open === 'age'}>
          <span>How old are you?</span>
          <span className={age ? 'ob-drow-val' : 'ob-chev'}>{age || '›'}</span>
        </button>
        {open === 'age' && (
          <div className="ob-drow-expand">
            <input
              type="number"
              inputMode="numeric"
              placeholder="27"
              value={age}
              onChange={(e) => {
                const a = parseInt(e.target.value, 10);
                set('birthYear', Number.isFinite(a) && a > 0 ? String(CURRENT_YEAR - a) : '');
              }}
              aria-label="Age"
            />
          </div>
        )}
      </div>

      <div className={`ob-drow${sexLabel ? ' filled' : ''}`}>
        <button
          type="button"
          className="ob-drow-head"
          onClick={() => toggle('gender')}
          aria-expanded={open === 'gender'}
        >
          <span>What's your gender?</span>
          <span className={sexLabel ? 'ob-drow-val' : 'ob-chev'}>{sexLabel || '›'}</span>
        </button>
        {open === 'gender' && (
          <div className="ob-drow-expand ob-seg" role="group" aria-label="Gender">
            {SEXES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={draft.sex === s.value ? 'on' : ''}
                aria-pressed={draft.sex === s.value}
                onClick={() => set('sex', s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`ob-drow${expLabel ? ' filled' : ''}`}>
        <button
          type="button"
          className="ob-drow-head"
          onClick={() => toggle('experience')}
          aria-expanded={open === 'experience'}
        >
          <span>What's your experience?</span>
          <span className={expLabel ? 'ob-drow-val' : 'ob-chev'}>{expLabel || '›'}</span>
        </button>
        {open === 'experience' && (
          <div className="ob-drow-expand ob-seg" role="group" aria-label="Experience">
            {EXPERIENCES.map((e) => (
              <button
                key={e.value}
                type="button"
                className={draft.experience === e.value ? 'on' : ''}
                aria-pressed={draft.experience === e.value}
                onClick={() => set('experience', e.value)}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ob-spacer" />
      <div className="ob-foot ob-navrow">
        <button className="ob-back" onClick={onBack} aria-label="Previous step">
          ‹
        </button>
        <button className="ob-cont" onClick={onNext}>
          Continue →
        </button>
      </div>
    </>
  );
}

// ── Step 3: Height ──────────────────────────────────────────────
function HeightStep({
  value,
  onChange,
  unit,
  onUnit,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: 'cm' | 'ft';
  onUnit: (u: 'cm' | 'ft') => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <h1 className="ob-title ctr">What's Your Height?</h1>
      <p className="ob-sub ctr">Scroll to set — helps us personalize your plan.</p>
      <WheelPicker
        value={value}
        onChange={onChange}
        min={120}
        max={220}
        step={1}
        defaultValue={172}
        unit={unit === 'cm' ? 'cm' : 'ft/in'}
        ariaLabel="Height in cm"
        formatValue={unit === 'ft' ? (v) => cmToFtIn(v) : undefined}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="ob-unit" role="group" aria-label="Height unit">
          <button className={unit === 'cm' ? 'on' : ''} onClick={() => onUnit('cm')}>
            cm
          </button>
          <button className={unit === 'ft' ? 'on' : ''} onClick={() => onUnit('ft')}>
            ft / in
          </button>
        </div>
      </div>
      <div className="ob-foot ob-navrow">
        <button className="ob-back" onClick={onBack} aria-label="Previous step">
          ‹
        </button>
        <button className="ob-cont" onClick={onNext}>
          Continue →
        </button>
      </div>
    </>
  );
}

// ── Step 4: Weight ──────────────────────────────────────────────
function WeightStep({
  value,
  onChange,
  units,
  onUnits,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  units: 'kg' | 'lb';
  onUnits: (u: 'kg' | 'lb') => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <h1 className="ob-title ctr">What's Your Current Weight?</h1>
      <p className="ob-sub ctr">Slide to set — used to customize your journey.</p>
      <div className="ob-spacer" style={{ maxHeight: 24 }} />
      <HRulerPicker
        value={value}
        onChange={onChange}
        min={35}
        max={200}
        step={0.5}
        defaultValue={73.4}
        unit="kg"
        ariaLabel="Current weight in kg"
        majorEvery={10}
        decimals={1}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="ob-unit" role="group" aria-label="Weight unit">
          <button className={units === 'kg' ? 'on' : ''} onClick={() => onUnits('kg')}>
            kg
          </button>
          <button className={units === 'lb' ? 'on' : ''} onClick={() => onUnits('lb')}>
            lbs
          </button>
        </div>
      </div>
      <div className="ob-spacer" />
      <div className="ob-foot ob-navrow">
        <button className="ob-back" onClick={onBack} aria-label="Previous step">
          ‹
        </button>
        <button className="ob-cont" onClick={onNext}>
          Finish Setup →
        </button>
      </div>
    </>
  );
}

// ── Step 5: Loading ─────────────────────────────────────────────
const LOAD_STEPS = ['Analyzing your fitness profile…', 'Understanding your goals…', 'Building your plan…'];

function LoadingStep({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(1), 500);
    const t2 = setTimeout(() => setDone(2), 1000);
    const t3 = setTimeout(() => {
      setDone(3);
      if (!fired.current) {
        fired.current = true;
        onDone();
      }
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // onDone is stable enough for a one-shot; intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="ob-title ctr">Creating Your Personalized Fitness System</h1>
      <div className="ob-loadwrap">
        <div className="ob-rings">
          <div className="ob-ring ob-r1" />
          <div className="ob-ring ob-r2" />
          <div className="ob-ring ob-r3" />
          <div className="ob-core">
            <Zap fill="currentColor" strokeWidth={1.5} />
          </div>
        </div>
        <div className="ob-checklist">
          {LOAD_STEPS.map((label, i) => {
            const complete = i < done;
            return (
              <div key={label} className={complete ? 'ok' : ''}>
                {complete ? (
                  <span className="ob-dot">✓</span>
                ) : (
                  <span className="ob-dotpending" />
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
