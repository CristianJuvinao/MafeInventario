// src/components/molecules/ProductsTable.jsx
import { Package }            from 'lucide-react';
import { EmptyState }         from '../atoms/EmptyState';
import { ProductRow }         from '../atoms/ProductRow';
import { ProductTableFooter } from '../atoms/ProductTableFooter';

const SortableTh = ({ col, label, sortArrow, onSort, style }) => (
  <th onClick={() => onSort(col)} style={{ cursor: 'pointer', ...style }}>
    {label}{sortArrow(col)}
  </th>
);

export function ProductsTable({ filtered, categories, totals, getStatus, sortArrow, onSort, onEdit, onDelete }) {
  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<Package size={32} />}
        title="Sin productos"
        sub="Agrega tu primer producto para comenzar"
      />
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <SortableTh col="name"          label="Producto"   sortArrow={sortArrow} onSort={onSort} />
            <th>Categoría</th>
            <SortableTh col="purchasePrice" label="P. Compra"  sortArrow={sortArrow} onSort={onSort} />
            <SortableTh col="price"         label="P. Venta"   sortArrow={sortArrow} onSort={onSort} />
            <SortableTh col="quantity"      label="Cantidad"   sortArrow={sortArrow} onSort={onSort} />
            <th>Inversión</th>
            <th>Ingresos</th>
            <th>Ganancia</th>
            <th>Estado</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <ProductRow
              key={p.id}
              product={p}
              category={categories.find(c => c.id === p.categoryId)}
              status={getStatus(p)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
        <ProductTableFooter count={filtered.length} totals={totals} />
      </table>
    </div>
  );
}
