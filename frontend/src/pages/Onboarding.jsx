/** Onboarding 1–4 — uses exact ONBOARDING_*.png reference images */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  { img: '/Photos/ONBOARDING_1.png', alt: 'Farm Intelligence' },
  { img: '/Photos/ONBOARDING_2.png', alt: 'AI Assistance' },
  { img: '/Photos/ONBOARDING_3.png', alt: 'Livestock Care' },
  { img: '/Photos/ONBOARDING_4.png', alt: 'Sustainable Growth' },
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const isLast = idx === SLIDES.length - 1;

  const next = () => isLast ? navigate('/setup/farmer') : setIdx(i => i + 1);
  const skip = () => navigate('/home');

  return (
    <div className="app-shell">
      <div className="phone" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Image fills phone */}
        <img
          src={SLIDES[idx].img}
          alt={SLIDES[idx].alt}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />

        {/* Bottom controls overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '28px 24px calc(28px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(248,245,238,1) 70%, transparent)',
        }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {SLIDES.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 99,
                background: i === idx ? 'var(--green-700)' : i < idx ? 'var(--green-400)' : 'var(--char-200)',
                transition: 'all .3s', cursor: 'pointer',
              }}/>
            ))}
          </div>
          <div className="flex fai fjb">
            <button className="btn btn-ghost" onClick={skip}>Skip</button>
            <button className="btn btn-primary" style={{ minWidth: 140 }} onClick={next}>
              {isLast ? '🌿 Get Started' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
