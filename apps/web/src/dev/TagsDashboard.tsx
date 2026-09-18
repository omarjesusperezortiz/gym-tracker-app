import { useEffect, useMemo, useState } from 'react';

interface VTags {
  equipment_required: string[];
  equipment_visible: string;
  compound: boolean;
  quality_flag: string;
  position: string;
  arms: string;
  grip: string;
}
interface Exercise {
  id: string;
  name: string;
  body: string[];
  target: string[];
  secondary: string[];
  equip: string[];
  steps: string[];
  vtags?: VTags;
}

const BASE = import.meta.env.BASE_URL;
const DATA_URL = `${BASE}edb/exercises.tagged.json`;
const MEDIA_URL = `${BASE}exercise-media/`;

// Compare edb equip vs vtags equipment_visible to auto-flag likely mislabels.
function mismatchFlag(ex: Exercise): boolean {
  if (!ex.vtags) return false;
  const declared = ex.equip.map((e) => e.toLowerCase().replace(/\s+/g, '-'));
  const visible = ex.vtags.equipment_visible;
  if (!visible || visible === 'none-visible' || visible === 'body-only') return false;
  // Treat "leverage-machine" and "machine" as same
  const norm = (s: string) => s.replace('leverage-', '').replace(/-.+$/, '');
  return !declared.some((d) => norm(d).startsWith(norm(visible)) || norm(visible).startsWith(norm(d)));
}

// Desktop dashboard for the vision-derived tags. Mirrors /#/test/edb layout
// but adds facets for every vtag so we can verify quality on the pilot set
// (currently just the 100 biceps) before running the whole library.
export function TagsDashboard() {
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [tagFilters, setTagFilters] = useState<Record<string, string | null>>({
    position: null, grip: null, arms: null, equipment_visible: null,
    compound: null, quality_flag: null, mismatch: null,
  });
  const [equipReqFilter, setEquipReqFilter] = useState<Set<string>>(new Set());
  const [onlyTagged, setOnlyTagged] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setItems)
      .catch((e) => setErr(String(e)));
  }, []);

  const facets = useMemo(() => {
    if (!items) return null;
    const tagged = items.filter((x) => x.vtags);
    const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
    const position = new Map<string, number>();
    const grip = new Map<string, number>();
    const arms = new Map<string, number>();
    const equipment_visible = new Map<string, number>();
    const compound = new Map<string, number>();
    const quality = new Map<string, number>();
    const equipment_required = new Map<string, number>();
    for (const x of tagged) {
      const v = x.vtags!;
      bump(position, v.position);
      bump(grip, v.grip);
      bump(arms, v.arms);
      bump(equipment_visible, v.equipment_visible);
      bump(compound, String(v.compound));
      bump(quality, v.quality_flag);
      for (const eq of v.equipment_required) bump(equipment_required, eq);
    }
    const mismatchCount = tagged.filter(mismatchFlag).length;
    return {
      total: items.length,
      tagged: tagged.length,
      mismatches: mismatchCount,
      position, grip, arms, equipment_visible, compound, quality, equipment_required,
    };
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const query = q.trim().toLowerCase();
    return items.filter((x) => {
      if (onlyTagged && !x.vtags) return false;
      if (query && !(x.name + ' ' + (x.vtags?.position ?? '') + ' ' + x.equip.join(' ')).toLowerCase().includes(query)) return false;
      for (const [k, v] of Object.entries(tagFilters)) {
        if (!v) continue;
        if (k === 'mismatch') {
          if (v === 'true' && !mismatchFlag(x)) return false;
          continue;
        }
        const tv = x.vtags && (x.vtags as unknown as Record<string, unknown>)[k];
        if (String(tv) !== v) return false;
      }
      if (equipReqFilter.size > 0) {
        const req = new Set(x.vtags?.equipment_required ?? []);
        for (const need of equipReqFilter) {
          if (!req.has(need)) return false;
        }
      }
      return true;
    });
  }, [items, q, onlyTagged, tagFilters, equipReqFilter]);

  const selectedExercise = useMemo(
    () => (selected && items ? items.find((x) => x.id === selected) ?? null : null),
    [selected, items],
  );

  function setTag(k: string, v: string | null) {
    setTagFilters((prev) => ({ ...prev, [k]: prev[k] === v ? null : v }));
  }
  function toggleReq(k: string) {
    setEquipReqFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }
  function reset() {
    setQ('');
    setTagFilters({
      position: null, grip: null, arms: null, equipment_visible: null,
      compound: null, quality_flag: null, mismatch: null,
    });
    setEquipReqFilter(new Set());
  }

  if (err) return <div className="tags-err">Failed to load: {err}</div>;
  if (!items || !facets) return <div className="tags-loading">Loading tagged dataset…</div>;

  return (
    <div className="tags-app">
      <aside className="tags-side">
        <div className="tags-brand">
          <div className="tags-brand-t">Tags dashboard</div>
          <div className="tags-brand-s">
            {facets.tagged.toLocaleString()} tagged of {facets.total.toLocaleString()}
            {facets.mismatches > 0 && (
              <> · <span className="tags-brand-warn">{facets.mismatches} mismatch{facets.mismatches !== 1 ? 'es' : ''}</span></>
            )}
          </div>
        </div>

        <div className="tags-searchbox">
          <input
            className="tags-search"
            type="search"
            placeholder="Search name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && <button className="tags-search-x" onClick={() => setQ('')}>✕</button>}
        </div>

        <label className="tags-toggle">
          <input type="checkbox" checked={onlyTagged} onChange={(e) => setOnlyTagged(e.target.checked)} />
          Only show tagged
        </label>

        <FacetSection title="Auto-audit">
          <RadioFacet label="Any" active={tagFilters.mismatch === null} onClick={() => setTag('mismatch', null)} />
          <RadioFacet label="Mismatched (name ≠ visible)" active={tagFilters.mismatch === 'true'} onClick={() => setTag('mismatch', 'true')} count={facets.mismatches} kind="warn" />
        </FacetSection>

        <FacetGroup title="Position" facet={facets.position} active={tagFilters.position} onPick={(v) => setTag('position', v)} />
        <FacetGroup title="Grip" facet={facets.grip} active={tagFilters.grip} onPick={(v) => setTag('grip', v)} />
        <FacetGroup title="Arms" facet={facets.arms} active={tagFilters.arms} onPick={(v) => setTag('arms', v)} />
        <FacetGroup title="Equipment visible" facet={facets.equipment_visible} active={tagFilters.equipment_visible} onPick={(v) => setTag('equipment_visible', v)} />
        <FacetGroup title="Compound?" facet={facets.compound} active={tagFilters.compound} onPick={(v) => setTag('compound', v)} />
        <FacetGroup title="Quality" facet={facets.quality} active={tagFilters.quality_flag} onPick={(v) => setTag('quality_flag', v)} />

        <FilterSection title="Equipment required (all match)">
          {[...facets.equipment_required.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <CheckFacet key={name} label={name} count={count} active={equipReqFilter.has(name)} onClick={() => toggleReq(name)} />
            ))}
        </FilterSection>

        <button className="tags-reset" onClick={reset}>Reset filters</button>
      </aside>

      <main className="tags-main">
        <header className="tags-mainhead">
          <div>
            <div className="tags-crumb">Vision-tagged library</div>
            <h1 className="tags-h1">{filtered.length.toLocaleString()} exercises</h1>
          </div>
        </header>

        <div className="tags-grid">
          {filtered.slice(0, 300).map((x) => {
            const mm = mismatchFlag(x);
            return (
              <button key={x.id} className={`tag-card${mm ? ' mm' : ''}`} onClick={() => setSelected(selected === x.id ? null : x.id)}>
                <div className="tag-card-media">
                  <img src={`${MEDIA_URL}${x.id}.webp`} alt="" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')} />
                  {mm && <span className="tag-card-mm">≠</span>}
                </div>
                <div className="tag-card-body">
                  <div className="tag-card-name">{x.name}</div>
                  {x.vtags && (
                    <div className="tag-card-tags">
                      <span className="tag-mini t-pos">{x.vtags.position}</span>
                      <span className="tag-mini t-grip">{x.vtags.grip}</span>
                      <span className="tag-mini t-arms">{x.vtags.arms}</span>
                      {x.vtags.compound && <span className="tag-mini t-warn">compound</span>}
                      {x.vtags.quality_flag !== 'good' && <span className="tag-mini t-warn">{x.vtags.quality_flag}</span>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length > 300 && <div className="tags-more">Showing first 300 of {filtered.length.toLocaleString()}. Refine filters to narrow.</div>}
      </main>

      {selectedExercise && (
        <aside className="tags-detail">
          <button className="tags-detail-x" onClick={() => setSelected(null)}>✕</button>
          <div className="tags-detail-media">
            <img src={`${MEDIA_URL}${selectedExercise.id}.webp`} alt={selectedExercise.name} onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')} />
          </div>
          <h2 className="tags-detail-title">{selectedExercise.name}</h2>
          <div className="tags-detail-id">{selectedExercise.id}</div>

          <div className="tags-section">
            <div className="tags-section-h">From ExerciseDB</div>
            <KV k="Body" v={selectedExercise.body.join(', ')} />
            <KV k="Target" v={selectedExercise.target.join(', ')} />
            <KV k="Secondary" v={selectedExercise.secondary.join(', ')} />
            <KV k="Equip" v={selectedExercise.equip.join(', ')} />
          </div>

          {selectedExercise.vtags && (
            <div className="tags-section">
              <div className="tags-section-h">Vision-derived (vtags)</div>
              <KV k="Position" v={selectedExercise.vtags.position} />
              <KV k="Grip" v={selectedExercise.vtags.grip} />
              <KV k="Arms" v={selectedExercise.vtags.arms} />
              <KV k="Equip visible" v={selectedExercise.vtags.equipment_visible} highlight={mismatchFlag(selectedExercise)} />
              <KV k="Equip required" v={selectedExercise.vtags.equipment_required.join(', ')} />
              <KV k="Compound" v={String(selectedExercise.vtags.compound)} highlight={selectedExercise.vtags.compound} />
              <KV k="Quality" v={selectedExercise.vtags.quality_flag} highlight={selectedExercise.vtags.quality_flag !== 'good'} />
              {mismatchFlag(selectedExercise) && (
                <div className="tags-mm-alert">⚠ Equipment mismatch: EDB says "{selectedExercise.equip.join(', ')}", vision sees "{selectedExercise.vtags.equipment_visible}"</div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="tags-facet">
      <h3 className="tags-facet-h">{title}</h3>
      <div className="tags-facet-list">{children}</div>
    </section>
  );
}
function FacetGroup({ title, facet, active, onPick }: { title: string; facet: Map<string, number>; active: string | null; onPick: (v: string | null) => void }) {
  const rows = [...facet.entries()].sort((a, b) => b[1] - a[1]);
  return (
    <FacetSection title={title}>
      <RadioFacet label="Any" active={active === null} onClick={() => onPick(null)} />
      {rows.map(([v, c]) => (
        <RadioFacet key={v} label={v} count={c} active={active === v} onClick={() => onPick(v)} />
      ))}
    </FacetSection>
  );
}
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <FacetSection title={title}>{children}</FacetSection>;
}
function RadioFacet({ label, count, active, onClick, kind }: { label: string; count?: number; active: boolean; onClick: () => void; kind?: 'warn' }) {
  return (
    <button className={`tags-radio${active ? ' on' : ''}${kind === 'warn' ? ' warn' : ''}`} onClick={onClick}>
      <span className="tags-radio-dot" />
      <span className="tags-radio-lbl">{label}</span>
      {count !== undefined && <span className="tags-radio-count">{count}</span>}
    </button>
  );
}
function CheckFacet({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button className={`tags-check${active ? ' on' : ''}`} onClick={onClick}>
      <span className="tags-check-box">{active ? '✓' : ''}</span>
      <span className="tags-check-lbl">{label}</span>
      <span className="tags-check-count">{count}</span>
    </button>
  );
}
function KV({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className={`tags-kv${highlight ? ' hi' : ''}`}>
      <span className="tags-kv-k">{k}</span>
      <span className="tags-kv-v">{v || <em>—</em>}</span>
    </div>
  );
}
