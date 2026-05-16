// src/pages/ReportsPage.jsx
import { useApp }            from '../context/AppContext';
import { useSalesStats }     from '../hooks/useSalesStats';
import { useInventoryStats } from '../hooks/useInventoryStats';
import { fmt }               from '../utils/helpers.js';
import { DonutChart, HorizontalBarChart, ChartLegend } from '../components/atoms/ChartComponents';
import {
  TrendingUp, TrendingDown, Package,
  BarChart2, PieChart, Download,
  Wallet, Boxes, ShoppingCart,
} from 'lucide-react';



export default function ReportsPage() {
  const { products, categories, movements, sales, exportCSV } = useApp();
  const salesStats = useSalesStats(sales);
  const inv        = useInventoryStats(products, categories);

  const agotados = inv.out.length;
  const bajos    = inv.low.length;
  const ok       = inv.okCount;

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Reportes</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Inventario + ventas reales · {products.length} productos · {sales.length} ventas
          </p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV}><Download size={15} /> Exportar CSV</button>
      </div>

      {/* ── VENTAS REALES ── */}
      <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: 'var(--accent)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
        Rendimiento real (ventas registradas)
      </div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Ganancias hoy',         value: fmt(salesStats.profitToday),  icon: <TrendingUp size={18} />,   style: { background: 'var(--green-dim)', color: 'var(--green)' },  vStyle: { color: 'var(--green)' } },
          { label: 'Ganancias esta semana',  value: fmt(salesStats.profitWeek),   icon: <ShoppingCart size={18} />, style: { background: 'var(--blue-dim)',  color: 'var(--blue)' },   vStyle: { color: 'var(--blue)' } },
          { label: 'Ganancias este mes',     value: fmt(salesStats.profitMonth),  icon: <BarChart2 size={18} />,    style: { background: 'var(--accent-soft)', color: 'var(--accent)' }, vStyle: { color: 'var(--accent)' } },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...s.style }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', ...s.vStyle }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── INVENTARIO (proyecciones) ── */}
      <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: 'var(--text3)', letterSpacing: '.5px', textTransform: 'uppercase' }}>
        Inventario actual (proyecciones sobre stock)
      </div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Inversión total',    value: fmt(inv.inversionTotal),  icon: <TrendingDown size={19} />, iconStyle: { background: 'var(--red-dim)',   color: 'var(--red)'   }, vStyle: { color: 'var(--red)' },   sub: 'Costo en stock' },
          { label: 'Ingresos esperados', value: fmt(inv.ingresosTotal),   icon: <Wallet size={19} />,       iconStyle: { background: 'var(--blue-dim)',  color: 'var(--blue)'  }, vStyle: { color: 'var(--blue)' },  sub: 'Valor de venta total' },
          { label: 'Ganancia potencial', value: fmt(inv.gananciasTotal),  icon: <TrendingUp size={19} />,   iconStyle: { background: 'var(--green-dim)', color: 'var(--green)' }, vStyle: { color: 'var(--green)' }, sub: `Margen: ${inv.margen}%` },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...s.iconStyle }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, ...s.vStyle }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Stock status — donut */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
            <Boxes size={16} style={{ color: 'var(--accent)' }} /> Estado del Stock
          </div>
          <DonutChart
            slices={[
              { name: 'En buen estado', value: ok,       color: '#22c55e' },
              { name: 'Stock bajo',     value: bajos,    color: '#fbbf24' },
              { name: 'Agotados',       value: agotados, color: '#f87171' },
            ].filter(s => s.value > 0)}
            height={160}
          />
          <ChartLegend
            items={[
              { label: `En orden (${ok})`,        color: '#22c55e' },
              { label: `Stock bajo (${bajos})`,   color: '#fbbf24' },
              { label: `Agotados (${agotados})`,  color: '#f87171' },
            ]}
            style={{ marginTop: 14, justifyContent: 'center' }}
          />
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text2)' }}>Movimientos registrados</span>
            <span style={{ fontWeight: 700 }}>{movements.length}</span>
          </div>
        </div>

        {/* Category breakdown — horizontal bars */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
            <PieChart size={16} style={{ color: 'var(--accent)' }} /> Por Categoría (inventario)
          </div>
          {inv.catBreakdown.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 24 }}>Sin categorías</div>
          ) : (
            <>
              <HorizontalBarChart
                items={inv.catBreakdown.map(c => ({
                  name: c.name,
                  value: c.ingresos,
                  profit: c.ganancia,
                  color: c.color,
                }))}
              />
              <ChartLegend
                items={inv.catBreakdown.map(c => ({ label: `${c.name} (${c.count})`, color: c.color }))}
                style={{ marginTop: 12 }}
              />
            </>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
          <BarChart2 size={16} style={{ color: 'var(--accent)' }} /> Top productos por valor en stock
        </div>
        {inv.topProducts.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 24 }}>Sin productos aún</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Producto</th><th>Cantidad</th>
                  <th>P. Venta</th><th>Valor total</th><th>Ganancia pot.</th>
                </tr>
              </thead>
              <tbody>
                {inv.topProducts.map((p, i) => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text3)', width: 32 }}>{i + 1}</td>
                      <td>
                        <div className="td-name">{p.name}</div>
                        {cat && <div className="td-cat" style={{ marginTop: 2 }}><span className="cat-dot" style={{ background: cat.color }} />{cat.name}</div>}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.quantity} <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>{p.unit}</span></td>
                      <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{fmt(p.totalValue)}</td>
                      <td style={{ fontWeight: 700, color: p.ganancia >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(p.ganancia)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
