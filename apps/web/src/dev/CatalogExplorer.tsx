import { useMemo, useState } from 'react';
import { catalog, KIND_LABEL, type Kind, type Plan } from '@gym-tracker/core';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;

interface OpenDetail {
  movement: string;
  kind: Kind | null;
}

// A read-only catalog explorer. Shows every plan (Gym / Calisthenics / Travel)
// → every session in it → every exercise slot → every equipment variation.
// Tapping a variation opens the shared ExerciseDetailSheet so we can review
// how each one looks. Reached at /#/test/catalog.
export function CatalogExplorer() {
  const [openPlan, setOpenPlan] = useState<string | null>('gym');
  const [detail, setDetail] = useState<OpenDetail | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const plans = useMemo(
    () =>
      Object.entries(catalog.plans).map(([key, plan]) => ({
        key,
        plan: plan as unknown as Plan,
      })),
    [],
  );

  // Count everything for the summary row.
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
    return { sessions, slots, variations, movements: uniqueMovements.size };
  }, [plans]);

  return (
    <div className="cat-shell">
      <header className="cat-head">
        <div className="cat-title">Catalog explorer</div>
        <div className="cat-sub">
          Every plan → session → exercise → variation. Tap a variation to see its
          how-to and equipment options.
        </div>
        <div className="cat-totals">
          <span className="cat-tot">
            <b>{plans.length}</b> plans
          </span>
          <span className="cat-tot">
            <b>{totals.sessions}</b> sessions
          </span>
          <span className="cat-tot">
            <b>{totals.movements}</b> movements
          </span>
          <span className="cat-tot">
            <b>{totals.slots}</b> slot instances
          </span>
          <span className="cat-tot">
            <b>{totals.variations}</b> variations
          </span>
        </div>
      </header>

      <div className="cat-tabs">
        {plans.map(({ key, plan }) => (
          <button
            key={key}
            type="button"
            className={`cat-tab${openPlan === key ? ' on' : ''}`}
            onClick={() => {
              setOpenPlan(key);
              setExpandedSession(null);
            }}
          >
            <span className="cat-tab-icon">{plan.icon}</span>
            {plan.label}
          </button>
        ))}
      </div>

      {plans
        .filter(({ key }) => key === openPlan)
        .map(({ key, plan }) => (
          <div key={key} className="cat-body">
            {Object.entries(plan.sessions).map(([sessKey, sess]) => {
              const expanded = expandedSession === sessKey;
              return (
                <section key={sessKey} className={`cat-sess${expanded ? ' on' : ''}`}>
                  <button
                    type="button"
                    className="cat-sess-head"
                    onClick={() => setExpandedSession(expanded ? null : sessKey)}
                  >
                    <span className="cat-sess-em">{sess.emoji}</span>
                    <span className="cat-sess-info">
                      <span className="cat-sess-name">{sess.name}</span>
                      <span className="cat-sess-mus">{sess.muscles}</span>
                    </span>
                    <span className="cat-sess-count">
                      {sess.slots.length} ex ·{' '}
                      <span className={`cat-sess-group cat-sess-g-${sess.group}`}>
                        {sess.group}
                      </span>
                    </span>
                    <span className="cat-chev">{expanded ? '▾' : '▸'}</span>
                  </button>
                  {expanded && (
                    <div className="cat-slots">
                      {sess.slots.map((slot, i) => {
                        const [name, scheme] = slot;
                        const vars = (plan.variations[name] ?? {}) as Partial<
                          Record<Kind, { name: string; img: string }>
                        >;
                        const kinds = Object.keys(vars) as Kind[];
                        return (
                          <div key={`${sessKey}-${i}`} className="cat-slot">
                            <div className="cat-slot-h">
                              <span className="cat-slot-n">
                                <span className="cat-slot-num">{i + 1}</span>
                                {name}
                              </span>
                              <span className="cat-slot-s">{scheme}</span>
                            </div>
                            {kinds.length > 0 ? (
                              <div className="cat-vars">
                                {kinds.map((k) => (
                                  <button
                                    key={k}
                                    type="button"
                                    className="cat-var"
                                    onClick={() =>
                                      setDetail({ movement: name, kind: k })
                                    }
                                  >
                                    <img
                                      className="cat-var-img"
                                      src={vars[k]!.img}
                                      alt=""
                                      loading="lazy"
                                    />
                                    <span className="cat-var-info">
                                      <span className="cat-var-kind">
                                        {KIND_LABEL[k] || k}
                                      </span>
                                      <span className="cat-var-name">
                                        {vars[k]!.name}
                                      </span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="cat-empty">
                                No variations defined for this movement.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ))}

      <ExerciseDetailSheet
        movement={detail?.movement ?? null}
        kind={detail?.kind ?? null}
        onClose={() => setDetail(null)}
      />

      {/* Suppress unused var warning while we keep the constant for future use */}
      <div style={{ display: 'none' }}>{MEDIA_BASE}</div>
    </div>
  );
}
