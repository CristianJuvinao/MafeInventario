// src/components/atoms/Text.jsx
export function Text({ children, weight = 400, color = 'var(--text)', style = {} }) {
  return (
    <span style={{ fontWeight: weight, color, ...style }}>
      {children}
    </span>
  );
}