// src/pages/ReportsPage.jsx
import { useMemo } from 'react';
import { useApp }  from '../context/AppContext';
import { fmt }     from '../utils/helpers.js';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import {
  TrendingUp, TrendingDown, Package,
  BarChart2, PieChart, Download,
  Wallet, AlertTriangle, Boxes,
} from 'lucide-react';

/* ─── Mini bar ───────────────────────────────── */
function Bar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{
      height: 6, borderRadius: 4,
      background: 'var(--surface2)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: color || 'var(--accent)',
        borderRadius: 4,
        transition: 'width .5s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  );
}

/* ─── Stat row ───────────────────────────────── */
function StatRow({ label, value, sub, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────── */
export default function ReportsPage() {
  const { products, categories, movements, getStatus, exportCSV } = useApp();

  const stats = useMemo(() => {
    let inversionTotal = 0, ingresosTotal = 0;
    let agotados = 0, bajos = 0, ok = 0;
    const perCat = {};

    for (const p of products) {
      const purchase = p.purchasePrice || 0;
      const inv = purchase * p.quantity;
      const ing = p.price  * p.quantity;
      inversionTotal += inv;
      ingresosTotal  += ing;

      const s = getStatus(p);
      if (s === 'agotado') agotados++;
      else if (s === 'bajo') bajos++;
      else ok++;

      if (!perCat[p.categoryId]) perCat[p.categoryId] = { inv: 0, ing: 0, count: 0 };
      perCat[p.categoryId].inv   += inv;
      perCat[p.categoryId].ing   += ing;
      perCat[p.categoryId].count += 1;
    }

    const gananciasTotal = ingresosTotal - inversionTotal;
    const margen = inversionTotal > 0
      ? ((gananciasTotal / inversionTotal) * 100).toFixed(1)
      : '0.0';

    // Top products by value
    const topProducts = [...products]
      .map(p => ({
        ...p,
        totalValue: p.price * p.quantity,
        ganancia: (p.price - (p.purchasePrice || 0)) * p.quantity,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 6);

    const maxValue = topProducts[0]?.totalValue || 1;

    // Category breakdown
    const catBreakdown = categories.map(c => ({
      ...c,
      ...(perCat[c.id] || { inv: 0, ing: 0, count: 0 }),
      ganancia: (perCat[c.id]?.ing || 0) - (perCat[c.id]?.inv || 0),
    })).sort((a, b) => b.ing - a.ing);

    const maxIng = catBreakdown[0]?.ing || 1;

    return {
      inversionTotal, ingresosTotal, gananciasTotal, margen,
      agotados, bajos, ok,
      topProducts, maxValue,
      catBreakdown, maxIng,
      movCount: movements.length,
    };
  }, [products, categories, movements, getStatus]);

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Reportes</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Análisis financiero y de inventario · {products.length} productos
          </p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* ── Resumen financiero ── */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Inversión total',
            value: fmt(stats.inversionTotal),
            icon: <TrendingDown size={19} />,
            iconStyle: { background: 'var(--red-dim)', color: 'var(--red)' },
            valueStyle: { color: 'var(--red)' },
            sub: 'Costo de compra en stock',
          },
          {
            label: 'Ingresos esperados',
            value: fmt(stats.ingresosTotal),
            icon: <Wallet size={19} />,
            iconStyle: { background: 'var(--blue-dim)', color: 'var(--blue)' },
            valueStyle: { color: 'var(--blue)' },
            sub: 'Valor de venta total en stock',
          },
          {
            label: 'Ganancia potencial',
            value: fmt(stats.gananciasTotal),
            icon: <TrendingUp size={19} />,
            iconStyle: { background: 'var(--green-dim)', color: 'var(--green)' },
            valueStyle: { color: stats.gananciasTotal >= 0 ? 'var(--green)' : 'var(--red)' },
            sub: `Margen: ${stats.margen}%`,
          },
        ].map((s, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, ...s.iconStyle,
              }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4, ...s.valueStyle }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two column section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Stock status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
            <Boxes size={16} style={{ color: 'var(--accent)' }} />
            Estado del Stock
          </div>
          <div>
            {[
              { label: 'En buen estado', count: stats.ok,       color: 'var(--green)', pct: products.length },
              { label: 'Stock bajo',     count: stats.bajos,    color: 'var(--yellow)', pct: products.length },
              { label: 'Agotados',       count: stats.agotados, color: 'var(--red)',    pct: products.length },
            ].map((row, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>
                    {row.count} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({products.length > 0 ? ((row.count / products.length) * 100).toFixed(0) : 0}%)</span>
                  </span>
                </div>
                <Bar value={row.count} max={row.pct} color={row.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text2)' }}>Movimientos registrados</span>
            <span style={{ fontWeight: 700 }}>{stats.movCount}</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
            <PieChart size={16} style={{ color: 'var(--accent)' }} />
            Por Categoría
          </div>
          {stats.catBreakdown.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 24 }}>
              Sin categorías aún
            </div>
          ) : (
            stats.catBreakdown.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.icon] || CATEGORY_ICONS.default;
              return (
                <div key={c.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: 6,
                        background: `${c.color}20`, color: c.color,
                      }}>
                        <Icon size={13} />
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{c.count} prod.</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.ganancia >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {fmt(c.ing)}
                    </span>
                  </div>
                  <Bar value={c.ing} max={stats.maxIng} color={c.color} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Top products ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
          <BarChart2 size={16} style={{ color: 'var(--accent)' }} />
          Top productos por valor en stock
        </div>
        {stats.topProducts.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 24 }}>
            Sin productos aún
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>P. Venta</th>
                  <th>Valor total</th>
                  <th>Ganancia pot.</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text3)', width: 32 }}>
                        {i + 1}
                      </td>
                      <td>
                        <div>
                          <div className="td-name">{p.name}</div>
                          {cat && (
                            <div className="td-cat" style={{ marginTop: 2 }}>
                              <span className="cat-dot" style={{ background: cat.color }} />
                              {cat.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {p.quantity} <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>{p.unit}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {fmt(p.price)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>
                        {fmt(p.totalValue)}
                      </td>
                      <td style={{ fontWeight: 700, color: p.ganancia >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fmt(p.ganancia)}
                      </td>
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
