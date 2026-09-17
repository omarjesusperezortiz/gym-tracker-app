import { useMemo, useState } from 'react';
import { catalog, KIND_LABEL, type Kind, type Plan } from '@gym-tracker/core';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';

// Two-panel desktop catalog explorer.
//   LEFT sidebar  → plans → sessions → exercise slots (tree navigation)
//   RIGHT pane    → details of the currently-selected node
// Reached at /#/test/catalog.

type Selection =
  | { kind: 'root' }
  | { kind: 'plan'; planKey: string }
  | { kind: 'session'; planKey: string; sessKey: string }
  | { kind: 'slot'; planKey: string; sessKey: string; slotIdx: number };

export function CatalogExplorer() {
  const plans = useMemo(
    () =>
      Object.entries(catalog.plans).map(([key, plan]) => ({
        key,
        plan: plan as unknown as Plan,
      })),
    [],
  );

  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set(['gym']));
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Selection>({ kind: 'root' });
  const [detail, setDetail] = useState<{ movement: string; kind: Kind | null } | null>(null);

  const togglePlan = (k: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };
  const toggleSession = (k: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const totals = useMemo(() => {
    let sessions = 0;
    let slots = 0;
    let variations = 0;
    const uniqueMovements = new Set<string>();
    for (const { plan } of plans) {
      sessions += Object.keys(plan.sessions).length;
      for (const s of Object.values(plan.sessions)) {
        slots += s.slots.length;
        for (const slot of s.slots) uniqueMovements.add(slot[0]);
      }
      for (const kinds of Object.values(plan.variations)) {
        variations += Object.keys(kinds).length;
      }
    }
    return { plans: plans.length, sessions, slots, variations, movements: uniqueMovements.size };
  }, [plans]);

  return (
    <div className="ce-app">
      <aside className="ce-side">
        <div className="ce-side-head">
          <div className="ce-side-title">Catalog</div>
          <div className="ce-side-sub">
            {totals.plans} plans · {totals.sessions} sessions · {totals.movements} movements
          </div>
        </div>

        <button
          type="button"
          className={`ce-treerow ce-lvl0${selection.kind === 'root' ? ' on' : ''}`}
          onClick={() => setSelection({ kind: 'root' })}
        >
          <span className="ce-tw">📊</span>
          <span className="ce-tn">Overview</span>
        </button>

        {plans.map(({ key: planKey, plan }) => {
          const expanded = expandedPlans.has(planKey);
          return (
            <div key={planKey} className="ce-branch">
              <div className="ce-treerow ce-lvl1">
                <button
                  type="button"
                  className="ce-caret"
                  onClick={() => togglePlan(planKey)}
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? '▾' : '▸'}
                </button>
                <button
                  type="button"
                  className={`ce-treelabel${
                    selection.kind === 'plan' && selection.planKey === planKey ? ' on' : ''
                  }`}
                  onClick={() => setSelection({ kind: 'plan', planKey })}
                >
                  <span className="ce-tw">{plan.icon}</span>
                  <span className="ce-tn">{plan.label}</span>
                  <span className="ce-tc">{Object.keys(plan.sessions).length}</span>
                </button>
              </div>

              {expanded &&
                Object.entries(plan.sessions).map(([sessKey, sess]) => {
                  const sessId = `${planKey}/${sessKey}`;
                  const sessExpanded = expandedSessions.has(sessId);
                  return (
                    <div key={sessKey} className="ce-branch ce-branch-l2">
                      <div className="ce-treerow ce-lvl2">
                        <button
                          type="button"
                          className="ce-caret"
                          onClick={() => toggleSession(sessId)}
                          aria-label={sessExpanded ? 'Collapse' : 'Expand'}
                        >
                          {sessExpanded ? '▾' : '▸'}
                        </button>
                        <button
                          type="button"
                          className={`ce-treelabel${
                            selection.kind === 'session' &&
                            selection.planKey === planKey &&
                            selection.sessKey === sessKey
                              ? ' on'
                              : ''
                          }`}
                          onClick={() => setSelection({ kind: 'session', planKey, sessKey })}
                        >
                          <span className="ce-tw">{sess.emoji}</span>
                          <span className="ce-tn">{sess.name}</span>
                          <span className="ce-tc">{sess.slots.length}</span>
                        </button>
                      </div>

                      {sessExpanded &&
                        sess.slots.map((slot, i) => {
                          const [name] = slot;
                          const isSel =
                            selection.kind === 'slot' &&
                            selection.planKey === planKey &&
                            selection.sessKey === sessKey &&
                            selection.slotIdx === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              className={`ce-treerow ce-lvl3${isSel ? ' on' : ''}`}
                              onClick={() =>
                                setSelection({ kind: 'slot', planKey, sessKey, slotIdx: i })
                              }
                            >
                              <span className="ce-tn ce-tn-slot">
                                <span className="ce-slot-idx">{i + 1}</span>
                                {name}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </aside>

      <main className="ce-pane">
        <DetailPane
          selection={selection}
          plans={plans}
          totals={totals}
          onOpenDetail={(movement, kind) => setDetail({ movement, kind })}
        />
      </main>

      <ExerciseDetailSheet
        movement={detail?.movement ?? null}
        kind={detail?.kind ?? null}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

interface DetailPaneProps {
  selection: Selection;
  plans: { key: string; plan: Plan }[];
  totals: { plans: number; sessions: number; slots: number; variations: number; movements: number };
  onOpenDetail: (movement: string, kind: Kind | null) => void;
}

function DetailPane({ selection, plans, totals, onOpenDetail }: DetailPaneProps) {
  if (selection.kind === 'root') {
    return (
      <div className="ce-panebody">
        <div className="ce-crumb">Catalog</div>
        <h1 className="ce-h1">Overview</h1>
        <p className="ce-lead">
          Every plan → session → exercise → variation in the app catalog. Pick anything on the
          left to inspect it. Movements are catalog slot names; kinds (bar/cable/db/machine/bw)
          are equipment tabs; each kind can have one or more variations (specific forms).
        </p>
        <div className="ce-cards">
          <StatCard label="Plans" value={totals.plans} />
          <StatCard label="Sessions" value={totals.sessions} />
          <StatCard label="Unique movements" value={totals.movements} />
          <StatCard label="Slot instances" value={totals.slots} />
          <StatCard label="Total variations" value={totals.variations} />
        </div>
        <h2 className="ce-h2">Plans</h2>
        <div className="ce-planlist">
          {plans.map(({ key, plan }) => (
            <div key={key} className="ce-plancard">
              <div className="ce-plancard-icon">{plan.icon}</div>
              <div className="ce-plancard-info">
                <div className="ce-plancard-name">{plan.label}</div>
                <div className="ce-plancard-meta">
                  {Object.keys(plan.sessions).length} sessions ·{' '}
                  {Object.keys(plan.variations).length} movements w/ variations
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const planEntry = plans.find((p) => p.key === selection.planKey);
  if (!planEntry) return null;
  const { plan } = planEntry;

  if (selection.kind === 'plan') {
    const sessions = Object.entries(plan.sessions);
    return (
      <div className="ce-panebody">
        <div className="ce-crumb">Catalog / {plan.label}</div>
        <h1 className="ce-h1">
          <span className="ce-h1-icon">{plan.icon}</span>
          {plan.label}
        </h1>
        <p className="ce-lead">
          {sessions.length} sessions. Movements below show worked muscles and slot counts.
          Click a session in the sidebar to drill into its exercise list.
        </p>
        <table className="ce-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Group</th>
              <th>Slots</th>
              <th>Muscles</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(([key, sess]) => (
              <tr key={key}>
                <td>
                  <span className="ce-emoji">{sess.emoji}</span>
                  {sess.name}
                </td>
                <td>
                  <span className={`ce-chip ce-chip-${sess.group}`}>{sess.group}</span>
                </td>
                <td className="ce-num">{sess.slots.length}</td>
                <td className="ce-mut">{sess.muscles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const sess = plan.sessions[selection.sessKey];
  if (!sess) return null;

  if (selection.kind === 'session') {
    return (
      <div className="ce-panebody">
        <div className="ce-crumb">
          Catalog / {plan.label} / {sess.name}
        </div>
        <h1 className="ce-h1">
          <span className="ce-h1-icon">{sess.emoji}</span>
          {sess.name}
        </h1>
        <p className="ce-lead">
          {sess.slots.length} exercises · {sess.muscles} ·{' '}
          <span className={`ce-chip ce-chip-${sess.group}`}>{sess.group}</span>
        </p>
        <h2 className="ce-h2">Exercises in order</h2>
        <table className="ce-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Movement</th>
              <th>Scheme</th>
              <th>Alt scheme</th>
              <th>Equipment options</th>
            </tr>
          </thead>
          <tbody>
            {sess.slots.map((slot, i) => {
              const [name, scheme, force] = slot;
              const kinds = Object.keys(plan.variations[name] ?? {}) as Kind[];
              return (
                <tr key={i}>
                  <td className="ce-num">{i + 1}</td>
                  <td className="ce-bold">{name}</td>
                  <td className="ce-mono">{scheme}</td>
                  <td className="ce-mono ce-mut">{force || '—'}</td>
                  <td>
                    {kinds.length === 0 ? (
                      <span className="ce-mut">none</span>
                    ) : (
                      kinds.map((k) => (
                        <span key={k} className="ce-eqchip">
                          {KIND_LABEL[k] || k}
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // slot detail
  const slot = sess.slots[selection.slotIdx];
  if (!slot) return null;
  const [name, scheme, force] = slot;
  const vars = (plan.variations[name] ?? {}) as Partial<
    Record<Kind, { name: string; img: string; img2: string }>
  >;
  const kinds = Object.keys(vars) as Kind[];

  return (
    <div className="ce-panebody">
      <div className="ce-crumb">
        Catalog / {plan.label} / {sess.name} / <b>{name}</b>
      </div>
      <h1 className="ce-h1">{name}</h1>
      <div className="ce-slot-meta">
        <span className="ce-mono ce-chip ce-chip-primary">{scheme}</span>
        {force && <span className="ce-mono ce-chip">{force}</span>}
        <span className="ce-chip ce-mut">exercise #{selection.slotIdx + 1} in {sess.name}</span>
      </div>

      <h2 className="ce-h2">Equipment variations · {kinds.length}</h2>
      {kinds.length === 0 ? (
        <p className="ce-lead">No variations defined for this movement.</p>
      ) : (
        <div className="ce-vargrid">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className="ce-varcard"
              onClick={() => onOpenDetail(name, k)}
            >
              <img className="ce-varcard-img" src={vars[k]!.img} alt="" loading="lazy" />
              <div className="ce-varcard-body">
                <div className="ce-varcard-kind">{KIND_LABEL[k] || k}</div>
                <div className="ce-varcard-name">{vars[k]!.name}</div>
                <div className="ce-varcard-hint">Click for how-to →</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="ce-statcard">
      <div className="ce-statcard-value">{value}</div>
      <div className="ce-statcard-label">{label}</div>
    </div>
  );
}
