// src/pages/CajaPage.jsx
// Corte de caja: resumen diario por método de pago.
import { useState, useMemo } from 'react';
import { useApp }    from '../context/AppContext';
import { fmt }       from '../utils/helpers.js';
import { PAYMENT_METHODS } from '../hooks/useSales';
import { DonutChart, ChartLegend } from '../components/atoms/ChartComponents';
import {
  Wallet, TrendingUp, DollarSign,
  CreditCard, Smartphone, Package,
  Calendar, CheckCircle, ChevronDown, ChevronUp,
  Download,
} from 'lucide-react';

const PM_ICONS = {
  efectivo:      Wallet,
  transferencia: Smartphone,
  tarjeta:       CreditCard,
  otro:          Package,
};

const PM_COLORS = {
  efectivo:      '#22c55e',
  transferencia: '#3b82f6',
  tarjeta:       '#7c6fff',
  otro:          '#fbbf24',
};

const fmtDay = iso => new Date(iso).toLocaleDateString('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long',
});

const fmtTime = iso => new Date(iso).toLocaleTimeString('es-CO', {
  hour: '2-digit', minute: '2-digit',
});

function PaymentCard({ pmKey, data, total }) {
  const method = PAYMENT_METHODS.find(p => p.key === pmKey) || { label: pmKey, icon: '📦' };
  const Icon   = PM_ICONS[pmKey] || Package;
  const color  = PM_COLORS[pmKey] || '#888';
  const pct    = total > 0 ? ((data.revenue / total) * 100).toFixed(1) : 0;

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{method.icon} {method.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{data.count} venta{data.count !== 1 ? 's' : ''} · {pct}% del total</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Ingresos</div>
          <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{fmt(data.revenue)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Ganancia</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{fmt(data.profit)}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, height: 4, background: 'var(--surface2)', borderRadius: 99 }}>
        <div style={{
          height: '100%', borderRadius: 99, background: color,
          width: `${pct}%`, transition: 'width .5s',
        }} />
      </div>
    </div>
  );
}

function DayGroup({ dateStr, sales, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const total    = sales.reduce((s, v) => s + v.revenue, 0);
  const profit   = sales.reduce((s, v) => s + v.profit, 0);
  const byMethod = {};
  for (const s of sales) {
    const pm = s.paymentMethod || 'efectivo';
    if (!byMethod[pm]) byMethod[pm] = 0;
    byMethod[pm] += s.revenue;
  }

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 10 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtDay(dateStr + 'T12:00:00')}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 14 }}>
            <span>{sales.length} venta{sales.length !== 1 ? 's' : ''}</span>
            {Object.entries(byMethod).map(([pm, rev]) => {
              const m = PAYMENT_METHODS.find(p => p.key === pm);
              return <span key={pm}>{m?.icon || '📦'} {fmt(rev)}</span>;
            })}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(total)}</div>
          <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>+{fmt(profit)}</div>
        </div>
        <div style={{ color: 'var(--text3)' }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Producto</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Ingresos</th>
                  <th style={{ textAlign: 'right' }}>Ganancia</th>
                  <th>Pago</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => {
                  const pm = PAYMENT_METHODS.find(p => p.key === (s.paymentMethod || 'efectivo'));
                  return (
                    <tr key={s.id}>
                      <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtTime(s.date)}</td>
                      <td style={{ fontWeight: 600 }}>{s.productName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.qty} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.unit}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--blue)' }}>{fmt(s.revenue)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>{fmt(s.profit)}</td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{pm?.icon} {pm?.label || 'Efectivo'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CajaPage() {
  const { sales } = useApp();

  const [rangeDays, setRangeDays] = useState(1); // 1 = hoy, 7 = semana, 30 = mes

  const todayStr = new Date().toISOString().slice(0, 10);

  const rangeStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (rangeDays - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [rangeDays]);

  const filteredSales = useMemo(() =>
    sales.filter(s => new Date(s.date) >= rangeStart),
    [sales, rangeStart]
  );

  // Totales por método
  const byPayment = useMemo(() => {
    const map = {};
    for (const s of filteredSales) {
      const pm = s.paymentMethod || 'efectivo';
      if (!map[pm]) map[pm] = { revenue: 0, profit: 0, count: 0 };
      map[pm].revenue += s.revenue;
      map[pm].profit  += s.profit;
      map[pm].count   += s.qty || 1;
    }
    return map;
  }, [filteredSales]);

  const totalRevenue = filteredSales.reduce((s, v) => s + v.revenue, 0);
  const totalProfit  = filteredSales.reduce((s, v) => s + v.profit, 0);

  // Agrupar por día
  const byDay = useMemo(() => {
    const map = {};
    for (const s of filteredSales) {
      const day = s.date.slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredSales]);

  const donutSlices = PAYMENT_METHODS
    .filter(pm => byPayment[pm.key]?.revenue > 0)
    .map(pm => ({ name: pm.label, value: byPayment[pm.key].revenue, color: PM_COLORS[pm.key] }));

  // Export corte de caja
  const exportCorte = () => {
    const rangeLabel = rangeDays === 1 ? 'Hoy' : rangeDays === 7 ? 'Últimos 7 días' : 'Últimos 30 días';
    let csv = `Corte de Caja — ${rangeLabel}\n`;
    csv += `Total ingresos,${totalRevenue}\nTotal ganancia,${totalProfit}\n\n`;
    csv += `Método,Ingresos,Ganancia,Ventas\n`;
    for (const [pm, d] of Object.entries(byPayment)) {
      const label = PAYMENT_METHODS.find(p => p.key === pm)?.label || pm;
      csv += `${label},${d.revenue},${d.profit},${d.count}\n`;
    }
    csv += `\nFecha,Producto,Cantidad,Ingresos,Ganancia,Método,Nota\n`;
    for (const s of filteredSales) {
      const pm = PAYMENT_METHODS.find(p => p.key === (s.paymentMethod || 'efectivo'))?.label || 'Efectivo';
      csv += `"${new Date(s.date).toLocaleString('es-CO')}","${s.productName}",${s.qty},${s.revenue},${s.profit},"${pm}","${s.note || ''}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `corte-caja-${todayStr}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Corte de Caja</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Resumen de ingresos por método de pago
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { days: 1,  label: 'Hoy' },
            { days: 7,  label: '7 días' },
            { days: 30, label: '30 días' },
          ].map(r => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className="btn btn-sm"
              style={{
                background: rangeDays === r.days ? 'var(--accent)' : 'var(--surface)',
                color:      rangeDays === r.days ? '#fff'          : 'var(--text2)',
                border: 'none',
                boxShadow: rangeDays === r.days ? '0 2px 10px var(--accent-glow)' : 'var(--shadow)',
                fontWeight: 600,
              }}
            >
              {r.label}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={exportCorte}>
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* Total KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card kpi-card kpi-accent" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Total ingresos</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: 'var(--blue)' }}>{fmt(totalRevenue)}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="var(--blue)" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{filteredSales.length} ventas registradas</div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Ganancia neta</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: 'var(--green)' }}>{fmt(totalProfit)}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--green)" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Margen: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {PAYMENT_METHODS.filter(pm => byPayment[pm.key]).map(pm => (
          <div key={pm.key} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                  {pm.icon} {pm.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: PM_COLORS[pm.key] }}>
                  {fmt(byPayment[pm.key].revenue)}
                </div>
              </div>
              <CheckCircle size={16} color={PM_COLORS[pm.key]} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              {byPayment[pm.key].count} ventas
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {filteredSales.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, marginBottom: 24, alignItems: 'start' }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Distribución</div>
            <DonutChart slices={donutSlices} height={160} />
            <ChartLegend
              items={donutSlices.map(s => ({
                label: s.name,
                color: s.color,
                value: s.value,
              }))}
              style={{ marginTop: 14 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {PAYMENT_METHODS.filter(pm => byPayment[pm.key]).map(pm => (
              <PaymentCard
                key={pm.key}
                pmKey={pm.key}
                data={byPayment[pm.key]}
                total={totalRevenue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Day-by-day breakdown */}
      {byDay.length === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <Calendar size={36} style={{ opacity: .25, display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text2)', marginBottom: 6 }}>Sin ventas en este período</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Registra ventas para ver el corte de caja
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text2)', marginBottom: 10, letterSpacing: '.3px', textTransform: 'uppercase' }}>
            Detalle por día
          </div>
          {byDay.map(([day, daySales], i) => (
            <DayGroup
              key={day}
              dateStr={day}
              sales={daySales}
              defaultOpen={i === 0}
            />
          ))}
        </>
      )}
    </div>
  );
}
