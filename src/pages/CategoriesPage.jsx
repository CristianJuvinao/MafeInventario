// src/pages/CategoriesPage.jsx
import { Plus, Folder }           from 'lucide-react';
import { useCategories }          from '../hooks/useCategories';
import { EmptyState, CategoryCard } from '../components/atoms';
import { CategoryModal, ConfirmDialog } from '../components/molecules';

export function CategoriesPage() {
  const ctx = useCategories();

  return (
    <div className="page">
      {(ctx.showForm || ctx.editCat) && (
        <CategoryModal
          editCat={ctx.editCat}
          onSave={ctx.handleSave}
          onClose={ctx.closeForm}
        />
      )}

      {ctx.confirmId && (
        <ConfirmDialog
          msg={`¿Eliminar esta categoría? También se eliminarán los ${ctx.productCount[ctx.confirmId] || 0} productos asociados.`}
          onConfirm={ctx.handleDelete}
          onCancel={() => ctx.setConfirmId(null)}
        />
      )}

      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => ctx.setShowForm(true)}>
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {ctx.categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Folder size={32} />}
            title="Sin categorías"
            sub="Crea tu primera categoría para organizar tus productos"
          />
        </div>
      ) : (
        <div className="cat-grid">
          {ctx.categories.map(c => (
            <CategoryCard
              key={c.id}
              category={c}
              productCount={ctx.productCount[c.id] || 0}
              onEdit={ctx.setEditCat}
              onDelete={ctx.setConfirmId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
