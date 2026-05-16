// src/pages/OrdersPage.jsx
// Órdenes de compra: vincula proveedores → productos con stock bajo/agotado.
import { useState, useMemo } from 'react';
import { useApp }  from '../context/AppContext';
import { fmt }     from '../utils/helpers.js';
import {
  ClipboardList, Plus, Truck, Package,
  CheckCircle, Clock, Send, X, Trash2,
  ChevronDown, ChevronUp, AlertTriangle,
  ArrowRight, ShoppingBag,
} from 'lucide-react';

/* ── Colores por estado ─────────────────────────────────── */
const STATUS = {
  pendiente: { label: 'Pendiente',  color: 'var(--yellow)', bg: 'var(--yellow-dim)', icon: Clock },
  enviada:   { label: 'Enviada',    color: 'var(--blue)',   bg: 'var(--blue-dim)',   icon: Send },
  recibida:  { label: 'Recibida',   color: 'var(--green)',  bg: 'var(--green-dim)',  icon: CheckCircle },
  cancelada: { label: 'Cancelada',  color: 'var(--text3)',  bg: 'var(--surface2)',   icon: X },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pendiente;
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

const fmtDate = iso => new Date(iso).toLocaleDateString('es-CO', {
  day: '2-digit', month: 'short', year: 'numeric',
});

/* ══════════════════════════════════════════════════════════
   Modal: Nueva Orden
══════════════════════════════════════════════════════════ */
function NewOrderModal({ onClose, onSave, products, categories, getStatus }) {
  const { suppliers } = useApp();
  const activeSuppliers = suppliers.filter(s => s.active !== false);

  const [supplierId,   setSupplierId]   = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes,        setNotes]        = useState('');
  const [items,        setItems]        = useState([]);
  const [search,       setSearch]       = useState('');

  const handleSupplierChange = e => {
    const id = e.target.value;
    setSupplierId(id);
    const found = activeSuppliers.find(s => s.id === id);
    setSupplierName(found ? found.name : '');
  };

  // Pre-populate with low/out stock products
  const alertProducts = useMemo(() =>
    products
      .filter(p => getStatus(p) !== 'ok')
      .sort((a, b) => a.quantity - b.quantity),
    [products, getStatus]
  );

  const filteredProducts = useMemo(() =>
    products
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const sa = getStatus(a) !== 'ok' ? 0 : 1;
        const sb = getStatus(b) !== 'ok' ? 0 : 1;
        return sa - sb || a.name.localeCompare(b.name);
      }),
    [products, search, getStatus]
  );

  const addItem = (p) => {
    if (items.find(i => i.productId === p.id)) return;
    const neededQty = Math.max(1, p.minStock - p.quantity + p.minStock);
    const newItems = [...items, {
      productId:   p.id,
      productName: p.name,
      qty:         neededQty,
      unitCost:    p.purchasePrice || 0,
    }];
    setItems(newItems);
    // Auto-select supplier if product has one and no supplier is selected yet
    if (!supplierId && p.supplierId) {
      const found = activeSuppliers.find(s => s.id === p.supplierId);
      if (found) { setSupplierId(found.id); setSupplierName(found.name); }
    }
    setSearch('');
  };

  const removeItem = (productId) =>
    setItems(prev => prev.filter(i => i.productId !== productId));

  const updateItem = (productId, field, value) =>
    setItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, [field]: Math.max(1, Number(value) || 1) } : i
    ));

  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0);

  const submit = () => {
    if (!items.length) return;
    onSave({ supplierId, supplierName, notes, items });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>

        <div className="modal-header">
          <span className="modal-title">Nueva orden de compra</span>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">

          {/* Sugerencia: productos con alerta */}
          {alertProducts.length > 0 && (
            <div style={{
              background: 'var(--yellow-dim)', border: '1px solid rgba(217,119,6,.2)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--yellow)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> {alertProducts.length} producto{alertProducts.length !== 1 ? 's' : ''} necesitan reabastecimiento
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {alertProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    disabled={!!items.find(i => i.productId === p.id)}
                    style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 99,
                      border: '1px solid rgba(217,119,6,.3)',
                      background: items.find(i => i.productId === p.id) ? 'var(--yellow)' : 'transparent',
                      color: items.find(i => i.productId === p.id) ? '#fff' : 'var(--yellow)',
                      cursor: items.find(i => i.productId === p.id) ? 'default' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {items.find(i => i.productId === p.id) ? '✓ ' : '+ '}{p.name}
                    <span style={{ opacity: .7, marginLeft: 4 }}>({p.quantity} {p.unit})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Proveedor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div className="form-group">
              <label>Proveedor</label>
              <select
                className="form-select"
                value={supplierId}
                onChange={handleSupplierChange}
              >
                <option value="">— Sin proveedor —</option>
                {activeSuppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <input
                type="text"
                placeholder="Observaciones opcionales"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Buscador de productos */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Agregar productos</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar producto para agregar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <div style={{
                marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 10, overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
              }}>
                {filteredProducts.slice(0, 8).map(p => {
                  const s = getStatus(p);
                  const inCart = !!items.find(i => i.productId === p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => !inCart && addItem(p)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '9px 14px', cursor: inCart ? 'default' : 'pointer',
                        borderBottom: '1px solid var(--border)',
                        background: inCart ? 'var(--surface2)' : 'transparent',
                        opacity: inCart ? .5 : 1,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Stock: {p.quantity} {p.unit}</div>
                      </div>
                      {s !== 'ok' && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)' }}>
                          {s === 'agotado' ? 'Agotado' : 'Bajo'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lista de ítems */}
          {items.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>
                Productos en la orden ({items.length})
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Producto</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 80 }}>Cantidad</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 110 }}>Costo unit.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 110 }}>Subtotal</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.productId} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>{item.productName}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <input
                            type="number" min="1" value={item.qty}
                            onChange={e => updateItem(item.productId, 'qty', e.target.value)}
                            style={{ width: 64, textAlign: 'center', padding: '4px 6px', fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <input
                            type="number" min="0" value={item.unitCost}
                            onChange={e => updateItem(item.productId, 'unitCost', e.target.value)}
                            style={{ width: 90, textAlign: 'right', padding: '4px 6px', fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                          {fmt(item.qty * item.unitCost)}
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <button className="btn-icon" onClick={() => removeItem(item.productId)}>
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--surface2)' }}>
                      <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13 }}>Total orden</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--accent)' }}>
                        {fmt(total)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={!items.length}
              style={{ opacity: !items.length ? .5 : 1, cursor: !items.length ? 'not-allowed' : 'pointer' }}
            >
              <ClipboardList size={15} /> Crear orden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Order Card
══════════════════════════════════════════════════════════ */
function OrderCard({ order, onUpdateStatus, onReceive, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const canReceive  = order.status === 'enviada' || order.status === 'pendiente';
  const canDelete   = order.status === 'pendiente' || order.status === 'cancelada';
  const canSend     = order.status === 'pendiente';
  const canCancel   = order.status === 'pendiente' || order.status === 'enviada';

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
      {/* Header row */}
      <div
        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: STATUS[order.status]?.bg || 'var(--surface2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShoppingBag size={18} color={STATUS[order.status]?.color || 'var(--text3)'} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {order.supplierName || 'Sin proveedor'}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {fmtDate(order.date)} · {order.items?.length || 0} producto{order.items?.length !== 1 ? 's' : ''}
            {order.notes && <span> · {order.notes}</span>}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(order.total || 0)}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>total</div>
        </div>

        <div style={{ color: 'var(--text3)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded: items + actions */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Items table */}
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'center' }}>Cantidad</th>
                  <th style={{ textAlign: 'right' }}>Costo unit.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map(item => (
                  <tr key={item.productId}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Package size={13} color="var(--text3)" />
                        {item.productName}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(item.unitCost)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--blue)' }}>
                      {fmt(item.qty * item.unitCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td colSpan={3} style={{ fontWeight: 700, paddingTop: 10, color: 'var(--text2)', fontSize: 13 }}>Total</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, paddingTop: 10, color: 'var(--accent)' }}>
                    {fmt(order.total || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '12px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
            {canSend && (
              <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(order.id, 'enviada')}>
                <Send size={13} /> Marcar enviada
              </button>
            )}
            {canReceive && (
              <button className="btn btn-primary btn-sm" onClick={() => onReceive(order)}>
                <CheckCircle size={13} /> Recibir mercancía <ArrowRight size={12} />
              </button>
            )}
            {canCancel && order.status !== 'cancelada' && (
              <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(order.id, 'cancelada')}>
                <X size={13} /> Cancelar
              </button>
            )}
            {canDelete && (
              <button
                className="btn btn-danger btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => onDelete(order.id)}
              >
                <Trash2 size={13} />
              </button>
            )}
            {order.status === 'recibida' && (
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={13} /> Stock actualizado el {fmtDate(order.receivedAt || order.date)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function OrdersPage({ setPage }) {
  const {
    orders, products, categories,
    createOrder, updateOrderStatus, receiveOrder, deleteOrder,
    getStatus,
  } = useApp();

  const [showNew,     setShowNew]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // KPIs
  const pendientes = orders.filter(o => o.status === 'pendiente').length;
  const enviadas   = orders.filter(o => o.status === 'enviada').length;
  const totalInvertido = orders
    .filter(o => o.status === 'recibida')
    .reduce((s, o) => s + (o.total || 0), 0);

  const alertCount = products.filter(p => getStatus(p) !== 'ok').length;

  const filtered = useMemo(() =>
    orders.filter(o => !statusFilter || o.status === statusFilter),
    [orders, statusFilter]
  );

  const handleCreate = async (data) => {
    await createOrder(data);
    setShowNew(false);
  };

  const handleReceive = async (order) => {
    if (!window.confirm(`¿Confirmar recepción de la orden de "${order.supplierName}"?\nEsto sumará el stock de ${order.items.length} producto(s) automáticamente.`)) return;
    await receiveOrder(order);
  };

  return (
    <div className="page">

      {showNew && (
        <NewOrderModal
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
          products={products}
          categories={categories}
          getStatus={getStatus}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Órdenes de compra</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {orders.length} órdenes · {alertCount > 0 ? `${alertCount} productos necesitan reabastecimiento` : 'Todo el stock en orden'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {alertCount > 0 && (
            <button className="btn btn-ghost" onClick={() => setPage('alerts')}>
              <AlertTriangle size={14} /> Ver alertas
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={15} /> Nueva orden
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pendientes',     value: pendientes,        color: 'var(--yellow)', icon: Clock },
          { label: 'Enviadas',       value: enviadas,          color: 'var(--blue)',   icon: Truck },
          { label: 'Total recibido', value: fmt(totalInvertido), color: 'var(--green)', icon: CheckCircle },
          { label: 'Alertas stock',  value: alertCount,        color: alertCount > 0 ? 'var(--red)' : 'var(--green)', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'Todas' },
          { key: 'pendiente', label: 'Pendientes' },
          { key: 'enviada',   label: 'Enviadas' },
          { key: 'recibida',  label: 'Recibidas' },
          { key: 'cancelada', label: 'Canceladas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className="btn btn-sm"
            style={{
              background: statusFilter === f.key ? 'var(--accent)' : 'var(--surface)',
              color:      statusFilter === f.key ? '#fff' : 'var(--text2)',
              border: 'none',
              boxShadow: statusFilter === f.key ? '0 2px 10px var(--accent-glow)' : 'var(--shadow)',
              fontWeight: 600, fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <ClipboardList size={36} style={{ opacity: .25, display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text2)', marginBottom: 6 }}>
            {orders.length === 0 ? 'Sin órdenes de compra' : 'No hay órdenes con este filtro'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
            {orders.length === 0
              ? 'Crea tu primera orden para gestionar el reabastecimiento de inventario'
              : 'Prueba con otro filtro de estado'}
          </div>
          {orders.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={14} /> Crear primera orden
            </button>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={updateOrderStatus}
              onReceive={handleReceive}
              onDelete={deleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
