// src/pages/ProductsPage.jsx
import { useProducts }    from '../hooks/useProducts';
import { ProductModal,
         ProductsToolbar,
         ProductsTable,
         ConfirmDialog }  from '../components/molecules';

export default function ProductsPage() {
  const ctx = useProducts();

  return (
    <div className="page">
      {(ctx.showForm || ctx.editProd) && (
        <ProductModal
          editProd={ctx.editProd}
          onSave={ctx.handleSave}
          onClose={ctx.closeForm}
        />
      )}

      {ctx.confirmId && (
        <ConfirmDialog
          msg="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={ctx.handleDelete}
          onCancel={() => ctx.setConfirmId(null)}
        />
      )}

      <ProductsToolbar
        search={ctx.search}
        onSearch={ctx.setSearch}
        catFilter={ctx.catFilter}
        onCatFilter={ctx.setCatFilter}
        categories={ctx.categories}
        onExport={ctx.exportCSV}
        onAdd={() => ctx.setShowForm(true)}
      />

      <div className="card">
        <ProductsTable
          filtered={ctx.filtered}
          categories={ctx.categories}
          totals={ctx.totals}
          getStatus={ctx.getStatus}
          sortArrow={ctx.sortArrow}
          onSort={ctx.handleSort}
          onEdit={ctx.setEditProd}
          onDelete={ctx.setConfirmId}
        />
      </div>

      {ctx.filtered.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          Mostrando {ctx.filtered.length} de {ctx.products.length} productos
        </div>
      )}
    </div>
  );
}
