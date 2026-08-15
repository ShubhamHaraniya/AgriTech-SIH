/** Bottom navigation bar — Ultra Modern AI Mobile Dock */
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { icon: '🏡', label: 'Home',      path: '/home' },
  { icon: '🌾', label: 'Crops',     path: '/crops' },
  { icon: '🔬', label: 'AI Scan',   path: '/scanner', center: true },
  { icon: '🐄', label: 'Livestock', path: '/livestock' },
  { icon: '☰',  label: 'More',      path: '/more' },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV.map((item) => {
        const isCenter = item.center;
        const active = pathname.startsWith(item.path);

        if (isCenter) {
          return (
            <div
              key={item.path}
              className={`nav-item nav-center ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="nav-center-circle">
                <span className="nav-center-icon">{item.icon}</span>
              </div>
              <span className="nav-center-label">{item.label}</span>
            </div>
          );
        }

        return (
          <div
            key={item.path}
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-wrap">
              <span className="nav-icon">{item.icon}</span>
            </div>
            <span className="nav-label">{item.label}</span>
            {active && <span className="nav-active-dot" />}
          </div>
        );
      })}
    </nav>
  );
}
