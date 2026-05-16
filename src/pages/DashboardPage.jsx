// src/pages/DashboardPage.jsx
import { fmt }          from '../utils/helpers.js';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth }      from '../context/AuthContext';
import {
  DailyBarChart, LineAreaChart, DonutChart,
  HorizontalBarChart, ChartLegend,
} from '../components/atoms/ChartComponents';
import '../styles/dashboard.css';

import {
  Package, Wallet, AlertTriangle,
  TrendingUp, TrendingDown, Download,
  ArrowRight, ShoppingCart, DollarSign,
  BarChart2, Activity, CheckCircle,
} from 'lucide-react';

function KPI({ label, value, sub, color, icon: Icon, accent }) {
  return (
    <div className={`card kpi-card${accent ? ' kpi-accent' : ''}`}>
      <div className="kpi-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ color: color || 'var(--text)' }}>{value}</div>
        </div>
        <div className="kpi-icon" style={{ background: `${color || 'var(--accent)'}18`, flexShrink: 0 }}>
          <Icon size={18} color={color || 'var(--accent)'} />
        </div>
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

const fmtShort = iso =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

export default function DashboardPage({ setPage }) {
  const { user } = useAuth();
  const { products, invStats, salesStats, recentSales, exportCSV, getStatus } = useDashboard();

  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const margin    = invStats.inversionTotal > 0
    ? ((invStats.gananciasTotal / invStats.inversionTotal) * 100).toFixed(1)
    : '0.0';
  const hasData   = salesStats.totalSales > 0;

  const donutSlices      = salesStats.topCategories.map(c => ({ name: c.name, value: c.revenue, color: c.color }));
  const topProductItems  = salesStats.topProducts.slice(0, 5).map(p => ({
    name: p.name, value: p.revenue, profit: p.profit, color: p.categoryColor,
  }));

  return (
    <div className="page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{greeting}, {firstName} </h1>
          <p className="dashboard-subtitle">
            {products.length} productos · {salesStats.totalSales} ventas · {invStats.low.length + invStats.out.length} alertas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportCSV}><Download size={14} /> CSV</button>
          <button className="btn btn-primary" onClick={() => setPage('sales')}><ShoppingCart size={14} /> Nueva venta</button>
        </div>
      </div>

      {/* KPIs VENTAS */}
      <div className="section-label">Ventas reales</div>
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KPI label="Ganancia hoy"       value={fmt(salesStats.profitToday)}  sub={`${salesStats.unitsToday} uds · ${fmt(salesStats.revenueToday)} ingresos`} color="var(--green)"  icon={TrendingUp} accent />
        <KPI label="Esta semana"        value={fmt(salesStats.profitWeek)}   sub={`Ingresos: ${fmt(salesStats.revenueWeek)}`}  color="var(--blue)"   icon={DollarSign} />
        <KPI label="Este mes"           value={fmt(salesStats.profitMonth)}  sub={`Ingresos: ${fmt(salesStats.revenueMonth)}`} color="var(--accent)" icon={BarChart2} />
        <KPI label="Ventas registradas" value={salesStats.totalSales}        sub={`Ganancia total: ${fmt(salesStats.profitTotal)}`} color="var(--purple)" icon={Activity} />
      </div>

      {/* KPIs INVENTARIO */}
      <div className="section-label">Inventario (proyección sobre stock)</div>
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPI label="Inversión total"    value={fmt(invStats.inversionTotal)}  sub="Costo de compra en stock"   color="var(--red)"    icon={TrendingDown} />
        <KPI label="Ingresos esperados" value={fmt(invStats.ingresosTotal)}   sub="Si vendieras todo el stock" color="var(--blue)"   icon={Wallet} />
        <KPI label="Ganancia potencial" value={fmt(invStats.gananciasTotal)}  sub={`Margen: ${margin}%`}       color={invStats.gananciasTotal >= 0 ? 'var(--green)' : 'var(--red)'} icon={invStats.gananciasTotal >= 0 ? TrendingUp : TrendingDown} />
        <KPI label="Alertas de stock"   value={invStats.low.length + invStats.out.length} sub={`${invStats.out.length} agotados · ${invStats.low.length} bajos`} color="var(--yellow)" icon={AlertTriangle} />
      </div>

      {/* CHARTS ROW */}
      <div className="chart-grid" style={{ marginBottom: 22 }}>

        {/* Barras diarias */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Ganancias diarias</div>
              <div className="chart-subtitle">Últimos 15 días · ventas reales</div>
            </div>
            <ChartLegend items={[
              { label: 'Ganancia', color: '#22c55e' },
              { label: 'Ingresos', color: '#7c6fff55' },
            ]} />
          </div>
          {!hasData ? (
            <div className="chart-empty">
              <BarChart2 size={28} style={{ opacity: .3 }} />
              <div>Registra tu primera venta para ver la gráfica</div>
              <button className="btn btn-primary btn-sm" onClick={() => setPage('sales')}><ShoppingCart size={13} /> Ir a Ventas</button>
            </div>
          ) : (
            <DailyBarChart data={salesStats.dailyChart} height={190} />
          )}
        </div>

        {/* Top productos */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Más vendidos</div>
              <div className="chart-subtitle">Por ingresos acumulados</div>
            </div>
            {donutSlices.length > 0 && (
              <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                <DonutChart slices={donutSlices} height={56} />
              </div>
            )}
          </div>
          {topProductItems.length === 0 ? (
            <div className="chart-empty">
              <Package size={28} style={{ opacity: .3 }} />
              <div>Sin ventas registradas aún</div>
            </div>
          ) : (
            <HorizontalBarChart items={topProductItems} />
          )}
        </div>
      </div>

      {/* TENDENCIA ACUMULADA */}
      {hasData && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="chart-title">Tendencia acumulada</div>
              <div className="chart-subtitle">Ingresos y ganancias acumuladas — últimos 15 días</div>
            </div>
            <ChartLegend items={[
              { label: 'Ingresos acum.', color: '#3b82f6' },
              { label: 'Ganancia acum.', color: '#22c55e' },
            ]} />
          </div>
          <LineAreaChart data={salesStats.dailyChart} height={160} />
        </div>
      )}

      {/* BOTTOM ROW */}
      <div className="bottom-grid">

        {/* Ventas recientes */}
        <div className="card activity-card">
          <div className="activity-header">
            <span className="activity-title">Ventas recientes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('sales')}>Ver todo <ArrowRight size={12} /></button>
          </div>
          {recentSales.length === 0 ? (
            <div className="chart-empty" style={{ padding: '32px 0' }}>
              <ShoppingCart size={24} style={{ opacity: .3 }} />
              <div style={{ fontSize: 13 }}>Sin ventas registradas</div>
              <button className="btn btn-primary btn-sm" onClick={() => setPage('sales')}>Registrar venta</button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>Ingresos</th><th>Ganancia</th><th>Fecha</th></tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.categoryColor || 'var(--accent)'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShoppingCart size={12} color={s.categoryColor || 'var(--accent)'} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.productName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.categoryName}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.qty} <span style={{ color: 'var(--text3)', fontSize: 11 }}>{s.unit}</span></td>
                      <td style={{ color: 'var(--blue)',  fontWeight: 700 }}>{fmt(s.revenue)}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(s.profit)}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtShort(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Alertas */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Alertas de stock</div>
              {(invStats.low.length + invStats.out.length) > 0 && (
                <span className="badge badge-red"><AlertTriangle size={11} /> {invStats.low.length + invStats.out.length}</span>
              )}
            </div>
            {invStats.low.length + invStats.out.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text3)', fontSize: 13 }}>
                <CheckCircle size={22} style={{ color: 'var(--green)', display: 'block', margin: '0 auto 6px' }} />
                ¡Todo el inventario en orden!
              </div>
            ) : (
              <div>
                {[...invStats.out, ...invStats.low].slice(0, 5).map(p => {
                  const s = getStatus(p);
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'agotado' ? 'var(--red)' : 'var(--yellow)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)' }}>{p.quantity} {p.unit}</span>
                    </div>
                  );
                })}
                {(invStats.low.length + invStats.out.length) > 5 && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setPage('alerts')}>Ver todas <ArrowRight size={12} /></button>
                )}
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => setPage('orders')}>
                  <ArrowRight size={12} /> Crear orden de compra
                </button>
              </div>
            )}
          </div>

          {/* Donut categorías + lista */}
          {donutSlices.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Ventas por categoría</div>
              <DonutChart slices={donutSlices} height={150} />
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {salesStats.topCategories.slice(0, 5).map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      {c.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>+{fmt(c.profit)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => setPage('sales')}><ShoppingCart size={15} /> Registrar venta <ArrowRight size={14} /></button>
        <button className="btn btn-ghost" onClick={() => setPage('caja')}><Wallet size={15} /> Corte de caja</button>
        <button className="btn btn-ghost" onClick={() => setPage('products')}><Package size={15} /> Ver productos</button>
        <button className="btn btn-ghost" onClick={exportCSV}><Download size={15} /> Exportar CSV</button>
      </div>
    </div>
  );
}
