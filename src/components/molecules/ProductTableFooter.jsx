// src/components/atoms/ProductTableFooter.jsx
import { fmt } from '../../utils/helpers.js';
import { Text } from '../atoms/Text'; // átomo
import { Price } from '../atoms/Price.jsx'; // átomo opcional para dinero

export function ProductTableFooter({ count, totals }) {
  return (
    <tfoot>
      <tr style={{ borderTop: '2px solid var(--border)' }}>
        <td colSpan={4}>
          <Text weight={700} size={13} color="var(--text2)" style={{ paddingTop: 10 }}>
            TOTALES ({count} productos)
          </Text>
        </td>
        <td /> {/* vacía */}
        <td>
          <Price value={totals.inversion} color="var(--red)" weight={700} style={{ paddingTop: 10 }} />
        </td>
        <td>
          <Price value={totals.ingresos} color="var(--blue)" weight={700} style={{ paddingTop: 10 }} />
        </td>
        <td>
          <Price
            value={totals.ganancias}
            color={totals.ganancias >= 0 ? 'var(--green)' : 'var(--red)'}
            weight={700}
            style={{ paddingTop: 10 }}
          />
        </td>
        <td colSpan={2} />
      </tr>
    </tfoot>
  );
}