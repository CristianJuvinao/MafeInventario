export function Button({ children, variant = 'primary', disabled = false, onClick, style = {} }) {
  const baseStyles = {
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.15s',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)' },
    icon: { background: 'transparent', border: 'none', padding: 4 },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...style }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}