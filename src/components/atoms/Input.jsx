export function Input({ type = 'text', placeholder = '', value, onChange, disabled = false }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 6,
        border: '1px solid var(--border2)',
        fontSize: 14,
        fontFamily: 'var(--font-body)',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}