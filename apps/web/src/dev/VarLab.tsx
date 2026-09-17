import { useEffect, useMemo, useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  body: string[];
  target: string[];
  secondary: string[];
  equip: string[];
  steps: string[];
}
interface Family {
  family: string;
  label: string;
  canonical: Exercise;
  duplicates: Exercise[];
}
interface Proposal {
  movement: string;
  kind: string;
  families: Family[];
  excluded: Exercise[];
}
type Verdict = 'approve' | 'reject' | 'unset';

const BASE = import.meta.env.BASE_URL;
const PROPOSAL_URL = `${BASE}edb/variations-biceps-db.json`;
const MEDIA_URL = `${BASE}exercise-media/`;
const STORAGE_KEY = 'varlab.verdicts.v1';

// The variation lab: reviews an algorithm's proposed grouping of ExerciseDB
// entries into "canonical variation families" for one (movement × kind) pair.
// Reached at /#/test/varlab. Desktop-first.
//
// For each proposed family the user can:
//   ✓ Approve  → this family goes into the catalog's alts[] for the movement
//   ✗ Reject   → this family is not a real distinct variation
//   Swap canonical → any duplicate can be promoted to canonical (or click alt)
//
// The excluded (compound / wrist / etc) block shows what the classifier
// deliberately kept OUT so you can catch mistakes.
//
// NOTHING GETS DELETED FROM THE LIBRARY — this only decides which exercises
// are exposed as canonical variations for the workout picker.
export function VarLab() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  // Track which id (canonical or duplicate) is currently the CHOSEN canonical
  // in each family. Defaults to the algorithm's pick.
  const [chosenId, setChosenId] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY + '.chosen') || '{}');
    } catch {
      return {};
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(PROPOSAL_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setProposal)
      .catch((e) => setErr(String(e)));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verdicts));
    localStorage.setItem(STORAGE_KEY + '.chosen', JSON.stringify(chosenId));
  }, [verdicts, chosenId]);

  const stats = useMemo(() => {
    if (!proposal) return { approved: 0, rejected: 0, unset: 0 };
    let a = 0, r = 0, u = 0;
    for (const f of proposal.families) {
      const v = verdicts[f.family] ?? 'unset';
      if (v === 'approve') a++;
      else if (v === 'reject') r++;
      else u++;
    }
    return { approved: a, rejected: r, unset: u };
  }, [proposal, verdicts]);

  function setV(fam: string, v: Verdict) {
    setVerdicts((prev) => ({ ...prev, [fam]: v === (prev[fam] ?? 'unset') ? 'unset' : v }));
  }
  function chooseCanonical(family: string, id: string) {
    setChosenId((prev) => ({ ...prev, [family]: id }));
  }

  async function copyApproved() {
    if (!proposal) return;
    const approved = proposal.families
      .filter((f) => (verdicts[f.family] ?? 'unset') === 'approve')
      .map((f) => {
        const chosen = chosenId[f.family] ?? f.canonical.id;
        const all = [f.canonical, ...f.duplicates];
        const canonical = all.find((e) => e.id === chosen) ?? f.canonical;
        return {
          movement: proposal.movement,
          kind: proposal.kind,
          family: f.family,
          label: f.label,
          canonical: { id: canonical.id, name: canonical.name, target: canonical.target, secondary: canonical.secondary, steps: canonical.steps },
          alternates: all.filter((e) => e.id !== canonical.id).map((e) => ({ id: e.id, name: e.name })),
        };
      });
    const payload = JSON.stringify(approved, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      const ta = document.getElementById('vl-fallback') as HTMLTextAreaElement | null;
      if (ta) {
        ta.value = payload;
        ta.style.display = 'block';
        ta.focus();
        ta.select();
      }
    }
  }

  if (err) return <div className="vl-err">Failed to load: {err}</div>;
  if (!proposal) return <div className="vl-loading">Loading proposal…</div>;

  return (
    <div className="vl-app">
      <header className="vl-head">
        <div className="vl-head-l">
          <div className="vl-crumb">Variation lab · test #1</div>
          <div className="vl-title">
            {proposal.movement} <span className="vl-kind">· {proposal.kind.toUpperCase()}</span>
          </div>
          <div className="vl-sub">
            Algorithm proposes {proposal.families.length} variation families
            from ExerciseDB's {proposal.families.reduce((n, f) => n + 1 + f.duplicates.length, 0) + proposal.excluded.length} biceps+dumbbell entries.
            <b> Nothing gets deleted</b> — this only decides which show up in the workout picker.
          </div>
        </div>
        <div className="vl-head-r">
          <div className="vl-stats">
            <span className="vl-stat vl-stat-a">✓ {stats.approved}</span>
            <span className="vl-stat vl-stat-r">✗ {stats.rejected}</span>
            <span className="vl-stat vl-stat-u">· {stats.unset}</span>
          </div>
          <button className="vl-copy" onClick={copyApproved}>
            {copied ? '✓ Copied' : `Copy ${stats.approved} approved as JSON`}
          </button>
        </div>
      </header>

      <div className="vl-grid">
        {proposal.families.map((f) => {
          const v = verdicts[f.family] ?? 'unset';
          const chosen = chosenId[f.family] ?? f.canonical.id;
          const all = [f.canonical, ...f.duplicates];
          const canonicalNow = all.find((e) => e.id === chosen) ?? f.canonical;
          return (
            <article key={f.family} className={`vl-card vl-${v}`}>
              <header className="vl-card-h">
                <div className="vl-card-h-l">
                  <div className="vl-card-label">{f.label}</div>
                  <div className="vl-card-family">{f.family} · {all.length} exercise{all.length > 1 ? 's' : ''}</div>
                </div>
                <div className="vl-card-actions">
                  <button className={`vl-btn vl-btn-r${v === 'reject' ? ' on' : ''}`} onClick={() => setV(f.family, 'reject')}>
                    ✗
                  </button>
                  <button className={`vl-btn vl-btn-a${v === 'approve' ? ' on' : ''}`} onClick={() => setV(f.family, 'approve')}>
                    ✓
                  </button>
                </div>
              </header>
              <div className="vl-canonical">
                <img className="vl-canonical-img" src={`${MEDIA_URL}${canonicalNow.id}.webp`} alt="" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')} />
                <div className="vl-canonical-info">
                  <div className="vl-canonical-name">{canonicalNow.name}</div>
                  <div className="vl-canonical-id">{canonicalNow.id} · canonical</div>
                </div>
              </div>
              {all.length > 1 && (
                <>
                  <div className="vl-alt-head">Also in this family ({all.length - 1})</div>
                  <div className="vl-alts">
                    {all
                      .filter((e) => e.id !== canonicalNow.id)
                      .map((e) => (
                        <button
                          key={e.id}
                          className="vl-alt"
                          onClick={() => chooseCanonical(f.family, e.id)}
                          title="Click to promote to canonical"
                        >
                          <img src={`${MEDIA_URL}${e.id}.webp`} alt="" onError={(ev) => ((ev.target as HTMLImageElement).style.opacity = '0.15')} />
                          <span className="vl-alt-name">{e.name}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <section className="vl-excluded-sec">
        <h2 className="vl-excluded-h">Excluded ({proposal.excluded.length})</h2>
        <p className="vl-excluded-sub">
          These are in the library but NOT proposed as biceps+DB variations — they're compound moves (curl + squat/lunge) or wrist curls
          mistagged as biceps. Kept visible so you can catch classifier errors.
        </p>
        <div className="vl-excl-grid">
          {proposal.excluded.map((e) => (
            <div key={e.id} className="vl-excl">
              <img src={`${MEDIA_URL}${e.id}.webp`} alt="" onError={(ev) => ((ev.target as HTMLImageElement).style.opacity = '0.15')} />
              <span className="vl-excl-name">{e.name}</span>
            </div>
          ))}
        </div>
      </section>

      <textarea id="vl-fallback" readOnly style={{ display: 'none' }} />
    </div>
  );
}
