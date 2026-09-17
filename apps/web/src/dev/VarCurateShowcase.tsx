import { useEffect, useMemo, useState } from 'react';

interface Candidate {
  slot: string;        // catalog movement, e.g. "Biceps curl"
  kind: string;        // 'db' | 'cable' | 'bar'
  label: string;       // proposed variation name, e.g. "Hammer Curl"
  exerciseId: string;  // exercisedb id (also the gif filename)
  name: string;        // exercisedb name (may not match label)
  gifUrl: string;      // exercisedb CDN (unused — we mirror locally)
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}

type Verdict = 'approve' | 'reject' | 'unset';

const STORAGE_KEY = 'varcurate.verdicts.v1';
const BASE = `${import.meta.env.BASE_URL}variation-candidates/`;

// One-off curation tool for tier-1 variations. Renders every candidate exercise
// as an approve/reject card so Omar can flip through on his phone and tell us
// which ones actually match their proposed label — then paste the approved-set
// JSON back into the chat so we can wire them into the real catalog.
export function VarCurateShowcase() {
  const [items, setItems] = useState<Candidate[] | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${BASE}candidates.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setItems)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verdicts));
    } catch {
      // ignore
    }
  }, [verdicts]);

  const groups = useMemo(() => {
    if (!items) return [] as { title: string; kind: string; rows: Candidate[] }[];
    const map = new Map<string, Candidate[]>();
    for (const it of items) {
      const key = `${it.slot} · ${it.kind}`;
      const list = map.get(key) ?? [];
      list.push(it);
      map.set(key, list);
    }
    return [...map.entries()].map(([, rows]) => ({
      title: rows[0].slot,
      kind: rows[0].kind,
      rows,
    }));
  }, [items]);

  const stats = useMemo(() => {
    if (!items) return { approved: 0, rejected: 0, unset: 0 };
    let a = 0, r = 0, u = 0;
    for (const it of items) {
      const v = verdicts[it.exerciseId] ?? 'unset';
      if (v === 'approve') a++;
      else if (v === 'reject') r++;
      else u++;
    }
    return { approved: a, rejected: r, unset: u };
  }, [items, verdicts]);

  function setVerdict(id: string, v: Verdict) {
    setVerdicts((prev) => ({ ...prev, [id]: v }));
  }

  function reset() {
    if (!confirm('Reset all verdicts?')) return;
    setVerdicts({});
  }

  async function copyApproved() {
    if (!items) return;
    const approved = items
      .filter((it) => (verdicts[it.exerciseId] ?? 'unset') === 'approve')
      .map((it) => ({
        slot: it.slot,
        kind: it.kind,
        label: it.label,
        exerciseId: it.exerciseId,
        name: it.name,
        target: it.targetMuscles[0] ?? '',
        secondary: it.secondaryMuscles,
        equipments: it.equipments,
        steps: it.instructions.map((s) => s.replace(/^Step:\d+\s*/i, '')),
      }));
    const payload = JSON.stringify(approved, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // fallback: dump into a textarea the user can select
      const ta = document.getElementById('varcurate-fallback') as HTMLTextAreaElement | null;
      if (ta) {
        ta.value = payload;
        ta.style.display = 'block';
        ta.focus();
        ta.select();
      }
    }
  }

  if (error) {
    return (
      <div className="varcurate-shell">
        <div className="vc-err">Couldn't load candidates.json: {error}</div>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="varcurate-shell">
        <div className="vc-loading">Loading candidates…</div>
      </div>
    );
  }

  return (
    <div className="varcurate-shell">
      <header className="vc-head">
        <div>
          <div className="vc-title">Variation curation</div>
          <div className="vc-sub">
            Approve or reject each proposed variation. Tap the card to zoom the demo.
          </div>
        </div>
        <div className="vc-stats">
          <span className="vc-stat vc-stat-a">✓ {stats.approved}</span>
          <span className="vc-stat vc-stat-r">✗ {stats.rejected}</span>
          <span className="vc-stat vc-stat-u">· {stats.unset}</span>
        </div>
      </header>

      {groups.map((g) => (
        <section key={`${g.title}-${g.kind}`} className="vc-group">
          <h2 className="vc-group-title">
            {g.title} <span className="vc-group-kind">{g.kind.toUpperCase()}</span>
          </h2>
          <div className="vc-list">
            {g.rows.map((it) => {
              const v = verdicts[it.exerciseId] ?? 'unset';
              return (
                <article key={it.exerciseId} className={`vc-card vc-${v}`}>
                  <div className="vc-media">
                    <img src={`${BASE}${it.exerciseId}.gif`} alt={it.label} loading="lazy" />
                  </div>
                  <div className="vc-info">
                    <div className="vc-label">{it.label}</div>
                    <div className="vc-realname">exercisedb: {it.name}</div>
                    <div className="vc-tags">
                      {it.targetMuscles[0] && <span className="vc-tag vc-tag-p">{it.targetMuscles[0]}</span>}
                      {it.equipments.map((e) => (
                        <span key={e} className="vc-tag">{e}</span>
                      ))}
                    </div>
                    <div className="vc-actions">
                      <button
                        type="button"
                        className={`vc-btn vc-btn-r${v === 'reject' ? ' on' : ''}`}
                        onClick={() => setVerdict(it.exerciseId, v === 'reject' ? 'unset' : 'reject')}
                      >
                        ✗ Reject
                      </button>
                      <button
                        type="button"
                        className={`vc-btn vc-btn-a${v === 'approve' ? ' on' : ''}`}
                        onClick={() => setVerdict(it.exerciseId, v === 'approve' ? 'unset' : 'approve')}
                      >
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <footer className="vc-foot">
        <button type="button" className="vc-copy" onClick={copyApproved}>
          {copied ? '✓ Copied' : `Copy ${stats.approved} approved as JSON`}
        </button>
        <button type="button" className="vc-reset" onClick={reset}>
          Reset verdicts
        </button>
        <textarea id="varcurate-fallback" readOnly style={{ display: 'none' }} />
      </footer>
    </div>
  );
}
