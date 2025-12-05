import React from 'react';

const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#020617',
        color: '#e5e7eb',
        flexDirection: 'column',
        gap: '0.5rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
        PicFlux Wallpapers is LIVE 🎉
      </h1>
      <p>React app sahi chal raha hai. Ab hum baad me full UI wapas add karenge.</p>
    </div>
  );
};

export default App;
