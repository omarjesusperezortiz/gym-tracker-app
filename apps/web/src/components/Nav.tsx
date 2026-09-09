import { useAppState, type View } from '../state/AppState';
import { IconToday, IconHome, IconCal, IconProgress, IconMeal, IconProfile } from '../lib/icons';

const NAVS: { v: View; label: string; Icon: () => JSX.Element }[] = [
  { v: 'today', label: 'Today', Icon: IconToday },
  { v: 'home', label: 'Home', Icon: IconHome },
  { v: 'calendar', label: 'Calendar', Icon: IconCal },
  { v: 'progress', label: 'Progress', Icon: IconProgress },
  { v: 'meals', label: 'Meals', Icon: IconMeal },
  { v: 'profile', label: 'Profile', Icon: IconProfile },
];

export function Nav() {
  const { state, dispatch } = useAppState();
  return (
    <div className="nav">
      {NAVS.map(({ v, label, Icon }) => (
        <div
          key={v}
          className={`ni${state.view === v ? ' active' : ''}`}
          data-view={v}
          onClick={() => dispatch({ type: 'SET_VIEW', view: v })}
        >
          <Icon />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
