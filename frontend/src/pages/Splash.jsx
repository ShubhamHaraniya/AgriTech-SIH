/** Splash Screen — uses exact SPLASH.png reference image */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const isAuth = localStorage.getItem('agritech_auth') === 'true';
    const t = setTimeout(() => {
      navigate(isAuth ? '/home' : '/login');
    }, 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="app-shell">
      <div className="phone" style={{ borderRadius: 44, position: 'relative', overflow: 'hidden' }}>
        <img
          src="/Photos/SPLASH.png"
          alt="AgriTech Smart Farming Platform"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Loader dots */}
        <div style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(27,67,50,0.5)',
              animation: `loaderPulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }}/>
          ))}
        </div>
        <style>{`
          @keyframes loaderPulse {
            0%,100% { opacity:.4; transform:scale(1); }
            50%      { opacity:1;  transform:scale(1.3); }
          }
        `}</style>
      </div>
    </div>
  );
}
