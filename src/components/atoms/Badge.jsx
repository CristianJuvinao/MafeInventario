// src/components/atoms/Badge.jsx
export function Badge({ children, variant = 'default', style = {} }) {
  const colors = {
    default: 'var(--surface2)',
    red: 'var(--red)',
    yellow: 'var(--yellow)',
    green: 'var(--green)',
    blue: 'var(--blue)',
  };

  return (
    <span
      className={`badge badge-${variant}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        background: colors[variant] || colors.default,
        color: variant === 'default' ? 'var(--text)' : '#fff',
        fontWeight: 600,
        fontSize: 12,
        ...style,
      }}
    >
      {children}
    </span>
  );
}