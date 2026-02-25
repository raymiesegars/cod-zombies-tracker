import { ImageResponse } from 'next/og';

export const alt = 'CoD Zombies Tracker – Easter Egg Guides, Leaderboards, Co-op & Verified Runs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
          border: '1px solid #2a2a2a',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          CoD Zombies Tracker
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Easter Egg Guides • Leaderboards • Co-op • Verified Runs
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 48,
            fontSize: 20,
            color: '#6b7280',
          }}
        >
          <span>WAW • BO1–7 • IW</span>
          <span>•</span>
          <span>WW2 • Vanguard • MW2</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
