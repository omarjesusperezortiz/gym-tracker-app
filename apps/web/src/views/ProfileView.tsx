import '../styles/dataio-extras.css';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { catalog } from '@gym-tracker/core';
import { PageHeader } from '../components/PageHeader';
import type { BodyweightEntry, Equipment, Experience, UserPrefs } from '@gym-tracker/core';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';
import {
  DEFAULT_PREFS,
  useBodyweight,
  useLogBodyweight,
  usePersonalRecords,
  usePrefs,
  useSavePrefs,
} from '../lib/useProfileData';
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
import { makeYScale, smoothPath } from '../lib/chart';
import { humanDate } from '../lib/dates';
import { IconEdit, IconEmpty, IconSignOut } from '../lib/icons';
import { useWorkouts } from '../lib/useWorkouts';
import { downloadCSV, downloadJSON } from '../lib/exportData';

const KG_PER_LB = 0.45359237;
const REST_PRESETS = [60, 90, 120, 180];

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateLabel(iso: string): string {
  return humanDate(iso.slice(0, 10));
}

// Weights are stored in kg; prefs only change how they're shown and entered.
function fromKg(kg: number, units: UserPrefs['units']): number {
  return units === 'lb' ? kg / KG_PER_LB : kg;
}
function toKg(value: number, units: UserPrefs['units']): number {
  return units === 'lb' ? value * KG_PER_LB : value;
}
function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

export function ProfileView() {
  const { signOut, session } = useAuth();
  const { toast } = useToast();
  const prefsQuery = usePrefs();
  const bodyweightQuery = useBodyweight();
  const prsQuery = usePersonalRecords();
  const savePrefs = useSavePrefs();
  const logWeighIn = useLogBodyweight();
  const { history } = useWorkouts();

  const prefs = prefsQuery.data ?? DEFAULT_PREFS;
  const units = prefs.units;
  const log = bodyweightQuery.data ?? [];
  const latest = log.length ? log[log.length - 1] : null;
  const previous = log.length > 1 ? log[log.length - 2] : null;
  const deltaKg = latest && previous ? latest.weightKg - previous.weightKg : null;

  const [date, setDate] = useState(todayInput);
  const [weight, setWeight] = useState('');

  function updatePrefs(patch: Partial<UserPrefs>) {
    savePrefs.mutate(patch, {
      onError: (err) => toast(err.message || 'Could not save preferences'),
    });
  }

  function submitWeighIn(e: FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (!date || isNaN(value) || value <= 0) {
      toast('Enter a weight first');
      return;
    }
    logWeighIn.mutate(
      { date, weightKg: toKg(value, units) },
      {
        onSuccess: () => {
          setWeight('');
          toast('Weigh-in saved');
        },
        onError: (err) => toast(err.message || 'Could not save that weigh-in'),
      }
    );
  }

  const prs = (prsQuery.data ?? [])
    .filter((p) => p.bestWeight != null && p.bestWeight > 0)
    .sort((a, b) => (b.bestWeight ?? 0) - (a.bestWeight ?? 0))
    .slice(0, 8);

  function handleExport(format: 'csv' | 'json') {
    const workouts = history.filter((w) => w.type === 'workout');
    if (!workouts.length) {
      toast('No workouts to export yet');
      return;
    }
    const ok = format === 'csv' ? downloadCSV(workouts) : downloadJSON(workouts);
    toast(ok ? `Exported ${workouts.length} workouts as ${format.toUpperCase()}` : 'Downloads are not supported here');
  }

  const age = prefs.birthYear ? new Date().getFullYear() - prefs.birthYear : null;
  const email = session?.user?.email ?? null;

  return (
    <div className="profile">
      <PageHeader
        title={prefs.displayName ? `Hey, ${prefs.displayName}` : 'Profile'}
        subtitle={`${age ? `${age} · ` : ''}Everything here saves as you change it.`}
      />

      <div className="sec-label">Account</div>
      <div className="pcard">
        <div className="prow">
          <div className="plabel">Signed in as</div>
          <div className="pval-email" title={email ?? undefined}>
            {email ?? '—'}
          </div>
        </div>
        {/* Flipping onboarded back off sends you through the wizard again, with
            your current answers pre-filled. */}
        <button className="btn sec profile-redo" onClick={() => updatePrefs({ onboarded: false })}>
          <IconEdit /> Redo onboarding
        </button>
        <button className="btn sec profile-signout" onClick={() => void signOut()}>
          <IconSignOut /> Log out
        </button>

        <div className="dataio">
          <p className="dataio-hint">Download all your workout data.</p>
          <div className="dataio-actions">
            <button className="btn sec" onClick={() => handleExport('csv')}>
              <IconDownload /> Export CSV
            </button>
            <button className="btn sec" onClick={() => handleExport('json')}>
              <IconDownload /> Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="sec-label">About you</div>
      <div className="pcard">
        <InlinePref
          label="Name"
          value={prefs.displayName ?? ''}
          placeholder="Your name"
          onCommit={(v) => updatePrefs({ displayName: v.trim() || null })}
        />
        <div className="prow">
          <div className="plabel">Sex</div>
          <Segmented value={prefs.sex ?? ''} options={SEXES} onChange={(v) => updatePrefs({ sex: v })} ariaLabel="Sex" />
        </div>
        <InlinePref
          label="Birth year"
          value={prefs.birthYear ? String(prefs.birthYear) : ''}
          placeholder="1995"
          numeric
          onCommit={(v) => updatePrefs({ birthYear: v ? Number(v) : null })}
        />
        <InlinePref
          label="Height (cm)"
          value={prefs.heightCm ? String(prefs.heightCm) : ''}
          placeholder="178"
          numeric
          onCommit={(v) => updatePrefs({ heightCm: v ? Number(v) : null })}
        />
        <InlinePref
          label={`Goal weight (${units})`}
          value={prefs.goalWeightKg ? fmt(fromKg(prefs.goalWeightKg, units)) : ''}
          placeholder={units === 'lb' ? '185' : '84'}
          numeric
          onCommit={(v) => updatePrefs({ goalWeightKg: v ? toKg(Number(v), units) : null })}
        />
      </div>

      <div className="sec-label">Goal &amp; focus</div>
      <div className="pcard">
        <GoalPicker value={prefs.goal} onChange={(goal) => updatePrefs({ goal })} />
        <div className="pdivide">
          <div className="plabel">Focus muscles</div>
          <div className="phint">Prioritised in your daily recommendation.</div>
          <MuscleChips value={prefs.focusMuscles} onChange={(focusMuscles) => updatePrefs({ focusMuscles })} />
        </div>
      </div>

      <div className="sec-label">Bodyweight</div>
      <div className="pcard">
        {latest ? (
          <div className="bw-head">
            <div>
              <div className="bw-now">
                {fmt(fromKg(latest.weightKg, units))}
                <span className="bw-unit">{units}</span>
              </div>
              <div className="bw-meta">
                {dateLabel(latest.date)}
                {deltaKg != null && (
                  <>
                    {' · '}
                    <span className={deltaKg > 0 ? 'up' : deltaKg < 0 ? 'down' : ''}>
                      {deltaKg > 0 ? '+' : ''}
                      {fmt(fromKg(deltaKg, units))} {units}
                    </span>
                    {' vs last'}
                  </>
                )}
              </div>
            </div>
            <Sparkline log={log} units={units} />
          </div>
        ) : (
          <div className="pempty">No weigh-ins yet — add your first one below.</div>
        )}

        <form className="bw-form" onSubmit={submitWeighIn}>
          <input aria-label="Weigh-in date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input
            aria-label={`Weight in ${units}`}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder={units}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <button className="btn acc bw-add" type="submit" disabled={logWeighIn.isPending}>
            Add
          </button>
        </form>

        {log.length > 0 && (
          <div className="bw-list">
            {log
              .slice()
              .reverse()
              .slice(0, 5)
              .map((e) => (
                <div className="bw-row" key={e.id}>
                  <span>{dateLabel(e.date)}</span>
                  <b>
                    {fmt(fromKg(e.weightKg, units))} {units}
                  </b>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="sec-label">Training preferences</div>
      <div className="pcard">
        <div className="prow">
          <div className="plabel">Experience</div>
          <Segmented
            value={prefs.experience}
            options={EXPERIENCES}
            onChange={(v) => updatePrefs({ experience: v as Experience })}
            ariaLabel="Experience"
          />
        </div>
        <div className="prow">
          <div className="plabel">Days / week</div>
          <Segmented
            value={String(prefs.daysPerWeek)}
            options={DAYS_OPTIONS.map((d) => ({ value: String(d), label: String(d) }))}
            onChange={(v) => updatePrefs({ daysPerWeek: Number(v) })}
            ariaLabel="Days per week"
          />
        </div>
        <div className="prow">
          <div className="plabel">Session length</div>
          <Segmented
            value={String(prefs.sessionMin)}
            options={SESSION_OPTIONS.map((m) => ({ value: String(m), label: `${m}m` }))}
            onChange={(v) => updatePrefs({ sessionMin: Number(v) })}
            ariaLabel="Session length"
          />
        </div>
        <div className="prow">
          <div className="plabel">Equipment</div>
          <Segmented
            value={prefs.equipment}
            options={EQUIPMENT}
            onChange={(v) => updatePrefs({ equipment: v as Equipment })}
            ariaLabel="Equipment"
          />
        </div>
        <div className="prow">
          <div className="plabel">Units</div>
          <Segmented
            value={units}
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lb', label: 'lb' },
            ]}
            onChange={(v) => updatePrefs({ units: v as UserPrefs['units'] })}
            ariaLabel="Units"
          />
        </div>
        <div className="prow">
          <div className="plabel">Default plan</div>
          <Segmented
            value={prefs.defaultPlan}
            options={Object.entries(catalog.plans).map(([key, plan]) => ({ value: key, label: plan.label }))}
            onChange={(v) => updatePrefs({ defaultPlan: v })}
            ariaLabel="Default plan"
          />
        </div>
        <div className="prow">
          <div className="plabel">Rest timer</div>
          <Segmented
            value={String(prefs.restSeconds)}
            options={REST_PRESETS.map((s) => ({ value: String(s), label: `${s}s` }))}
            onChange={(v) => updatePrefs({ restSeconds: Number(v) })}
            ariaLabel="Rest timer"
          />
        </div>
      </div>

      <div className="sec-label">Personal records</div>
      <div className="pcard">
        {prs.length ? (
          <div className="pr-list">
            {prs.map((pr, i) => (
              <div className="pr-row" key={pr.slot}>
                <span className="pr-rank">{i + 1}</span>
                <span className="pr-slot">{pr.slot}</span>
                <b className="pr-val">
                  {fmt(fromKg(pr.bestWeight ?? 0, units))} {units}
                </b>
              </div>
            ))}
          </div>
        ) : (
          <div className="pempty">
            <IconEmpty />
            <br />
            No records yet — finish a workout with weights to set your first.
          </div>
        )}
      </div>
    </div>
  );
}

// Text/number pref that commits on blur (or Enter) instead of on every
// keystroke, so typing a height doesn't fire a write per digit.
function InlinePref({
  label,
  value,
  placeholder,
  numeric,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  numeric?: boolean;
  onCommit: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  // Re-sync when the saved value changes underneath (the prefs query resolving,
  // or an edit elsewhere) — but never while this field has focus, or a slow
  // fetch landing mid-word would overwrite what's being typed.
  useEffect(() => {
    if (document.activeElement !== ref.current) setDraft(value);
  }, [value]);

  return (
    <div className="prow">
      <div className="plabel">{label}</div>
      <input
        ref={ref}
        className="pinput"
        aria-label={label}
        type={numeric ? 'number' : 'text'}
        inputMode={numeric ? 'decimal' : undefined}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onCommit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
}

// Small local download glyph — icons.tsx has no download icon and it's owned by
// another view, so this stays inline here.
function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function Sparkline({ log, units }: { log: BodyweightEntry[]; units: UserPrefs['units'] }) {
  if (log.length < 2) return null;
  const W = 108;
  const H = 40;
  const pad = 4;
  const values = log.map((e) => fromKg(e.weightKg, units));
  const { y } = makeYScale(values, pad, H - pad, 0.2);
  const points = values.map((v, i) => ({ x: pad + (i / (values.length - 1)) * (W - pad * 2), y: y(v) }));
  return (
    <svg className="bw-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bodyweight trend">
      <path d={smoothPath(points)} fill="none" stroke="var(--acc)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={points[points.length - 1].x.toFixed(1)} cy={points[points.length - 1].y.toFixed(1)} r={3} fill="var(--acc)" />
    </svg>
  );
}
