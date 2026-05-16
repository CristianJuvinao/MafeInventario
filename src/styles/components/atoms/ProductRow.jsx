// src/components/atoms/ProductRow.jsx
import { Pencil, Trash2 } from 'lucide-react';
import { fmt } from '../../utils/helpers.js';
import { StatusBadge } from './StatusBadge';

export function ProductRow({ product: p, category: cat, status, onEdit, onDelete }) {
  const purchasePrice = p.purchasePrice || 0;
  const inversion     = purchasePrice * p.quantity;
  const ingresos      = p.price * p.quantity;
  const ganancia      = ingresos - inversion;

  return (
    <tr>
      <td className="td-name">{p.name}</td>

      <td>
        {cat && (
          <span className="td-cat">
            <span className="cat-dot" style={{ background: cat.color }} />
            {cat.name}
          </span>
        )}
      </td>

      <td style={{ color: 'var(--red)', fontWeight: 600 }}>
        {fmt(purchasePrice)}
      </td>

      <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>

      <td>
        <span style={{ fontWeight: 600 }}>{p.quantity}</span>
        <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 4 }}>
          {p.unit}
        </span>
        {p.quantity <= p.minStock && p.quantity > 0 && (
          <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--yellow)' }}>
            min:{p.minStock}
          </span>
        )}
      </td>

      <td style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(inversion)}</td>
      <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{fmt(ingresos)}</td>
      <td style={{ color: ganancia >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
        {fmt(ganancia)}
      </td>

      <td><StatusBadge status={status} /></td>

      <td>
        <div className="action-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-icon" title="Editar" onClick={() => onEdit(p)}>
            <Pencil size={14} />
          </button>
          <button className="btn-icon" title="Eliminar" onClick={() => onDelete(p.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
