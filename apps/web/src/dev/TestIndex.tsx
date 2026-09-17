interface TestRoute {
  slug: string;
  title: string;
  desc: string;
  emoji: string;
  category: 'App views' | 'Components' | 'Curation tools' | 'Prototypes';
}

// Every login-free test route in one place. Add new dev pages here so they
// show up on ?test=index automatically.
const ROUTES: TestRoute[] = [
  // App views (mount the real production view with a null-state provider stack)
  { slug: 'home', title: 'Home', desc: 'Real HomeView, empty query state.', emoji: '🏠', category: 'App views' },
  { slug: 'today', title: 'Today', desc: 'Real TodayView.', emoji: '📅', category: 'App views' },
  { slug: 'calendar', title: 'Calendar', desc: 'Real CalendarView.', emoji: '🗓', category: 'App views' },
  { slug: 'progress', title: 'Progress', desc: 'Real ProgressView.', emoji: '📈', category: 'App views' },
  { slug: 'meals', title: 'Meals', desc: 'Real MealsView.', emoji: '🥗', category: 'App views' },
  { slug: 'profile', title: 'Profile', desc: 'Real ProfileView + avatar picker.', emoji: '👤', category: 'App views' },
  { slug: 'library', title: 'Exercise library', desc: 'Full 31-movement library with tap-to-detail.', emoji: '🏋️', category: 'App views' },

  // Components (individual widgets in isolation)
  { slug: 'card', title: 'Exercise card', desc: 'ExerciseCard in isolation. Tap the demo → detail modal.', emoji: '💪', category: 'Components' },
  { slug: 'picker', title: 'Picker sheet', desc: 'AddExerciseSheet / muscle-first picker.', emoji: '🔎', category: 'Components' },

  // Curation tools
  { slug: 'edb', title: 'ExerciseDB library (1,324)', desc: 'Full mirror — search + filter every exercise. Desktop-first with sidebar filters.', emoji: '📖', category: 'Curation tools' },
  { slug: 'catalog', title: 'Catalog explorer', desc: 'Every plan → session → exercise → variation, in one place.', emoji: '📚', category: 'Curation tools' },
  { slug: 'audit', title: 'QA audit page', desc: 'Cross-view issue tracker.', emoji: '🔍', category: 'Curation tools' },

  // Prototypes (throwaway design mocks, kept for reference)
  { slug: 'home2', title: 'Home (redesign v2)', desc: 'Reference-app inspired Home prototype.', emoji: '🎨', category: 'Prototypes' },
  { slug: 'exercises', title: 'Exercise showcase', desc: 'Original exercise-integration prototype.', emoji: '🧪', category: 'Prototypes' },
];

const CATEGORIES: TestRoute['category'][] = ['App views', 'Components', 'Curation tools', 'Prototypes'];

export function TestIndex() {
  const base = new URL('.', window.location.href).pathname.replace(/\/$/, '');
  return (
    <div className="test-index">
      <header className="ti-head">
        <div className="ti-title">Test index</div>
        <div className="ti-sub">
          Every login-free page in one list. Deep-link any of these as
          <span className="ti-code"> /#/test/&lt;slug&gt;</span>.
        </div>
      </header>

      {CATEGORIES.map((cat) => {
        const rows = ROUTES.filter((r) => r.category === cat);
        if (!rows.length) return null;
        return (
          <section key={cat} className="ti-section">
            <h2 className="ti-cat">{cat}</h2>
            <div className="ti-grid">
              {rows.map((r) => (
                <a
                  key={r.slug}
                  className="ti-card"
                  href={`${base}/#/test/${r.slug}`}
                >
                  <div className="ti-emoji">{r.emoji}</div>
                  <div className="ti-body">
                    <div className="ti-name">{r.title}</div>
                    <div className="ti-desc">{r.desc}</div>
                    <div className="ti-slug">/#/test/{r.slug}</div>
                  </div>
                  <div className="ti-chev">›</div>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <div className="ti-foot">
        <a className="ti-appbtn" href={base + '/'}>← Back to the real app</a>
      </div>
    </div>
  );
}
