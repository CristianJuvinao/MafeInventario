// src/components/atoms/AlertRow.jsx
import { StatusBadge } from './StatusBadge';

export function AlertRow({ product: p, category: cat, status }) {
  return (
    <tr>
      <td>{p.name}</td>
      <td>
        {cat && (
          <span className="td-cat">
            <span className="cat-dot" style={{ background: cat.color }} />
            {cat.name}
          </span>
        )}
      </td>
      <td style={{
        fontWeight: 700,
        color: status === 'agotado' ? 'var(--red)' : 'var(--yellow)',
      }}>
        {p.quantity} {p.unit}
      </td>
      <td>{p.minStock} {p.unit}</td>
      <td><StatusBadge status={status} /></td>
    </tr>
  );
}
