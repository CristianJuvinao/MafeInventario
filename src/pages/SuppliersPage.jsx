// src/pages/SuppliersPage.jsx
import { useState } from "react";
import { useSuppliers } from "../hooks/useSuppliers";
import { EmptyState } from "../components/atoms";
import { ConfirmDialog } from "../components/molecules/ConfirmDialog";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Truck,
  User,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";

/* ─── Supplier Form ─────────────────────────────────────── */
function SupplierForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    notes: "",
    ...initial,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="form-column">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Nombre del proveedor *</label>
          <input
            type="text"
            placeholder="Ej: Distribuidora Nacional"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Contacto</label>
          <input
            type="text"
            placeholder="Nombre del responsable"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Ciudad</label>
          <input
            type="text"
            placeholder="Ej: Bogotá"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            placeholder="+57 300 000 0000"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            placeholder="proveedor@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Notas</label>
          <textarea
            placeholder="Condiciones, observaciones..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            style={{ minHeight: 80, resize: "vertical" }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={!form.name.trim()}
        >
          {initial.id ? "Guardar cambios" : "Crear proveedor"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function SuppliersPage() {
  const {
    filtered,
    search,
    setSearch,
    showForm,
    setShowForm,
    editSupp,
    setEditSupp,
    confirmId,
    setConfirmId,
    closeForm,
    handleSave,
    handleDelete,
    toggleActive,
  } = useSuppliers();

  return (
    <div className="page">
      {/* Modal crear/editar */}
      {(showForm || editSupp) && (
        <div className="modal-overlay" onClick={closeForm}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560 }}
          >
            <div className="modal-header">
              <span className="modal-title">
                {editSupp ? "Editar Proveedor" : "Nuevo Proveedor"}
              </span>
              <button className="btn-icon" onClick={closeForm}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <SupplierForm
                initial={editSupp || {}}
                onSave={handleSave}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmId && (
        <ConfirmDialog
          msg="¿Eliminar este proveedor? Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Proveedores
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
            {filtered.length} proveedor{filtered.length !== 1 ? "es" : ""}{" "}
            registrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 380 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text3)",
          }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, contacto o ciudad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36, width: "100%" }}
        />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon={<Truck size={32} />}
            title={search ? "Sin resultados" : "Sin proveedores"}
            sub={
              search
                ? "Intenta con otro término de búsqueda"
                : "Agrega tu primer proveedor para comenzar"
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((s) => (
            <div
              key={s.id}
              className="card card-hover"
              style={{
                position: "relative",
                opacity: s.active ? 1 : 0.6,
                transition: "opacity .2s",
              }}
            >
              {/* Status bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: s.active ? "var(--accent)" : "var(--border)",
                  borderRadius: "var(--radius) var(--radius) 0 0",
                }}
              />

              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--accent-dim, rgba(124,111,255,.12))",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {s.name}
                    </div>
                    {s.city && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--text3)",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        <MapPin size={11} /> {s.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active badge */}
                <button
                  onClick={() => toggleActive(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    background: s.active
                      ? "var(--green-dim)"
                      : "var(--surface2)",
                    color: s.active ? "var(--green)" : "var(--text3)",
                    transition: "all .2s",
                  }}
                  title="Clic para cambiar estado"
                >
                  {s.active ? (
                    <>
                      <CheckCircle size={11} /> Activo
                    </>
                  ) : (
                    <>
                      <XCircle size={11} /> Inactivo
                    </>
                  )}
                </button>
              </div>

              {/* Info rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {s.contact && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text2)",
                    }}
                  >
                    <User
                      size={13}
                      style={{ color: "var(--text3)", flexShrink: 0 }}
                    />
                    {s.contact}
                  </div>
                )}
                {s.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text2)",
                    }}
                  >
                    <Phone
                      size={13}
                      style={{ color: "var(--text3)", flexShrink: 0 }}
                    />
                    {s.phone}
                  </div>
                )}
                {s.email && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text2)",
                    }}
                  >
                    <Mail
                      size={13}
                      style={{ color: "var(--text3)", flexShrink: 0 }}
                    />
                    {s.email}
                  </div>
                )}
              </div>

              {s.notes && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "var(--surface2)",
                    marginBottom: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {s.notes}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setEditSupp(s)}
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setConfirmId(s.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
