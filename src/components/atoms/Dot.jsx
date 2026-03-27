// src/components/atoms/Dot.jsx
export function Dot({ color, size = 10, style = {} }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 6,
        ...style,
      }}
    />
  );
}