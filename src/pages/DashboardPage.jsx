import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils/helpers.js';

import {
  Package,
  Wallet,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PartyPopper,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

export default function DashboardPage({ setPage }) {
  const { products, categories, getStatus, exportCSV } = useApp();

  /* ── Derived data ───────────────────────────────────────── */
  const stats = useMemo(() => {
    const low = [];
    const out = [];
    let inversionTotal  = 0;
    let ingresosTotal   = 0;

    for (const p of products) {
      const s = getStatus(p);
      if (s === 'bajo')    low.push(p);
      if (s === 'agotado') out.push(p);

      const purchasePrice = p.purchasePrice || 0;
      inversionTotal += purchasePrice * p.quantity;
      ingresosTotal  += p.price       * p.quantity;
    }

    return {
      low,
      out,
      inversionTotal,
      ingresosTotal,
      gananciasTotal: ingresosTotal - inversionTotal,
      okCount: products.length - low.length - out.length,
    };
  }, [products, getStatus]);

  const catStats = useMemo(() => {
    return categories
      .map(c => {
        const prods = products.filter(p => p.categoryId === c.id);
        const inversion = prods.reduce((s, p) => s + (p.purchasePrice || 0) * p.quantity, 0);
        const ingresos  = prods.reduce((s, p) => s + p.price * p.quantity, 0);
        return {
          ...c,
          count:    prods.length,
          inversion,
          ingresos,
          ganancia: ingresos - inversion,
          value:    ingresos,   // barra de progreso por ingresos
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categories, products]);

  const maxValue = Math.max(...catStats.map(c => c.value), 1);

  /* ── UI ─────────────────────────────────────────────────── */
  return (
    <div className="page">
      {/* ── Stats row 1: conteos ──────────────────────────── */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Productos</div>
              <div className="stat-value">{products.length}</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="stat-sub">{categories.length} categorías activas</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Stock Bajo</div>
              <div className="stat-value" style={{ color: 'var(--yellow)' }}>
                {stats.low.length}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-sub">{stats.out.length} productos agotados</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Disponibles</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {stats.okCount}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-sub">En buen estado</div>
        </div>
      </div>

      {/* ── Stats row 2: financieros ──────────────────────── */}
      <div className="stats-grid" style={{ marginTop: 16 }}>
        {/* Inversión Total */}
        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Inversión Total</div>
              <div className="stat-value" style={{ fontSize: 18, color: 'var(--red)' }}>
                {fmt(stats.inversionTotal)}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--red)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-sub">Costo de compra en stock</div>
        </div>

        {/* Ingresos esperados */}
        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Ingresos Esperados</div>
              <div className="stat-value" style={{ fontSize: 18, color: 'var(--blue)' }}>
                {fmt(stats.ingresosTotal)}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-sub">Valor de venta total en stock</div>
        </div>

        {/* Ganancias Totales */}
        <div className="card stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Ganancias Totales</div>
              <div
                className="stat-value"
                style={{
                  fontSize: 18,
                  color: stats.gananciasTotal >= 0 ? 'var(--green)' : 'var(--red)',
                }}
              >
                {fmt(stats.gananciasTotal)}
              </div>
            </div>
            <div
              className="stat-icon"
              style={{
                background: stats.gananciasTotal >= 0 ? 'var(--green-dim)' : 'rgba(248,113,113,0.15)',
                color:      stats.gananciasTotal >= 0 ? 'var(--green)'     : 'var(--red)',
              }}
            >
              {stats.gananciasTotal >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>
          <div className="stat-sub">
            Margen:{' '}
            {stats.inversionTotal > 0
              ? ((stats.gananciasTotal / stats.inversionTotal) * 100).toFixed(1) + '%'
              : '—'}
          </div>
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* ── Category value bars ────────────────────────── */}
        <div className="card" style={{ padding: 20, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            Ingresos / Ganancias por Categoría
          </div>

          {catStats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 size={28} />
              </div>
              <div>Sin datos aún</div>
            </div>
          ) : (
            catStats.map(c => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 13 }}>
                  <span>
                    {c.name}{' '}
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>
                      ({c.count} prod.)
                    </span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{fmt(c.ingresos)}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(c.value / maxValue) * 100}%`,
                      background: c.color,
                    }}
                  />
                </div>
                {/* Fila inversión / ganancia */}
                <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 3, color: 'var(--text3)' }}>
                  <span>
                    Inversión:{' '}
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(c.inversion)}</span>
                  </span>
                  <span>
                    Ganancia:{' '}
                    <span
                      style={{
                        color: c.ganancia >= 0 ? 'var(--green)' : 'var(--red)',
                        fontWeight: 600,
                      }}
                    >
                      {fmt(c.ganancia)}
                    </span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Alerts panel ───────────────────────────────── */}
        <div className="card" style={{ padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
              Alertas de Stock
            </div>
            {(stats.low.length + stats.out.length) > 0 && (
              <span className="badge badge-red">
                {stats.low.length + stats.out.length}
              </span>
            )}
          </div>

          {stats.low.length === 0 && stats.out.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">
                <PartyPopper size={28} />
              </div>
              <div className="empty-title">¡Todo en orden!</div>
              <div className="empty-sub">No hay productos con stock bajo</div>
            </div>
          ) : (
            <div className="alert-list">
              {[...stats.out, ...stats.low].slice(0, 8).map(p => {
                const s = getStatus(p);
                return (
                  <div key={p.id} className="alert-item">
                    <div className="alert-item-name">{p.name}</div>
                    <div
                      style={{
                        color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)',
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {p.quantity} {p.unit}
                    </div>
                    <span className={`badge ${s === 'agotado' ? 'badge-red' : 'badge-yellow'}`}>
                      <span className="badge-dot" />
                      {s === 'agotado' ? 'Agotado' : 'Bajo'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={() => setPage('products')}>
          <Package size={16} />
          Ver Productos
        </button>
        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={16} />
          Exportar CSV
        </button>
      </div>
    </div>
  );
}