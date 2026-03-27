// src/components/atoms/Price.jsx
import { fmt } from '../../utils/helpers.js';

export function Price({ value, color = 'var(--text)', weight = 500, style = {} }) {
  return (
    <span style={{ color, fontWeight: weight, ...style }}>
      {fmt(value)}
    </span>
  );
}