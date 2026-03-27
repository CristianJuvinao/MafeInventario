export function Label({ children, htmlFor, style = {} }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', marginBottom: 4, fontWeight: 600, ...style }}>
      {children}
    </label>
  );
}