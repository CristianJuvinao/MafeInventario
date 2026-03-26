import {
  Package,
  Wallet,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  ArrowRight,
} from "lucide-react";

import { fmt } from "../utils/helpers.js";
import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../context/AuthContext";

import { StatCard } from "../components/molecules/StatCard";
import { CategoryBars } from "../components/molecules/CategoryBars";

import "../styles/dashboard.css";

/* ───────────────── Mini Bar Chart ───────────────── */
function BarChart({ data, colors }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 280;
  const H = 120;
  const barW = 18;
  const step = (W - barW) / Math.max(data.length - 1, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="mini-chart">
      {data.map((d, i) => {
        const bh = Math.max(4, (d.value / max) * H);
        const x = i * step;
        const y = H - bh;
        const fill = colors?.[i] || "var(--accent)";

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              rx={4}
              fill={fill}
              opacity={d.dim ? 0.35 : 1}
            />
            <text
              x={x + barW / 2}
              y={H + 14}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text3)"
              fontFamily="var(--font-body)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────── Recent Activity ───────────────── */
function RecentActivity({ products, categories, getStatus }) {
  const recent = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);

  const statusLabel = {
    ok: "Disponible",
    bajo: "Stock bajo",
    agotado: "Agotado",
  };

  const statusClass = {
    ok: "badge-green",
    bajo: "badge-yellow",
    agotado: "badge-red",
  };

  return (
    <div className="card activity-card">
      <div className="activity-header">
        <span className="activity-title">Actividad Reciente</span>

        <div className="activity-actions">
          <input className="activity-search" placeholder="Buscar…" />
          <button className="btn btn-ghost btn-sm">Filtrar</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {recent.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              const status = getStatus(p);

              return (
                <tr key={p.id}>
                  <td>
                    <label className="checkbox">
                      <input type="checkbox" />
                      <span className="checkbox-box" />
                    </label>
                  </td>

                  <td>
                    <div className="product-cell">
                      <div
                        className="product-icon"
                        style={{
                          background: cat
                            ? `${cat.color}18`
                            : "var(--surface2)",
                        }}
                      >
                        <Package size={14} color={cat?.color} />
                      </div>
                      <span className="td-name">{p.name}</span>
                    </div>
                  </td>

                  <td>
                    {cat && (
                      <span className="td-cat">
                        <span
                          className="cat-dot"
                          style={{ background: cat.color }}
                        />
                        {cat.name}
                      </span>
                    )}
                  </td>

                  <td className="td-price">{fmt(p.price)}</td>

                  <td>
                    <span className={`badge ${statusClass[status]}`}>
                      <span className="badge-dot" />
                      {statusLabel[status]}
                    </span>
                  </td>

                  <td className="td-qty">
                    {p.quantity} <span>{p.unit}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */
export default function DashboardPage({ setPage }) {
  const { user } = useAuth();
  const {
    products,
    categories,
    stats,
    catStats,
    maxValue,
    exportCSV,
    getStatus,
  } = useDashboard();

  const firstName = user?.displayName?.split(" ")[0] || "Usuario";

  const margin =
    stats.inversionTotal > 0
      ? ((stats.gananciasTotal / stats.inversionTotal) * 100).toFixed(1)
      : "0.0";

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

  const chartData = months.map((label, i) => ({
    label,
    value: Math.round(
      stats.ingresosTotal * (0.4 + Math.sin(i * 0.8) * 0.3 + i * 0.04),
    ),
    dim: i < months.length - 2,
  }));

  const chartColors = months.map((_, i) =>
    i >= months.length - 2 ? "var(--accent)" : "var(--surface3)",
  );

  return (
    <div className="page">
      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Buenos días, {firstName}</h1>
        <p className="dashboard-subtitle">
          Mantente al tanto de tu inventario, movimientos y alertas de stock.
        </p>
      </div>

      {/* ── STATS ── */}
      <div className="stats-grid">
        <StatCard
          accent
          label="Inversión Total"
          value={fmt(stats.inversionTotal)}
          icon={<TrendingDown size={20} />}
          iconStyle={{
            background: "var(--orange-dim)",
            color: "var(--orange)",
          }}
          trend={`${margin}% margen`}
          trendUp={margin > 0}
          sub="Costo de compra en stock"
        />

        <StatCard
          label="Ingresos Esperados"
          value={fmt(stats.ingresosTotal)}
          icon={<Wallet size={19} />}
          iconStyle={{
            background: "var(--blue-dim)",
            color: "var(--blue)",
          }}
          trend="Este período"
          trendUp
          sub="Valor total en stock"
        />

        <StatCard
          label="Ganancia Potencial"
          value={fmt(stats.gananciasTotal)}
          icon={
            stats.gananciasTotal >= 0 ? (
              <TrendingUp size={19} />
            ) : (
              <TrendingDown size={19} />
            )
          }
          iconStyle={{
            background:
              stats.gananciasTotal >= 0 ? "var(--green-dim)" : "var(--red-dim)",
              color: stats.gananciasTotal >= 0 ? "var(--green)" : "var(--red)",
            }}
          trend={`${margin}%`}
          trendUp={stats.gananciasTotal >= 0}
          sub="Margen sobre inversión"
        />

        <StatCard
          label="Alertas de Stock"
          value={stats.low.length + stats.out.length}
          icon={<AlertTriangle size={19} />}
          iconStyle={{
            background: "var(--yellow-dim)",
            color: "var(--yellow)",
          }}
          sub={`${stats.out.length} agotados · ${stats.low.length} bajos`}
        />
      </div>

          {/* ── MIDDLE ── */}
          <div className="middle-grid">
            <CategoryBars catStats={catStats} maxValue={maxValue} />
    
            <div className="card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Ingresos Totales</div>
                  <div className="chart-subtitle">Tendencia del período</div>
                </div>
    
                <div className="chart-legend">
                  <span className="chart-legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: "var(--accent)" }}
                    />
                    Ingresos
                  </span>
                  <span
                    className="chart-legend-item"
                    style={{ color: "var(--text3)" }}
                  >
                    <span
                      className="legend-dot"
                      style={{ background: "var(--surface3)" }}
                    />
                    Pasado
                  </span>
                </div>
              </div>
    
              <div className="chart-container">
                <BarChart data={chartData} colors={chartColors} />
              </div>
            </div>
          </div>

      {/* ── ACTIVITY ── */}
      <RecentActivity
        products={products}
        categories={categories}
        getStatus={getStatus}
      />

      {/* ── ACTIONS ── */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={() => setPage("products")}>
          <Package size={15} />
          Ver Productos
          <ArrowRight size={14} />
        </button>

        <button className="btn btn-ghost" onClick={exportCSV}>
          <Download size={15} />
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
