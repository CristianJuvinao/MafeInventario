import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryForm } from '../components/Forms.jsx';
import { ConfirmDialog, EmptyState } from '../components/UI';
import { CATEGORY_ICONS } from '../utils/categoryIcons';

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Folder,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';

/* ── Categories Page ─────────────────────────────────────────── */
export function CategoriesPage() {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // ── Productos por categoría (optimizado)
  const productCount = useMemo(() => {
    const map = {};
    for (const p of products) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    }
    return map;
  }, [products]);

  const countProds = id => productCount[id] || 0;

  const closeForm = () => {
    setShowForm(false);
    setEditCat(null);
  };

  return (
    <div className="page">
      {/* ── Modal Crear / Editar ───────────────────── */}
      {(showForm || editCat) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </span>
              <button className="btn-icon" onClick={closeForm}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <CategoryForm
                initial={editCat}
                onSave={data => {
                  editCat
                    ? updateCategory(editCat.id, data)
                    : addCategory(data);
                  closeForm();
                }}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminar ───────────────────── */}
      {confirmId && (
        <ConfirmDialog
          msg={`¿Eliminar esta categoría? También se eliminarán los ${countProds(
            confirmId
          )} productos asociados.`}
          onConfirm={() => {
            deleteCategory(confirmId);
            setConfirmId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* ── Toolbar ─────────────────────────────── */}
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      {/* ── Empty / Grid ─────────────────────────── */}
      {categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Folder size={32} />}
            title="Sin categorías"
            sub="Crea tu primera categoría para organizar tus productos"
          />
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map(c => {
            const Icon =
              CATEGORY_ICONS[c.icon] || CATEGORY_ICONS.default;

            return (
              <div key={c.id} className="card cat-card card-hover">
                {/* Barra superior de color */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: c.color,
                    borderRadius: '14px 14px 0 0',
                  }}
                />

                {/* Icono */}
                <div
                  className="cat-emoji"
                  style={{
                    color: c.color,
                    background: `${c.color}22`,
                  }}
                >
                  <Icon size={28} />
                </div>

                <div
                  className="cat-card-name"
                  style={{ color: c.color }}
                >
                  {c.name}
                </div>

                <div className="cat-card-count">
                  {countProds(c.id)} producto
                  {countProds(c.id) !== 1 ? 's' : ''}
                </div>

                <div className="cat-card-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditCat(c)}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirmId(c.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Alerts Page ───────────────────────────────────────────── */
export function AlertsPage() {
  const { products, categories, getStatus } = useApp();

  const lowProds = useMemo(
    () =>
      products
        .filter(p => getStatus(p) !== 'ok')
        .sort((a, b) => a.quantity - b.quantity),
    [products, getStatus]
  );

  const agotados = lowProds.filter(p => getStatus(p) === 'agotado').length;
  const bajos = lowProds.filter(p => getStatus(p) === 'bajo').length;

  return (
    <div className="page">
      {lowProds.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<PartyPopper size={32} />}
            title="¡Todo está bien!"
            sub="No hay productos con stock bajo o agotado"
          />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
            <span className="badge badge-red">
              <AlertTriangle size={12} /> {agotados} Agotados
            </span>
            <span className="badge badge-yellow">
              {bajos} Stock bajo
            </span>
          </div>

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
                  {lowProds.map(p => {
                    const cat = categories.find(
                      c => c.id === p.categoryId
                    );
                    const s = getStatus(p);

                    return (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>
                          {cat && (
                            <span className="td-cat">
                              <span
                                className="cat-dot"
                                style={{ background: cat.color }}
                              />
                              {cat.name}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color:
                              s === 'agotado'
                                ? 'var(--red)'
                                : 'var(--yellow)',
                          }}
                        >
                          {p.quantity} {p.unit}
                        </td>
                        <td>
                          {p.minStock} {p.unit}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              s === 'agotado'
                                ? 'badge-red'
                                : 'badge-yellow'
                            }`}
                          >
                            <span className="badge-dot" />
                            {s === 'agotado'
                              ? 'Agotado'
                              : 'Bajo stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}