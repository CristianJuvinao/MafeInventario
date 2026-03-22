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
} from 'lucide-react';

export default function DashboardPage({ setPage }) {
  const { products, categories, getStatus, exportCSV } = useApp();

  /* ── Derived data ───────────────────────────────────────── */
  const stats = useMemo(() => {
    const low = [];
    const out = [];
    let total = 0;

    for (const p of products) {
      const s = getStatus(p);
      if (s === 'bajo') low.push(p);
      if (s === 'agotado') out.push(p);
      total += p.price * p.quantity;
    }

    return {
      low,
      out,
      totalValue: total,
      okCount: products.length - low.length - out.length,
    };
  }, [products, getStatus]);

  const catStats = useMemo(() => {
    return categories
      .map(c => {
        const prods = products.filter(p => p.categoryId === c.id);
        return {
          ...c,
          count: prods.length,
          value: prods.reduce((s, p) => s + p.price * p.quantity, 0),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categories, products]);

  const maxValue = Math.max(...catStats.map(c => c.value), 1);

  /* ── UI ─────────────────────────────────────────────────── */
  return (
    <div className="page">
      {/* ── Stats ─────────────────────────────────────────── */}
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
              <div className="stat-label">Valor del Inventario</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {fmt(stats.totalValue)}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-sub">Suma total en stock</div>
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

      {/* ── Charts row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Category value bars ────────────────────────── */}
        <div className="card" style={{ padding: 20, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            Valor por Categoría
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
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span>
                    {c.name}{' '}
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>
                      ({c.count} prod.)
                    </span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{fmt(c.value)}</span>
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