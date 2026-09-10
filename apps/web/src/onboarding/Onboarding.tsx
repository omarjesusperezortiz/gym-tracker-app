// First-run wizard. Everything it collects is also editable later in Profile,
// so this is a friendly head start rather than the only way to set it up.
import { useState } from 'react';
import type { Equipment, Experience, Goal, MuscleGroup, UserPrefs } from '@gym-tracker/core';
import { useAppState } from '../state/AppState';
import { useToast } from '../components/Toast';
import { DEFAULT_PREFS, useLogBodyweight, usePrefs, useSavePrefs } from '../lib/useProfileData';
import {
  DAYS_OPTIONS,
  EQUIPMENT,
  EXPERIENCES,
  GoalPicker,
  MuscleChips,
  SESSION_OPTIONS,
  SEXES,
  Segmented,
} from '../components/PrefControls';
import { IconBack, IconCheck, IconTrain } from '../lib/icons';

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
  };
}

const num = (v: string): number | null => {
  const n = parseFloat(v);
  return isNaN(n) || n <= 0 ? null : n;
};

const STEPS = ['Welcome', 'About you', 'Your goal', 'Focus', 'Training'];

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const last = step === STEPS.length - 1;

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

  return (
    <div className="onb">
      <div className="onb-top">
        <div className="onb-logo">
          <IconTrain />
        </div>
        <div className="onb-steps" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((label, i) => (
            <span key={label} className={`onb-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`} />
          ))}
        </div>
        <div className="onb-count">
          {step + 1}/{STEPS.length}
        </div>
      </div>

      {/* Keyed so each step animates in rather than swapping abruptly. */}
      <div className="onb-card" key={step}>
        {step === 0 && <WelcomeStep name={draft.displayName} onName={(v) => set('displayName', v)} />}
        {step === 1 && <BodyStep draft={draft} set={set} />}
        {step === 2 && <GoalStep goal={draft.goal} onGoal={(g) => set('goal', g)} />}
        {step === 3 && <FocusStep value={draft.focusMuscles} onChange={(m) => set('focusMuscles', m)} />}
        {step === 4 && <TrainingStep draft={draft} set={set} />}
      </div>

      <div className="onb-foot">
        {/* "Previous step", not "Back" — the focus step has a muscle chip called
            Back, and two buttons with the same name are a mess by screen reader. */}
        {step > 0 ? (
          <button className="onb-back" onClick={() => setStep(step - 1)} aria-label="Previous step">
            <IconBack />
          </button>
        ) : (
          <span className="onb-back-spacer" />
        )}
        <button
          className="btn acc onb-next"
          disabled={savePrefs.isPending}
          onClick={() => (last ? finish() : setStep(step + 1))}
        >
          {last ? (
            <>
              <IconCheck stroke="#0a0b0e" /> Finish
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
      {/* The single, clearly-labelled escape hatch: leave now with sensible
          defaults, marked onboarded so the wizard never reappears. */}
      <button className="onb-skipall" onClick={skipForNow} disabled={savePrefs.isPending}>
        Skip for now
      </button>
    </div>
  );
}

function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h1 className="onb-title">{title}</h1>
      <p className="onb-sub">{sub}</p>
    </>
  );
}

function WelcomeStep({ name, onName }: { name: string; onName: (v: string) => void }) {
  return (
    <>
      <StepHead title="Welcome 👋" sub="Let's set up your training in about a minute. You can change all of this later." />
      <label className="onb-field">
        <span>What should we call you?</span>
        <input
          autoFocus
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          aria-label="Your name"
        />
      </label>
    </>
  );
}

function BodyStep({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  return (
    <>
      <StepHead title="About you" sub="Used for your profile and weight trend. Every field is optional." />
      <div className="onb-row">
        <span className="onb-row-label">Sex</span>
        <Segmented value={draft.sex ?? ''} options={SEXES} onChange={(v) => set('sex', v)} ariaLabel="Sex" />
      </div>
      <div className="onb-grid">
        <label className="onb-field">
          <span>Birth year</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="1995"
            value={draft.birthYear}
            onChange={(e) => set('birthYear', e.target.value)}
            aria-label="Birth year"
          />
        </label>
        <label className="onb-field">
          <span>Height (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="178"
            value={draft.heightCm}
            onChange={(e) => set('heightCm', e.target.value)}
            aria-label="Height in cm"
          />
        </label>
        <label className="onb-field">
          <span>Weight now (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="80"
            value={draft.currentWeight}
            onChange={(e) => set('currentWeight', e.target.value)}
            aria-label="Current weight in kg"
          />
        </label>
        <label className="onb-field">
          <span>Goal weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="84"
            value={draft.goalWeight}
            onChange={(e) => set('goalWeight', e.target.value)}
            aria-label="Goal weight in kg"
          />
        </label>
      </div>
    </>
  );
}

function GoalStep({ goal, onGoal }: { goal: Goal; onGoal: (g: Goal) => void }) {
  return (
    <>
      <StepHead title="What are you training for?" sub="This shapes the rep ranges we suggest." />
      <GoalPicker value={goal} onChange={onGoal} />
    </>
  );
}

function FocusStep({ value, onChange }: { value: MuscleGroup[]; onChange: (m: MuscleGroup[]) => void }) {
  return (
    <>
      <StepHead
        title="Anything you want to prioritise?"
        sub="We'll push these muscles up your daily recommendation. Pick as many as you like — or none."
      />
      <MuscleChips value={value} onChange={onChange} />
    </>
  );
}

function TrainingStep({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  return (
    <>
      <StepHead title="How do you train?" sub="So sessions match the time and kit you actually have." />
      <div className="onb-row">
        <span className="onb-row-label">Experience</span>
        <Segmented
          value={draft.experience}
          options={EXPERIENCES}
          onChange={(v) => set('experience', v as Experience)}
          ariaLabel="Experience"
        />
      </div>
      <div className="onb-row">
        <span className="onb-row-label">Days / week</span>
        <Segmented
          value={String(draft.daysPerWeek)}
          options={DAYS_OPTIONS.map((d) => ({ value: String(d), label: String(d) }))}
          onChange={(v) => set('daysPerWeek', Number(v))}
          ariaLabel="Days per week"
        />
      </div>
      <div className="onb-row">
        <span className="onb-row-label">Session length</span>
        <Segmented
          value={String(draft.sessionMin)}
          options={SESSION_OPTIONS.map((m) => ({ value: String(m), label: `${m}m` }))}
          onChange={(v) => set('sessionMin', Number(v))}
          ariaLabel="Session length"
        />
      </div>
      <div className="onb-row">
        <span className="onb-row-label">Equipment</span>
        <Segmented
          value={draft.equipment}
          options={EQUIPMENT}
          onChange={(v) => set('equipment', v as Equipment)}
          ariaLabel="Equipment"
        />
      </div>
    </>
  );
}
