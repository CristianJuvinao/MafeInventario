// src/components/atoms/ProductTableFooter.jsx
import { fmt } from '../../utils/helpers.js';

export function ProductTableFooter({ count, totals }) {
  return (
    <tfoot>
      <tr style={{ borderTop: '2px solid var(--border)' }}>
        <td colSpan={4} style={{ fontWeight: 700, fontSize: 13, paddingTop: 10, color: 'var(--text2)' }}>
          TOTALES ({count} productos)
        </td>
        <td />
        <td style={{ color: 'var(--red)',  fontWeight: 700, paddingTop: 10 }}>{fmt(totals.inversion)}</td>
        <td style={{ color: 'var(--blue)', fontWeight: 700, paddingTop: 10 }}>{fmt(totals.ingresos)}</td>
        <td style={{ color: totals.ganancias >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, paddingTop: 10 }}>
          {fmt(totals.ganancias)}
        </td>
        <td colSpan={2} />
      </tr>
    </tfoot>
  );
}
