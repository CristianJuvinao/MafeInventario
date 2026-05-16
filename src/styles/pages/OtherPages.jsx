// src/pages/OtherPages.jsx
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryForm } from '../components/molecules';
import { EmptyState }   from '../components/atoms';
import { ConfirmDialog } from '../components/molecules';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import {
  Plus, Pencil, Trash2, X,
  Folder, PartyPopper, AlertTriangle,
  TrendingUp, Package,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Categories Page
──────────────────────────────────────────── */
export function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useApp();

  const [showForm,  setShowForm]  = useState(false);
  const [editCat,   setEditCat]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const productCount = useMemo(() => {
    const map = {};
    for (const p of products) map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    return map;
  }, [products]);

  const countProds = id => productCount[id] || 0;

  const closeForm = () => { setShowForm(false); setEditCat(null); };

  return (
    <div className="page">

      {/* Edit / create modal */}
      {(showForm || editCat) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">
                {editCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </span>
              <button className="btn-icon" onClick={closeForm}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <CategoryForm
                initial={editCat}
                onSave={data => {
                  editCat ? updateCategory(editCat.id, data) : addCategory(data);
                  closeForm();
                }}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmId && (
        <ConfirmDialog
          msg={`¿Eliminar esta categoría? También se eliminarán los ${countProds(confirmId)} productos asociados.`}
          onConfirm={() => { deleteCategory(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Categorías</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {categories.length} categorías · {products.length} productos totales
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {/* Grid or empty */}
      {categories.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon={<Folder size={32} />}
            title="Sin categorías"
            sub="Crea tu primera categoría para organizar tus productos"
          />
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map(c => {
            const Icon = CATEGORY_ICONS[c.icon] || CATEGORY_ICONS.default;
            const count = countProds(c.id);
            return (
              <div key={c.id} className="card cat-card card-hover">
                {/* Color accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, background: c.color,
                  borderRadius: 'var(--radius) var(--radius) 0 0',
                }} />

                {/* Icon */}
                <div className="cat-emoji" style={{ color: c.color, background: `${c.color}18` }}>
                  <Icon size={26} />
                </div>

                <div className="cat-card-name" style={{ color: c.color }}>{c.name}</div>
                <div className="cat-card-count">{count} producto{count !== 1 ? 's' : ''}</div>

                <div className="cat-card-actions">
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setEditCat(c)}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(c.id)}>
                    <Trash2 size={13} />
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

/* ────────────────────────────────────────────
   Alerts Page
──────────────────────────────────────────── */
export function AlertsPage() {
  const { products, categories, getStatus } = useApp();

  const lowProds = useMemo(() =>
    products
      .filter(p => getStatus(p) !== 'ok')
      .sort((a, b) => a.quantity - b.quantity),
    [products, getStatus]
  );

  const agotados = lowProds.filter(p => getStatus(p) === 'agotado').length;
  const bajos    = lowProds.filter(p => getStatus(p) === 'bajo').length;

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Alertas de Stock
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Productos que requieren reabastecimiento.
        </p>
      </div>

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
          {/* Summary pills */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--red-dim)', color: 'var(--red)',
              padding: '8px 16px', borderRadius: 10,
              fontWeight: 700, fontSize: 13,
              border: '1px solid rgba(220,38,38,.15)',
            }}>
              <AlertTriangle size={15} />
              {agotados} Agotados
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--yellow-dim)', color: 'var(--yellow)',
              padding: '8px 16px', borderRadius: 10,
              fontWeight: 700, fontSize: 13,
              border: '1px solid rgba(217,119,6,.15)',
            }}>
              <TrendingUp size={15} />
              {bajos} Stock bajo
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock actual</th>
                    <th>Stock mínimo</th>
                    <th>Déficit</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lowProds.map(p => {
                    const cat    = categories.find(c => c.id === p.categoryId);
                    const s      = getStatus(p);
                    const deficit = Math.max(0, p.minStock - p.quantity);

                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: s === 'agotado' ? 'var(--red-dim)' : 'var(--yellow-dim)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Package size={15} color={s === 'agotado' ? 'var(--red)' : 'var(--yellow)'} />
                            </div>
                            <span className="td-name">{p.name}</span>
                          </div>
                        </td>

                        <td>
                          {cat && (
                            <span className="td-cat">
                              <span className="cat-dot" style={{ background: cat.color }} />
                              {cat.name}
                            </span>
                          )}
                        </td>

                        <td style={{
                          fontWeight: 700,
                          color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)',
                        }}>
                          {p.quantity} {p.unit}
                        </td>

                        <td style={{ color: 'var(--text2)', fontWeight: 600 }}>
                          {p.minStock} {p.unit}
                        </td>

                        <td style={{ fontWeight: 700, color: 'var(--red)' }}>
                          {deficit > 0 ? `−${deficit} ${p.unit}` : '—'}
                        </td>

                        <td>
                          <span className={`badge ${s === 'agotado' ? 'badge-red' : 'badge-yellow'}`}>
                            <span className="badge-dot" />
                            {s === 'agotado' ? 'Agotado' : 'Bajo stock'}
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