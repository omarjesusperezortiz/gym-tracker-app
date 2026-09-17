import { useEffect, useMemo, useState } from 'react';

interface EdbExercise {
  id: string;
  name: string;
  body: string[];
  target: string[];
  secondary: string[];
  equip: string[];
  steps: string[];
}

interface Facet {
  name: string;
  count: number;
}
interface Facets {
  body: Facet[];
  target: Facet[];
  equip: Facet[];
}

const BASE = import.meta.env.BASE_URL;
const EDB_URL = `${BASE}edb/exercises.json`;
const FACETS_URL = `${BASE}edb/facets.json`;
const MEDIA_URL = `${BASE}exercise-media/`;

// Desktop-first browser for the full 1,500-exercise ExerciseDB mirror.
//   LEFT sidebar → search + faceted filters (body / target / equipment)
//   RIGHT pane   → results grid, sortable
//   Detail       → tap a card to see how-to (inline expand, no modal)
export function EdbLibrary() {
  const [items, setItems] = useState<EdbExercise[] | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [bodyFilter, setBodyFilter] = useState<string | null>(null);
  const [targetFilter, setTargetFilter] = useState<string | null>(null);
  const [equipFilter, setEquipFilter] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState<'name' | 'target' | 'equip'>('name');

  useEffect(() => {
    Promise.all([
      fetch(EDB_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      fetch(FACETS_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
    ])
      .then(([exercises, f]) => {
        setItems(exercises);
        setFacets(f);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  const targetsForBody = useMemo(() => {
    if (!items || !bodyFilter) return facets?.target ?? [];
    const counts = new Map<string, number>();
    for (const it of items) {
      if (!it.body.includes(bodyFilter)) continue;
      for (const t of it.target) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items, facets, bodyFilter]);

  const filtered = useMemo(() => {
    if (!items) return [] as EdbExercise[];
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (bodyFilter && !it.body.includes(bodyFilter)) return false;
      if (targetFilter && !it.target.includes(targetFilter)) return false;
      if (equipFilter.size) {
        const any = it.equip.some((e) => equipFilter.has(e));
        if (!any) return false;
      }
      if (query) {
        const hay = (it.name + ' ' + it.target.join(' ') + ' ' + it.equip.join(' ')).toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [items, q, bodyFilter, targetFilter, equipFilter]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    switch (sort) {
      case 'name':
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'target':
        arr.sort((a, b) => (a.target[0] || '').localeCompare(b.target[0] || '') || a.name.localeCompare(b.name));
        break;
      case 'equip':
        arr.sort((a, b) => (a.equip[0] || '').localeCompare(b.equip[0] || '') || a.name.localeCompare(b.name));
        break;
    }
    return arr;
  }, [filtered, sort]);

  const selectedExercise = useMemo(
    () => (selected && items ? items.find((it) => it.id === selected) ?? null : null),
    [selected, items],
  );

  function toggleEquip(name: string) {
    setEquipFilter((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function resetFilters() {
    setQ('');
    setBodyFilter(null);
    setTargetFilter(null);
    setEquipFilter(new Set());
  }

  if (err) return <div className="edb-err">Failed to load: {err}</div>;
  if (!items || !facets) return <div className="edb-loading">Loading 1,500 exercises…</div>;

  return (
    <div className="edb-app">
      <aside className="edb-side">
        <div className="edb-brand">
          <div className="edb-brand-title">ExerciseDB</div>
          <div className="edb-brand-sub">1,500-exercise reference library</div>
        </div>

        <div className="edb-searchbox">
          <span className="edb-search-icon">🔍</span>
          <input
            className="edb-search"
            type="search"
            placeholder="Search exercises…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search exercises"
          />
          {q && (
            <button className="edb-search-clear" onClick={() => setQ('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <FilterGroup title="Body part">
          <FacetRadio label="All body parts" active={bodyFilter === null} onClick={() => { setBodyFilter(null); setTargetFilter(null); }} />
          {facets.body.map((f) => (
            <FacetRadio
              key={f.name}
              label={f.name}
              count={f.count}
              active={bodyFilter === f.name}
              onClick={() => { setBodyFilter(f.name); setTargetFilter(null); }}
            />
          ))}
        </FilterGroup>

        <FilterGroup title={bodyFilter ? `Target muscle (in ${bodyFilter})` : 'Target muscle'}>
          <FacetRadio label="Any target" active={targetFilter === null} onClick={() => setTargetFilter(null)} />
          {targetsForBody.slice(0, 15).map((f) => (
            <FacetRadio
              key={f.name}
              label={f.name}
              count={f.count}
              active={targetFilter === f.name}
              onClick={() => setTargetFilter(f.name)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Equipment">
          {facets.equip.map((f) => (
            <FacetCheck
              key={f.name}
              label={f.name}
              count={f.count}
              active={equipFilter.has(f.name)}
              onClick={() => toggleEquip(f.name)}
            />
          ))}
        </FilterGroup>

        <button className="edb-reset" onClick={resetFilters}>
          Reset filters
        </button>
      </aside>

      <main className="edb-main">
        <header className="edb-mainhead">
          <div>
            <div className="edb-crumb">Library</div>
            <h1 className="edb-h1">
              {sorted.length.toLocaleString()} exercises
              {(bodyFilter || targetFilter || equipFilter.size > 0 || q) && (
                <span className="edb-of"> of {items.length.toLocaleString()}</span>
              )}
            </h1>
          </div>
          <div className="edb-sort">
            Sort:
            <button className={`edb-sortbtn${sort === 'name' ? ' on' : ''}`} onClick={() => setSort('name')}>Name</button>
            <button className={`edb-sortbtn${sort === 'target' ? ' on' : ''}`} onClick={() => setSort('target')}>Muscle</button>
            <button className={`edb-sortbtn${sort === 'equip' ? ' on' : ''}`} onClick={() => setSort('equip')}>Equipment</button>
          </div>
        </header>

        {(bodyFilter || targetFilter || equipFilter.size > 0 || q) && (
          <div className="edb-chipbar">
            {q && <button className="edb-chip" onClick={() => setQ('')}>“{q}” ✕</button>}
            {bodyFilter && <button className="edb-chip" onClick={() => setBodyFilter(null)}>{bodyFilter} ✕</button>}
            {targetFilter && <button className="edb-chip" onClick={() => setTargetFilter(null)}>{targetFilter} ✕</button>}
            {[...equipFilter].map((eq) => (
              <button key={eq} className="edb-chip" onClick={() => toggleEquip(eq)}>{eq} ✕</button>
            ))}
          </div>
        )}

        <div className="edb-grid">
          {sorted.slice(0, 240).map((it) => (
            <Card key={it.id} ex={it} onClick={() => setSelected(selected === it.id ? null : it.id)} active={selected === it.id} />
          ))}
        </div>
        {sorted.length > 240 && (
          <div className="edb-more">
            Showing first 240 of {sorted.length.toLocaleString()} — refine filters to narrow.
          </div>
        )}
        {sorted.length === 0 && <div className="edb-none">No matches. Try clearing a filter.</div>}
      </main>

      {selectedExercise && (
        <aside className="edb-detail">
          <div className="edb-detail-inner">
            <button className="edb-detail-close" onClick={() => setSelected(null)}>✕</button>
            <div className="edb-detail-media">
              <img src={`${MEDIA_URL}${selectedExercise.id}.webp`} alt={selectedExercise.name} onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')} />
            </div>
            <h2 className="edb-detail-title">{selectedExercise.name}</h2>
            <div className="edb-detail-tags">
              {selectedExercise.target.map((t) => (
                <span key={t} className="edb-tag edb-tag-primary">{t}</span>
              ))}
              {selectedExercise.secondary.map((t) => (
                <span key={t} className="edb-tag edb-tag-secondary">+{t}</span>
              ))}
              {selectedExercise.equip.map((e) => (
                <span key={e} className="edb-tag">{e}</span>
              ))}
              {selectedExercise.body.map((b) => (
                <span key={b} className="edb-tag edb-tag-body">{b}</span>
              ))}
            </div>
            {selectedExercise.steps.length > 0 && (
              <>
                <div className="edb-detail-head">How to</div>
                <ol className="edb-detail-steps">
                  {selectedExercise.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </>
            )}
            <div className="edb-detail-id">exerciseId: {selectedExercise.id}</div>
          </div>
        </aside>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="edb-filter">
      <h3 className="edb-filter-title">{title}</h3>
      <div className="edb-filter-list">{children}</div>
    </section>
  );
}

function FacetRadio({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button className={`edb-facet edb-facet-radio${active ? ' on' : ''}`} onClick={onClick}>
      <span className="edb-facet-dot" />
      <span className="edb-facet-label">{label}</span>
      {count !== undefined && <span className="edb-facet-count">{count}</span>}
    </button>
  );
}

function FacetCheck({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button className={`edb-facet edb-facet-check${active ? ' on' : ''}`} onClick={onClick}>
      <span className="edb-facet-box">{active ? '✓' : ''}</span>
      <span className="edb-facet-label">{label}</span>
      <span className="edb-facet-count">{count}</span>
    </button>
  );
}

function Card({ ex, onClick, active }: { ex: EdbExercise; onClick: () => void; active: boolean }) {
  return (
    <button className={`edb-card${active ? ' on' : ''}`} onClick={onClick}>
      <div className="edb-card-media">
        <img src={`${MEDIA_URL}${ex.id}.webp`} alt="" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')} />
      </div>
      <div className="edb-card-body">
        <div className="edb-card-name">{ex.name}</div>
        <div className="edb-card-tags">
          {ex.target[0] && <span className="edb-tag edb-tag-primary">{ex.target[0]}</span>}
          {ex.equip[0] && <span className="edb-tag">{ex.equip[0]}</span>}
        </div>
      </div>
    </button>
  );
}
