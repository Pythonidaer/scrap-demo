import { theme } from '../constants';

export function HeaderBar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: theme.primary,
        borderBottom: `1px solid ${theme.accent}`,
        flexShrink: 0,
      }}
    >
      <h1
        className="app-header-title"
        style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}
      >
        Scrap Demo
      </h1>
      <span className="app-header-tagline" style={{ fontSize: 13, color: theme.muted }}>
        Family Design Editor
      </span>
    </header>
  );
}
