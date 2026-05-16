// src/components/atoms/ChartComponents.jsx
// Wrappers de Chart.js reutilizables en toda la app.
// Chart.js se carga via CDN en index.html — window.Chart debe estar disponible.
import { useEffect, useRef } from 'react';

/* ── Paleta CSS → hex (Chart.js no entiende var(--...)) ──────── */
const C = {
  green:  '#22c55e',
  blue:   '#3b82f6',
  accent: '#7c6fff',
  red:    '#f87171',
  yellow: '#fbbf24',
  purple: '#a78bfa',
  teal:   '#2dd4bf',
  orange: '#fb923c',
  text3:  '#9ca3af',
  border: 'rgba(128,128,128,0.15)',
  surface2: 'rgba(128,128,128,0.07)',
};

const PALETTE = [
  C.accent, C.green, C.blue, C.yellow,
  C.purple, C.teal,  C.orange, C.red,
];

/* ── Fuente común para todos los charts ─────────────────────── */
const FONT = { family: 'Inter, system-ui, sans-serif', size: 11 };

/* ── Opciones de grid/ticks compartidas ─────────────────────── */
const scaleDefaults = (label = '') => ({
  grid:  { color: C.border, drawBorder: false },
  ticks: { color: C.text3, font: FONT, padding: 4 },
  ...(label ? { title: { display: false } } : {}),
});

/* ══════════════════════════════════════════════════════════════
   BarChart — ganancias/ingresos diarios
   data: [{ label, profit, revenue, isToday }]
══════════════════════════════════════════════════════════════ */
export function DailyBarChart({ data, height = 200 }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current || !window.Chart) return;
    chart.current?.destroy();

    const profits  = data.map(d => d.profit);
    const revenues = data.map(d => d.revenue);
    const bgColors = data.map(d =>
      d.isToday ? C.green : C.accent + 'cc'
    );
    const revColors = data.map(d =>
      d.isToday ? C.green + '33' : C.accent + '22'
    );

    chart.current = new window.Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            label: 'Ingresos',
            data: revenues,
            backgroundColor: revColors,
            borderColor: 'transparent',
            borderRadius: 4,
            order: 2,
          },
          {
            label: 'Ganancia',
            data: profits,
            backgroundColor: bgColors,
            borderColor: 'transparent',
            borderRadius: 6,
            borderSkipped: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 10,
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.y;
                const label = ctx.dataset.label;
                return ` ${label}: $${v.toLocaleString('es-CO')}`;
              },
            },
          },
        },
        scales: {
          x: { ...scaleDefaults(), grid: { display: false } },
          y: {
            ...scaleDefaults(),
            ticks: {
              ...scaleDefaults().ticks,
              callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v),
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [data]);

  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LineChart — evolución acumulada (dashboard)
   data: [{ label, profit, revenue }]
══════════════════════════════════════════════════════════════ */
export function LineAreaChart({ data, height = 180 }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current || !window.Chart) return;
    chart.current?.destroy();

    // Acumulados
    let cumProfit = 0, cumRevenue = 0;
    const profits  = data.map(d => { cumProfit  += d.profit;  return cumProfit; });
    const revenues = data.map(d => { cumRevenue += d.revenue; return cumRevenue; });

    chart.current = new window.Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            label: 'Ingresos acum.',
            data: revenues,
            borderColor: C.blue,
            backgroundColor: C.blue + '18',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
          {
            label: 'Ganancia acum.',
            data: profits,
            borderColor: C.green,
            backgroundColor: C.green + '22',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 10,
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-CO')}`,
            },
          },
        },
        scales: {
          x: { ...scaleDefaults(), grid: { display: false } },
          y: {
            ...scaleDefaults(),
            ticks: {
              ...scaleDefaults().ticks,
              callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v),
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [data]);

  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DonutChart — distribución por categoría
   slices: [{ name, value, color }]
══════════════════════════════════════════════════════════════ */
export function DonutChart({ slices, height = 200 }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current || !window.Chart || !slices.length) return;
    chart.current?.destroy();

    const total = slices.reduce((s, x) => s + x.value, 0);

    chart.current = new window.Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.name),
        datasets: [{
          data: slices.map(s => s.value),
          backgroundColor: slices.map((s, i) => s.color || PALETTE[i % PALETTE.length]),
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 10,
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: ctx => {
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${pct}% · $${ctx.parsed.toLocaleString('es-CO')}`;
              },
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [slices]);

  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HorizontalBarChart — top productos
   items: [{ name, value, profit, color }]
══════════════════════════════════════════════════════════════ */
export function HorizontalBarChart({ items, height }) {
  const ref = useRef(null);
  const chart = useRef(null);
  const h = height || Math.max(180, items.length * 44 + 40);

  useEffect(() => {
    if (!ref.current || !window.Chart || !items.length) return;
    chart.current?.destroy();

    chart.current = new window.Chart(ref.current, {
      type: 'bar',
      data: {
        labels: items.map(i => i.name),
        datasets: [
          {
            label: 'Ingresos',
            data: items.map(i => i.value),
            backgroundColor: items.map((it, i) => (it.color || PALETTE[i % PALETTE.length]) + 'cc'),
            borderColor: 'transparent',
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Ganancia',
            data: items.map(i => i.profit),
            backgroundColor: items.map(() => C.green + '55'),
            borderColor: 'transparent',
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 10,
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.x.toLocaleString('es-CO')}`,
            },
          },
        },
        scales: {
          x: {
            ...scaleDefaults(),
            ticks: {
              ...scaleDefaults().ticks,
              callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v),
            },
          },
          y: {
            ...scaleDefaults(),
            grid: { display: false },
            ticks: {
              ...scaleDefaults().ticks,
              font: { ...FONT, size: 12 },
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [items]);

  return (
    <div style={{ position: 'relative', height: h }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ChartLegend — leyenda manual reutilizable
   items: [{ label, color, value? }]
══════════════════════════════════════════════════════════════ */
export function ChartLegend({ items, style = {} }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', ...style }}>
      {items.map((item, i) => (
        <span key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--text2)',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: 2, flexShrink: 0,
            background: item.color,
          }} />
          {item.label}
          {item.value != null && (
            <strong style={{ color: 'var(--text)', marginLeft: 2 }}>
              {typeof item.value === 'number'
                ? '$' + item.value.toLocaleString('es-CO')
                : item.value}
            </strong>
          )}
        </span>
      ))}
    </div>
  );
}
