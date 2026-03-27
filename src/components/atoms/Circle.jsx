// src/components/atoms/Circle.jsx
export function Circle({ done, active, number, children }) {
  return (
    <div style={{
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 800,
      background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--surface3)',
      color: done || active ? '#fff' : 'var(--text3)',
      transition: 'all .2s',
      boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
    }}>
      {children || number}
    </div>
  );
}