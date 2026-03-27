// src/components/atoms/SalesSummary.jsx
import { fmt } from '../../utils/helpers.js';

export function SalesSummary({ sales }) {
  const totalVentas = sales.reduce((acc, s) => acc + s.quantity * s.price, 0);
  const totalUnidades = sales.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
      <div><strong>Total ingresos:</strong> {fmt(totalVentas)}</div>
      <div><strong>Total unidades vendidas:</strong> {totalUnidades}</div>
    </div>
  );
}