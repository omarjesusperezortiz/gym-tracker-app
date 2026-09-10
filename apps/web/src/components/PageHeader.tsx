import type { ReactNode } from 'react';

// Unified page header used across the main tabs so every screen opens the same
// way: a title, an optional one-line subtitle, and an optional right-side slot
// (e.g. an action). Keeps Calendar/Progress/Nutrition/Profile visually aligned.
export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="page-head-main">
        <div className="view-title">{title}</div>
        {subtitle && <div className="view-sub">{subtitle}</div>}
      </div>
      {right && <div className="page-head-right">{right}</div>}
    </div>
  );
}
