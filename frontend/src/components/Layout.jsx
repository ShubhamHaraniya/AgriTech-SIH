/** Shared layout wrapper with phone shell + optional bottom nav */
import { useApp } from '../context/AppContext';
import BottomNav from './BottomNav';

export default function Layout({ children, nav = true, navTab }) {
  const { online } = useApp() || {};
  return (
    <div className="app-shell">
      <div className="phone">
        {!online && <div className="offline-bar">📵 Offline — showing cached data</div>}
        <div className="screen">
          {children}
        </div>
        {nav && <BottomNav activeTab={navTab} />}
      </div>
    </div>
  );
}
