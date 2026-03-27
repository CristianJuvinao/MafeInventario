// src/components/molecules/AlertRow.jsx
import { StatusBadge } from '../atoms/StatusBadge';
import { Dot } from '../atoms/Dot';
import { Text } from '../atoms/Text';

export function AlertRow({ product: p, category: cat, status }) {
  return (
    <tr>
      {/* Nombre del producto */}
      <td>
        <Text weight={700}>{p.name}</Text>
      </td>

      {/* Categoría */}
      <td>
        {cat && (
          <span className="td-cat" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot color={cat.color} />
            <Text>{cat.name}</Text>
          </span>
        )}
      </td>

      {/* Cantidad actual */}
      <td>
        <Text
          weight={700}
          color={status === 'agotado' ? 'var(--red)' : 'var(--yellow)'}
        >
          {p.quantity} {p.unit}
        </Text>
      </td>

      {/* Stock mínimo */}
      <td>
        <Text>{p.minStock} {p.unit}</Text>
      </td>

      {/* Estado */}
      <td>
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}