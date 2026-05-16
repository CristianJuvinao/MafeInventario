// src/pages/DashboardPage.jsx
import { fmt }          from '../utils/helpers.js';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth }      from '../context/AuthContext';
import '../styles/dashboard.css';

import {
  Package, Wallet, AlertTriangle,
  TrendingUp, TrendingDown, Download,
  ArrowRight, ShoppingCart, DollarSign,
  BarChart2, Activity, CheckCircle,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   SVG Bar Chart — ganancias diarias reales
════════════════════════════════════════════════════════ */
function SalesBarChart({ data, mode = 'profit' }) {
  const W = 560, H = 140, BAR_W = 28, GAP = 8;
  const total  = data.length;
  const slotW  = (W - GAP) / total;
  const values = data.map(d => d[mode]);
  const max    = Math.max(...values, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--accent)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="barGradToday" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--green)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={0} y1={H - H * f} x2={W} y2={H - H * f}
          stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const v  = d[mode];
        const bh = Math.max(v > 0 ? 4 : 0, (v / max) * H);
        const x  = i * slotW + (slotW - BAR_W) / 2;
        const y  = H - bh;
        return (
          <g key={d.day}>
            <rect x={x} y={y} width={BAR_W} height={bh} rx={5}
              fill={v > 0 ? (d.isToday ? 'url(#barGradToday)' : 'url(#barGrad)') : 'var(--surface3)'}
              opacity={d.isToday ? 1 : 0.75}
            />
            {v > 0 && <title>{d.day}: {fmt(v)}</title>}
            <text x={x + BAR_W / 2} y={H + 18}
              textAnchor="middle" fontSize={9}
              fill={d.isToday ? 'var(--accent)' : 'var(--text3)'}
              fontWeight={d.isToday ? '700' : '400'}
              fontFamily="var(--font-body)">
              {d.label}
            </text>
            {d.isToday && <circle cx={x + BAR_W / 2} cy={H + 26} r={2.5} fill="var(--accent)" />}
          </g>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   Donut — distribución de ventas por categoría
════════════════════════════════════════════════════════ */
function DonutChart({ slices, size = 64 }) {
  const R = 26, CX = size / 2, CY = size / 2;
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <svg width={size} height={size}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface3)" strokeWidth={10} />
    </svg>
  );
  let angle = -Math.PI / 2;
  const arcs = slices.map(s => {
    const sweep = (s.value / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle);
    const y1 = CY + R * Math.sin(angle);
    angle += sweep;
    const x2 = CX + R * Math.cos(angle);
    const y2 = CY + R * Math.sin(angle);
    return { ...s, d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z` };
  });
  return (
    <svg width={size} height={size}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} opacity={0.85} />)}
      <circle cx={CX} cy={CY} r={R - 10} fill="var(--surface)" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   KPI Card
════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════
   Format date short
════════════════════════════════════════════════════════ */
const fmtShort = iso =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function DashboardPage({ setPage }) {
  const { user } = useAuth();
  const {
    products, invStats, salesStats,
    recentSales, exportCSV, getStatus,
  } = useDashboard();

  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const margin = invStats.inversionTotal > 0
    ? ((invStats.gananciasTotal / invStats.inversionTotal) * 100).toFixed(1)
    : '0.0';

  const donutSlices = salesStats.topCategories.map(c => ({ value: c.revenue, color: c.color }));

  return (
    <div className="page">

      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{greeting}, {firstName} </h1>
          <p className="dashboard-subtitle">
            {products.length} productos · {salesStats.totalSales} ventas · {invStats.low.length + invStats.out.length} alertas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportCSV}><Download size={14} /> CSV</button>
          <button className="btn btn-primary" onClick={() => setPage('sales')}>
            <ShoppingCart size={14} /> Nueva venta
          </button>
        </div>
      </div>

      {/* ── KPIs VENTAS REALES ── */}
      <div className="section-label">Ventas reales</div>
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KPI label="Ganancia hoy"          value={fmt(salesStats.profitToday)}  sub={`${salesStats.unitsToday} uds · ${fmt(salesStats.revenueToday)} ingresos`} color="var(--green)"  icon={TrendingUp}  accent />
        <KPI label="Esta semana"           value={fmt(salesStats.profitWeek)}   sub={`Ingresos: ${fmt(salesStats.revenueWeek)}`}  color="var(--blue)"   icon={DollarSign} />
        <KPI label="Este mes"              value={fmt(salesStats.profitMonth)}  sub={`Ingresos: ${fmt(salesStats.revenueMonth)}`} color="var(--accent)" icon={BarChart2}  />
        <KPI label="Ventas registradas"    value={salesStats.totalSales}        sub={`Ganancia total: ${fmt(salesStats.profitTotal)}`} color="var(--purple)" icon={Activity}  />
      </div>

      {/* ── KPIs INVENTARIO ── */}
      <div className="section-label">Inventario (proyección sobre stock)</div>
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPI label="Inversión total"    value={fmt(invStats.inversionTotal)}  sub="Costo de compra en stock"   color="var(--red)"    icon={TrendingDown} />
        <KPI label="Ingresos esperados" value={fmt(invStats.ingresosTotal)}   sub="Si vendieras todo el stock" color="var(--blue)"   icon={Wallet}       />
        <KPI label="Ganancia potencial" value={fmt(invStats.gananciasTotal)}  sub={`Margen: ${margin}%`}        color={invStats.gananciasTotal >= 0 ? 'var(--green)' : 'var(--red)'} icon={invStats.gananciasTotal >= 0 ? TrendingUp : TrendingDown} />
        <KPI label="Alertas de stock"   value={invStats.low.length + invStats.out.length} sub={`${invStats.out.length} agotados · ${invStats.low.length} bajos`} color="var(--yellow)" icon={AlertTriangle} />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="chart-grid" style={{ marginBottom: 22 }}>

        {/* Gráfica de barras — ganancias diarias reales */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Ganancias diarias</div>
              <div className="chart-subtitle">Últimos 14 días · datos reales de ventas</div>
            </div>
            <div className="chart-legend">
              <span className="chart-legend-item">
                <span className="legend-dot" style={{ background: 'var(--green)' }} /> Hoy
              </span>
              <span className="chart-legend-item" style={{ color: 'var(--text3)' }}>
                <span className="legend-dot" style={{ background: 'var(--accent)', opacity: .6 }} /> Días anteriores
              </span>
            </div>
          </div>

          {salesStats.totalSales === 0 ? (
            <div className="chart-empty">
              <BarChart2 size={28} style={{ opacity: .3 }} />
              <div>Registra tu primera venta para ver la gráfica</div>
              <button className="btn btn-primary btn-sm" onClick={() => setPage('sales')}>
                <ShoppingCart size={13} /> Ir a Ventas
              </button>
            </div>
          ) : (
            <div className="chart-container">
              <SalesBarChart data={salesStats.dailyChart} mode="profit" />
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Más vendidos</div>
              <div className="chart-subtitle">Por ingresos acumulados</div>
            </div>
            {donutSlices.length > 0 && <DonutChart slices={donutSlices} size={64} />}
          </div>

          {salesStats.topProducts.length === 0 ? (
            <div className="chart-empty">
              <Package size={28} style={{ opacity: .3 }} />
              <div>Sin ventas registradas aún</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {salesStats.topProducts.map((p, i) => {
                const maxRev = salesStats.topProducts[0]?.revenue || 1;
                return (
                  <div key={p.productId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          background: i === 0 ? 'var(--accent)' : 'var(--surface3)',
                          color: i === 0 ? '#fff' : 'var(--text3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800,
                        }}>{i + 1}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.qty} uds · {p.categoryName}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{fmt(p.revenue)}</div>
                        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>+{fmt(p.profit)}</div>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: p.categoryColor || 'var(--accent)',
                        width: `${(p.revenue / maxRev) * 100}%`,
                        transition: 'width .5s cubic-bezier(.4,0,.2,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="bottom-grid">

        {/* Ventas recientes */}
        <div className="card activity-card">
          <div className="activity-header">
            <span className="activity-title">Ventas recientes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('sales')}>
              Ver todo <ArrowRight size={12} />
            </button>
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
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Ingresos</th>
                    <th>Ganancia</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: `${s.categoryColor || 'var(--accent)'}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
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

          {/* Stock alerts */}
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
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'agotado' ? 'var(--red)' : 'var(--yellow)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s === 'agotado' ? 'var(--red)' : 'var(--yellow)' }}>
                        {p.quantity} {p.unit}
                      </span>
                    </div>
                  );
                })}
                {(invStats.low.length + invStats.out.length) > 5 && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setPage('alerts')}>
                    Ver todas <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ventas por categoría */}
          {salesStats.topCategories.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Ventas por categoría</div>
              {salesStats.topCategories.map(c => {
                const maxRev = salesStats.topCategories[0]?.revenue || 1;
                return (
                  <div key={c.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>+{fmt(c.profit)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: c.color, width: `${(c.revenue / maxRev) * 100}%`, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => setPage('sales')}>
          <ShoppingCart size={15} /> Registrar venta <ArrowRight size={14} />
        </button>
        <button className="btn btn-ghost" onClick={() => setPage('products')}>
          <Package size={15} /> Ver productos
        </button>
        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={15} /> Exportar CSV
        </button>
      </div>

    </div>
  );
}
