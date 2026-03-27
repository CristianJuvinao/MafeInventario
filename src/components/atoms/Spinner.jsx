export function Spinner({ size = 16 }) {
  return (
    <span style={{
      width: size,
      height: size,
      border: '2px solid var(--border2)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}