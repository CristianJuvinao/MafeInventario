import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers.js";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  Trash2,
  X,
  History,
  Search,
} from "lucide-react";
import { EmptyState } from "../components/UI";

/* ── Colores / íconos por tipo ──────────────────────────── */
const TYPE_META = {
  entrada: { label: "Entrada", color: "var(--green)", Icon: ArrowDownCircle },
  salida: { label: "Salida", color: "var(--red)", Icon: ArrowUpCircle },
  ajuste: { label: "Ajuste", color: "var(--blue)", Icon: SlidersHorizontal },
  creacion: { label: "Creación", color: "var(--purple)", Icon: PlusCircle },
  eliminacion: { label: "Eliminado", color: "var(--text3)", Icon: MinusCircle },
};

const fmt_date = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ─────────────────────────────────────────────────────────────
   Modal de nuevo movimiento
───────────────────────────────────────────────────────────── */
function MovementModal({ onClose }) {
  const { products, registerMovement } = useApp();

  const [form, setForm] = useState({
    productId: products[0]?.id || "",
    type: "entrada",
    qty: "",
    note: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedProduct = products.find((p) => p.id === form.productId);

  const submit = () => {
    const qty = Number(form.qty);
    if (!form.productId || !qty || qty <= 0) return;
    registerMovement(form.productId, form.type, qty, form.note.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">Registrar Movimiento</span>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-column">
            {/* Producto */}
            <div className="form-group">
              <label>Producto</label>
              <select
                className="form-select"
                value={form.productId}
                onChange={(e) => set("productId", e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}
                >
                  Stock actual:{" "}
                  <strong style={{ color: "var(--text1)" }}>
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </strong>
                </div>
              )}
            </div>

            {/* Tipo */}
            <div className="form-group">
              <label>Tipo de movimiento</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["entrada", "salida", "ajuste"].map((t) => {
                  const { label, color } = TYPE_META[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("type", t)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 8,
                        border: `2px solid ${form.type === t ? color : "var(--border)"}`,
                        background:
                          form.type === t ? `${color}18` : "transparent",
                        color: form.type === t ? color : "var(--text2)",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {form.type === "ajuste" && (
                <div
                  style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}
                >
                  Ajuste: el número que ingreses será el nuevo stock total.
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="form-group">
              <label>
                {form.type === "ajuste"
                  ? "Nuevo stock total"
                  : form.type === "entrada"
                    ? "Unidades a ingresar"
                    : "Unidades a retirar"}
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.qty}
                onChange={(e) => set("qty", e.target.value)}
              />
            </div>

            {/* Nota */}
            <div className="form-group">
              <label>Nota (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Compra proveedor X, venta cliente..."
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!form.productId || !form.qty || Number(form.qty) <= 0}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   History Page
───────────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const { movements, products, clearMovements } = useApp();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    return movements
      .filter(
        (m) =>
          m.productName.toLowerCase().includes(search.toLowerCase()) ||
          (m.note || "").toLowerCase().includes(search.toLowerCase()),
      )
      .filter((m) => !typeFilter || m.type === typeFilter);
  }, [movements, search, typeFilter]);

  /* ── Resumen rápido ───────────────────────────────────── */
  const summary = useMemo(() => {
    const entradas = movements
      .filter((m) => m.type === "entrada")
      .reduce((s, m) => s + m.qty, 0);
    const salidas = movements
      .filter((m) => m.type === "salida")
      .reduce((s, m) => s + m.qty, 0);
    const ajustes = movements.filter((m) => m.type === "ajuste").length;
    return { entradas, salidas, ajustes, total: movements.length };
  }, [movements]);

  return (
    <div className="page">
      {showModal && <MovementModal onClose={() => setShowModal(false)} />}

      {/* ── Confirmar limpiar ─────────────────────────── */}
      {confirmClear && (
        <div className="modal-overlay" onClick={() => setConfirmClear(false)}>
          <div
            className="modal"
            style={{ maxWidth: 360 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Limpiar historial</span>
              <button
                className="btn-icon"
                onClick={() => setConfirmClear(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "16px 20px" }}>
              <p
                style={{
                  color: "var(--text2)",
                  marginBottom: 20,
                  fontSize: 14,
                }}
              >
                ¿Eliminar todos los {movements.length} registros del historial?
                Esta acción no se puede deshacer.
              </p>
              <div className="form-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    clearMovements();
                    setConfirmClear(false);
                  }}
                >
                  Sí, limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Resumen cards ─────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Movimientos</div>
              <div className="stat-value">{summary.total}</div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
            >
              <History size={20} />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Entradas</div>
              <div className="stat-value" style={{ color: "var(--green)" }}>
                {summary.entradas}
              </div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "var(--green-dim)", color: "var(--green)" }}
            >
              <ArrowDownCircle size={20} />
            </div>
          </div>
          <div className="stat-sub">unidades ingresadas</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Salidas</div>
              <div className="stat-value" style={{ color: "var(--red)" }}>
                {summary.salidas}
              </div>
            </div>
            <div
              className="stat-icon"
              style={{
                background: "rgba(248,113,113,0.15)",
                color: "var(--red)",
              }}
            >
              <ArrowUpCircle size={20} />
            </div>
          </div>
          <div className="stat-sub">unidades retiradas</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Ajustes</div>
              <div className="stat-value" style={{ color: "var(--blue)" }}>
                {summary.ajustes}
              </div>
            </div>
            <div
              className="stat-icon"
              style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
            >
              <SlidersHorizontal size={20} />
            </div>
          </div>
          <div className="stat-sub">correcciones de stock</div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            placeholder="Buscar producto o nota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        {movements.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 size={14} />
            Limpiar
          </button>
        )}

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <SlidersHorizontal size={14} />
          Nuevo Movimiento
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History size={32} />}
            title="Sin movimientos"
            sub={
              movements.length === 0
                ? "Los movimientos aparecerán aquí cuando agregues, edites o elimines productos"
                : "No hay movimientos que coincidan con el filtro"
            }
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const meta = TYPE_META[m.type] || TYPE_META.ajuste;
                  const Icon = meta.Icon;
                  return (
                    <tr key={m.id}>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt_date(m.date)}
                      </td>

                      <td className="td-name">{m.productName}</td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: `${meta.color}18`,
                            color: meta.color,
                          }}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      </td>

                      <td style={{ fontWeight: 700 }}>
                        <span
                          style={{
                            color:
                              m.type === "entrada" || m.type === "creacion"
                                ? "var(--green)"
                                : m.type === "salida" ||
                                    m.type === "eliminacion"
                                  ? "var(--red)"
                                  : "var(--blue)",
                          }}
                        >
                          {m.type === "salida" || m.type === "eliminacion"
                            ? "−"
                            : "+"}
                          {m.qty}
                        </span>
                      </td>

                      <td style={{ color: "var(--text3)", fontSize: 13 }}>
                        {m.note || "—"}
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
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text3)" }}>
          Mostrando {filtered.length} de {movements.length} movimientos
        </div>
      )}
    </div>
  );
}
