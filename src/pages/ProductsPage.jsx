import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers.js";
import { ProductForm } from "../components/Forms.jsx";
import { ConfirmDialog, StatusBadge, EmptyState } from "../components/UI";

import {
  Search,
  Download,
  Plus,
  Pencil,
  Trash2,
  Package,
  X,
} from "lucide-react";

export default function ProductsPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getStatus,
    exportCSV,
  } = useApp();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => d * -1);
    else {
      setSortBy(col);
      setSortDir(1);
    }
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => !catFilter || p.categoryId === catFilter)
      .sort((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === "string") return va.localeCompare(vb) * sortDir;
        return (va - vb) * sortDir;
      });
  }, [products, search, catFilter, sortBy, sortDir]);

  const sortArrow = (col) =>
    sortBy === col ? (sortDir === 1 ? " ↑" : " ↓") : "";

  const closeForm = () => {
    setShowForm(false);
    setEditProd(null);
  };

  const handleSave = (data) => {
    editProd ? updateProduct(editProd.id, data) : addProduct(data);
    closeForm();
  };

  return (
    <div className="page">
      {/* ── Product modal ─────────────────────────────── */}
      {(showForm || editProd) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editProd ? "Editar Producto" : "Nuevo Producto"}
              </span>
              <button className="btn-icon" onClick={closeForm}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <ProductForm
                initial={editProd}
                onSave={handleSave}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ───────────────────────────── */}
      {confirmId && (
        <ConfirmDialog
          msg="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={() => {
            deleteProduct(confirmId);
            setConfirmId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={14} />
          CSV
        </button>

        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={32} />}
            title="Sin productos"
            sub="Agrega tu primer producto para comenzar"
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Producto{sortArrow("name")}
                  </th>
                  <th>Categoría</th>
                  <th onClick={() => handleSort("price")}>
                    Precio{sortArrow("price")}
                  </th>
                  <th onClick={() => handleSort("quantity")}>
                    Cantidad{sortArrow("quantity")}
                  </th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);

                  return (
                    <tr key={p.id}>
                      <td className="td-name">{p.name}</td>
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
                      <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.quantity}</span>
                        <span
                          style={{
                            color: "var(--text3)",
                            fontSize: 11,
                            marginLeft: 4,
                          }}
                        >
                          {p.unit}
                        </span>
                        {p.quantity <= p.minStock && p.quantity > 0 && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              color: "var(--yellow)",
                            }}
                          >
                            min:{p.minStock}
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={getStatus(p)} />
                      </td>
                      <td>
                        <div
                          className="action-row"
                          style={{
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => setEditProd(p)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Eliminar"
                            onClick={() => setConfirmId(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--text3)",
          }}
        >
          Mostrando {filtered.length} de {products.length} productos
        </div>
      )}
    </div>
  );
}
