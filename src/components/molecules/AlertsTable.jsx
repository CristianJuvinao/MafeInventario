// src/components/molecules/AlertsTable.jsx
import { AlertRow } from '../atoms/AlertRow';

export function AlertsTable({ lowProds, categories, getStatus }) {
  return (
    <div className="card">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lowProds.map(p => (
              <AlertRow
                key={p.id}
                product={p}
                category={categories.find(c => c.id === p.categoryId)}
                status={getStatus(p)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
