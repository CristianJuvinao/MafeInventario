export function Icon({ children, size = 18, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, ...style }}>
      {children}
    </span>
  );
}
