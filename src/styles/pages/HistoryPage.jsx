// src/pages/HistoryPage.jsx
import {
  ArrowDownCircle, ArrowUpCircle, SlidersHorizontal,
  PlusCircle, MinusCircle, Trash2, History, Search,
} from 'lucide-react';
import { EmptyState }                        from '../components/atoms';
import { StatCard, ConfirmDialog, MovementModal } from '../components/molecules';
import { useHistory }                        from '../hooks/useHistory';

const TYPE_META = {
  entrada:     { label: 'Entrada',   color: 'var(--green)',  Icon: ArrowDownCircle },
  salida:      { label: 'Salida',    color: 'var(--red)',    Icon: ArrowUpCircle },
  ajuste:      { label: 'Ajuste',    color: 'var(--blue)',   Icon: SlidersHorizontal },
  creacion:    { label: 'Creación',  color: 'var(--accent)', Icon: PlusCircle },
  eliminacion: { label: 'Eliminado', color: 'var(--text3)',  Icon: MinusCircle },
};

const fmt_date = iso =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function HistoryPage() {
  const {
    movements, filtered, summary,
    search, setSearch,
    typeFilter, setTypeFilter,
    showModal, setShowModal,
    confirmClear, setConfirmClear, handleClear,
  } = useHistory();

  return (
    <div className="page">

      {showModal && <MovementModal onClose={() => setShowModal(false)} />}

      {confirmClear && (
        <ConfirmDialog
          msg={`¿Eliminar todos los ${movements.length} registros del historial? Esta acción no se puede deshacer.`}
          onConfirm={handleClear}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Historial
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Registro completo de todos los movimientos de inventario.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Movimientos"
          value={summary.total}
          icon={<History size={19} />}
          iconStyle={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
        />
        <StatCard
          label="Entradas"
          value={summary.entradas}
          valueStyle={{ color: 'var(--green)' }}
          icon={<ArrowDownCircle size={19} />}
          iconStyle={{ background: 'var(--green-dim)', color: 'var(--green)' }}
          sub="unidades ingresadas"
        />
        <StatCard
          label="Salidas"
          value={summary.salidas}
          valueStyle={{ color: 'var(--red)' }}
          icon={<ArrowUpCircle size={19} />}
          iconStyle={{ background: 'var(--red-dim)', color: 'var(--red)' }}
          sub="unidades retiradas"
        />
        <StatCard
          label="Ajustes"
          value={summary.ajustes}
          valueStyle={{ color: 'var(--blue)' }}
          icon={<SlidersHorizontal size={19} />}
          iconStyle={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
          sub="correcciones de stock"
        />
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            placeholder="Buscar producto o nota..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {movements.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setConfirmClear(true)}>
            <Trash2 size={14} /> Limpiar historial
          </button>
        )}

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <SlidersHorizontal size={14} /> Nuevo movimiento
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History size={32} />}
            title="Sin movimientos"
            sub={
              movements.length === 0
                ? 'Los movimientos aparecerán aquí cuando realices cambios en el inventario'
                : 'No hay movimientos que coincidan con el filtro'
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
                {filtered.map(m => {
                  const meta = TYPE_META[m.type] || TYPE_META.ajuste;
                  const Icon = meta.Icon;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {fmt_date(m.date)}
                      </td>

                      <td className="td-name">{m.productName}</td>

                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700,
                          background: `${meta.color}18`, color: meta.color,
                        }}>
                          <Icon size={12} /> {meta.label}
                        </span>
                      </td>

                      <td style={{ fontWeight: 700 }}>
                        <span style={{
                          color:
                            m.type === 'entrada' || m.type === 'creacion'    ? 'var(--green)' :
                            m.type === 'salida'  || m.type === 'eliminacion' ? 'var(--red)'   :
                            'var(--blue)',
                        }}>
                          {m.type === 'salida' || m.type === 'eliminacion' ? '−' : '+'}
                          {m.qty}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>
                        {m.note || '—'}
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
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          Mostrando {filtered.length} de {movements.length} movimientos
        </div>
      )}
    </div>
  );
}