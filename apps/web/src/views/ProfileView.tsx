import { useState, type FormEvent } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { catalog } from '@gym-tracker/core';
import type { BodyweightEntry, UserPrefs } from '@gym-tracker/core';
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
import { makeYScale, smoothPath } from '../lib/chart';
import { IconEmpty, IconSignOut } from '../lib/icons';

const KG_PER_LB = 0.45359237;
const REST_PRESETS = [60, 90, 120, 180];

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateLabel(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// The log is stored in kg; prefs only change how it's shown and entered.
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
  const { signOut } = useAuth();
  const { toast } = useToast();
  const prefsQuery = usePrefs();
  const bodyweightQuery = useBodyweight();
  const prsQuery = usePersonalRecords();
  const savePrefs = useSavePrefs();
  const logWeighIn = useLogBodyweight();

  const prefs = prefsQuery.data ?? DEFAULT_PREFS;
  const units = prefs.units;
  const log = bodyweightQuery.data ?? [];
  const latest = log.length ? log[log.length - 1] : null;
  const previous = log.length > 1 ? log[log.length - 2] : null;
  const deltaKg = latest && previous ? latest.weightKg - previous.weightKg : null;

  const [date, setDate] = useState(todayInput);
  const [weight, setWeight] = useState('');

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

  function updatePrefs(patch: Partial<UserPrefs>) {
    savePrefs.mutate(patch, {
      onError: (err) => toast(err.message || 'Could not save preferences'),
    });
  }

  const prs = (prsQuery.data ?? [])
    .filter((p) => p.bestWeight != null && p.bestWeight > 0)
    .sort((a, b) => (b.bestWeight ?? 0) - (a.bestWeight ?? 0))
    .slice(0, 8);

  return (
    <div className="profile">
      <div className="view-title">Profile</div>
      <div className="view-sub">Your body, your settings, your records.</div>

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

      <div className="sec-label">Goals &amp; preferences</div>
      <div className="pcard">
        <div className="prow">
          <div className="plabel">Units</div>
          <Segmented
            value={units}
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lb', label: 'lb' },
            ]}
            onChange={(v) => updatePrefs({ units: v as UserPrefs['units'] })}
          />
        </div>
        <div className="prow">
          <div className="plabel">Default plan</div>
          <Segmented
            value={prefs.defaultPlan}
            options={Object.entries(catalog.plans).map(([key, plan]) => ({ value: key, label: plan.label }))}
            onChange={(v) => updatePrefs({ defaultPlan: v })}
          />
        </div>
        <div className="prow">
          <div className="plabel">Rest timer</div>
          <Segmented
            value={String(prefs.restSeconds)}
            options={REST_PRESETS.map((s) => ({ value: String(s), label: `${s}s` }))}
            onChange={(v) => updatePrefs({ restSeconds: Number(v) })}
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

      <div className="sec-label">Account</div>
      <div className="pcard">
        <button className="btn sec profile-signout" onClick={() => void signOut()}>
          <IconSignOut /> Log out
        </button>
      </div>
    </div>
  );
}

// Same look as the Train screen's equipment switcher (.seg), on Radix
// ToggleGroup for keyboard/aria support.
function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      className="seg seg-inline"
      value={value}
      // Single-select deselects when you tap the active item; a setting always
      // has exactly one value, so an empty change is ignored.
      onValueChange={(next) => next && onChange(next)}
    >
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className={`segi${o.value === value ? ' active' : ''}`}>
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
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
