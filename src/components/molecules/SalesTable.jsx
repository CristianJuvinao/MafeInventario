// src/components/molecules/SalesTable.jsx
import { SaleRow } from '../atoms/SaleRow';
import { SalesSummary } from '../atoms/SalesSummary';
import { useApp } from '../../context/AppContext';

export function SalesTable() {
  const { movements, products, toast } = useApp();
  const sales = movements.filter(m => m.type === 'venta');

  const exportCSV = () => {
    if (!sales.length) return toast('No hay ventas para exportar');
    const header = 'Producto,Cantidad,Precio Unitario,Total,Fecha\n';
    const rows = sales.map(sale => {
      const product = products.find(p => p.id === sale.productId);
      return [
        `"${product?.name || 'Producto eliminado'}"`,
        sale.quantity,
        sale.price,
        sale.quantity * sale.price,
        new Date(sale.date).toLocaleDateString()
      ].join(',');
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'ventas.csv' });
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV de ventas exportado ✓');
  };

  if (!sales.length) {
    return <div className="empty-state">No hay ventas registradas aún.</div>;
  }

  return (
    <div>
      <SalesSummary sales={sales} />
      <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={exportCSV}>
        Exportar CSV
      </button>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <SaleRow
                  key={sale.id}
                  sale={sale}
                  product={products.find(p => p.id === sale.productId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}