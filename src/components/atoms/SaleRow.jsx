// src/components/atoms/SaleRow.jsx
import { fmt } from '../../utils/helpers.js';

export function SaleRow({ sale, product }) {
  return (
    <tr>
      <td>{product?.name || 'Producto eliminado'}</td>
      <td>{sale.quantity}</td>
      <td>{fmt(sale.price)}</td>
      <td>{fmt(sale.quantity * sale.price)}</td>
      <td>{new Date(sale.date).toLocaleDateString()}</td>
    </tr>
  );
}