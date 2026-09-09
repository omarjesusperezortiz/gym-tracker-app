import { useAuth } from '../auth/AuthContext';
import { IconSignOut, IconTrain } from '../lib/icons';

export function Header() {
  const { signOut } = useAuth();
  return (
    <header>
      <div className="hbar">
        <div className="brand">
          <div className="logo">
            <IconTrain />
          </div>
          <div>
            <div className="htitle">Trainer</div>
            <div className="hsub">Grow strong · skate flexible</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="iconbtn signout-icon" onClick={() => void signOut()} title="Sign out">
            <IconSignOut />
          </div>
        </div>
      </div>
    </header>
  );
}
