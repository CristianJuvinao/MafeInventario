// src/pages/DashboardPage.jsx
import { Package, Wallet, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { fmt } from '../utils/helpers.js';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard }     from '../components/molecules/StatCard';
import { CategoryBars } from '../components/molecules/CategoryBars';
import { AlertsPanel }  from '../components/molecules/AlertsPanel';

export default function DashboardPage({ setPage }) {
  const { products, categories, stats, catStats, maxValue, exportCSV } = useDashboard();

  return (
    <div className="page">

      {/* ── Conteos ───────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          label="Total Productos"
          value={products.length}
          icon={<Package size={20} />}
          iconStyle={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
          sub={`${categories.length} categorías activas`}
        />
        <StatCard
          label="Stock Bajo"
          value={stats.low.length}
          valueStyle={{ color: 'var(--yellow)' }}
          icon={<AlertTriangle size={20} />}
          iconStyle={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}
          sub={`${stats.out.length} productos agotados`}
        />
        <StatCard
          label="Disponibles"
          value={stats.okCount}
          valueStyle={{ color: 'var(--green)' }}
          icon={<CheckCircle size={20} />}
          iconStyle={{ background: 'var(--green-dim)', color: 'var(--green)' }}
          sub="En buen estado"
        />
      </div>

      {/* ── Financieros ───────────────────────────────────── */}
      <div className="stats-grid" style={{ marginTop: 16 }}>
        <StatCard
          label="Inversión Total"
          value={fmt(stats.inversionTotal)}
          valueStyle={{ fontSize: 18, color: 'var(--red)' }}
          icon={<TrendingDown size={20} />}
          iconStyle={{ background: 'rgba(248,113,113,0.15)', color: 'var(--red)' }}
          sub="Costo de compra en stock"
        />
        <StatCard
          label="Ingresos Esperados"
          value={fmt(stats.ingresosTotal)}
          valueStyle={{ fontSize: 18, color: 'var(--blue)' }}
          icon={<Wallet size={20} />}
          iconStyle={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
          sub="Valor de venta total en stock"
        />
        <StatCard
          label="Ganancias Totales"
          value={fmt(stats.gananciasTotal)}
          valueStyle={{ fontSize: 18, color: stats.gananciasTotal >= 0 ? 'var(--green)' : 'var(--red)' }}
          icon={stats.gananciasTotal >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          iconStyle={{
            background: stats.gananciasTotal >= 0 ? 'var(--green-dim)' : 'rgba(248,113,113,0.15)',
            color:      stats.gananciasTotal >= 0 ? 'var(--green)'     : 'var(--red)',
          }}
          sub={`Margen: ${stats.inversionTotal > 0
            ? ((stats.gananciasTotal / stats.inversionTotal) * 100).toFixed(1) + '%'
            : '—'}`}
        />
      </div>

      {/* ── Gráficos ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <CategoryBars catStats={catStats} maxValue={maxValue} />
        <AlertsPanel  low={stats.low} out={stats.out} />
      </div>

      {/* ── Acciones ──────────────────────────────────────── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={() => setPage('products')}>
          <Package size={16} /> Ver Productos
        </button>
        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

    </div>
  );
}
