// src/pages/SalesPage.jsx
import { useState } from "react";
import { useSales } from "../hooks/useSales";
import { useSalesStats } from "../hooks/useSalesStats";
import { fmt } from "../utils/helpers.js";
import { ConfirmDialog } from "../components/molecules/ConfirmDialog";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
  DollarSign,
  Package,
  BarChart2,
  CheckCircle,
  History,
  X,
  ArrowRight,
} from "lucide-react";

/* ── Mini bar chart ──────────────────────────────────────── */
function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.profit), 1);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}
    >
      {data.map((d, i) => {
        const h = Math.max(4, (d.profit / max) * 60);
        const isToday = i === data.length - 1;
        return (
          <div
            key={d.date}
            title={`${d.label}: ${fmt(d.profit)}`}
            style={{
              flex: 1,
              height: h,
              background: isToday ? "var(--accent)" : "var(--surface3)",
              borderRadius: "4px 4px 0 0",
              transition: "height .4s",
              cursor: "default",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Stat pill ───────────────────────────────────────────── */
function StatPill({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text2)",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-1px",
              color: color || "var(--text)",
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
              {sub}
            </div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `${color || "var(--accent)"}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={18} color={color || "var(--accent)"} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Format date ─────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ════════════════════════════════════════════════════════════
   SalesPage
════════════════════════════════════════════════════════════ */
export default function SalesPage() {
  const {
    availableProducts,
    products,
    categories,
    search,
    setSearch,
    cart,
    note,
    setNote,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartTotals,
    saving,
    submitSale,
    sales,
    filteredSales,
    histSearch,
    setHistSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    confirmSale,
    setConfirmSale,
    handleDeleteSale,
  } = useSales();

  const stats = useSalesStats(sales);

  const [tab, setTab] = useState("nueva"); // 'nueva' | 'historial'

  /* Enrich cart items with product info */
  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product);

  return (
    <div className="page">
      {confirmSale && (
        <ConfirmDialog
          msg={`¿Eliminar la venta de "${confirmSale.productName}" ×${confirmSale.qty}? El stock será restaurado.`}
          onConfirm={handleDeleteSale}
          onCancel={() => setConfirmSale(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
          Ventas
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
          Registro real de ventas · {stats.totalSales} ventas totales
        </p>
      </div>

      {/* ── KPI strip ── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatPill
          label="Ganancia hoy"
          value={fmt(stats.profitToday)}
          sub={`${stats.unitsToday} unidades vendidas`}
          color="var(--green)"
          icon={TrendingUp}
        />
        <StatPill
          label="Ganancia esta semana"
          value={fmt(stats.profitWeek)}
          sub={`Ingresos: ${fmt(stats.revenueWeek)}`}
          color="var(--blue)"
          icon={DollarSign}
        />
        <StatPill
          label="Ganancia este mes"
          value={fmt(stats.profitMonth)}
          sub={`${stats.unitsMonth} unidades vendidas`}
          color="var(--accent)"
          icon={BarChart2}
        />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { key: "nueva", label: "Nueva venta", icon: ShoppingCart },
          { key: "historial", label: "Historial", icon: History },
          { key: "stats", label: "Estadísticas", icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              background: tab === key ? "var(--accent)" : "var(--surface)",
              color: tab === key ? "#fff" : "var(--text2)",
              boxShadow:
                tab === key ? "0 2px 10px var(--accent-glow)" : "var(--shadow)",
              transition: "all .14s",
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: NUEVA VENTA ══════════ */}
      {tab === "nueva" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* LEFT — product picker */}
          <div>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text3)",
                }}
              />
              <input
                type="text"
                placeholder="Buscar producto para agregar al carrito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: "100%" }}
              />
            </div>

            {/* Product grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {availableProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const inCart = cart.find((i) => i.productId === p.id);
                return (
                  <div
                    key={p.id}
                    className="card card-hover"
                    onClick={() => addToCart(p.id)}
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                      border: inCart
                        ? "1.5px solid var(--accent)"
                        : "1px solid var(--border)",
                      position: "relative",
                    }}
                  >
                    {inCart && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircle size={11} color="#fff" />
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: cat
                            ? `${cat.color}18`
                            : "var(--surface2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package
                          size={15}
                          color={cat?.color || "var(--text3)"}
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </div>
                        {cat && (
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>
                            {cat.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: "var(--text)",
                        }}
                      >
                        {fmt(p.price)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>
                        Stock: {p.quantity} {p.unit}
                      </span>
                    </div>
                  </div>
                );
              })}

              {availableProducts.length === 0 && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "var(--text3)",
                  }}
                >
                  {search
                    ? "No se encontraron productos"
                    : "No hay productos disponibles"}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — cart */}
          <div
            className="card"
            style={{ padding: "20px", position: "sticky", top: 80 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ShoppingCart size={16} color="var(--accent)" />
                Carrito
                {cart.length > 0 && (
                  <span
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearCart}
                  style={{ gap: 4 }}
                >
                  <X size={12} /> Limpiar
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "var(--text3)",
                  fontSize: 13,
                }}
              >
                Selecciona productos de la izquierda
              </div>
            ) : (
              <>
                {/* Cart items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {cartItems.map(({ productId, qty, product: p }) => (
                    <div
                      key={productId}
                      style={{
                        background: "var(--surface2)",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            flex: 1,
                            paddingRight: 8,
                          }}
                        >
                          {p.name}
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text3)",
                            padding: 2,
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Qty control */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => setQty(productId, qty - 1)}
                            disabled={qty <= 1}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid var(--border2)",
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: qty <= 1 ? "not-allowed" : "pointer",
                              opacity: qty <= 1 ? 0.4 : 1,
                            }}
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(productId, e.target.value)}
                            style={{
                              width: 44,
                              textAlign: "center",
                              padding: "2px 4px",
                              fontSize: 13,
                              fontWeight: 700,
                              border: "1px solid var(--border2)",
                              borderRadius: 6,
                              background: "var(--surface)",
                              color: "var(--text)",
                            }}
                          />
                          <button
                            onClick={() => setQty(productId, qty + 1)}
                            disabled={qty >= p.quantity}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid var(--border2)",
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor:
                                qty >= p.quantity ? "not-allowed" : "pointer",
                              opacity: qty >= p.quantity ? 0.4 : 1,
                            }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>
                            {fmt(p.price * qty)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--green)" }}>
                            +{fmt((p.price - (p.purchasePrice || 0)) * qty)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <input
                  type="text"
                  placeholder="Nota / cliente (opcional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: "100%", marginBottom: 14 }}
                />

                {/* Totals */}
                <div
                  style={{
                    background: "var(--surface2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "var(--text2)" }}>
                      Total ingresos
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {fmt(cartTotals.revenue)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "var(--text2)" }}>Costo</span>
                    <span style={{ fontWeight: 700, color: "var(--red)" }}>
                      {fmt(cartTotals.cost)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 15,
                      paddingTop: 8,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Ganancia</span>
                    <span style={{ fontWeight: 800, color: "var(--green)" }}>
                      {fmt(cartTotals.profit)}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px",
                  }}
                  onClick={submitSale}
                  disabled={saving || cart.length === 0}
                >
                  {saving ? (
                    "Registrando..."
                  ) : (
                    <>
                      <CheckCircle size={16} /> Confirmar venta{" "}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ TAB: HISTORIAL ══════════ */}
      {tab === "historial" && (
        <div>
          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text3)",
                }}
              />
              <input
                type="text"
                placeholder="Buscar producto, categoría o nota..."
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
                style={{ paddingLeft: 36, width: "100%" }}
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid var(--border2)",
                background: "var(--surface)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
              }}
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid var(--border2)",
                background: "var(--surface)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            {filteredSales.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "56px 24px",
                  color: "var(--text3)",
                }}
              >
                <History size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--text2)",
                  }}
                >
                  Sin ventas registradas
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {sales.length === 0
                    ? 'Registra tu primera venta en la pestaña "Nueva venta"'
                    : "Ninguna venta coincide con los filtros aplicados"}
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Cant.</th>
                      <th>P. Venta</th>
                      <th>P. Compra</th>
                      <th>Ingresos</th>
                      <th>Ganancia</th>
                      <th>Nota</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((s) => (
                      <tr key={s.id}>
                        <td
                          style={{
                            fontSize: 12,
                            color: "var(--text3)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDate(s.date)}
                        </td>
                        <td className="td-name">{s.productName}</td>
                        <td>
                          <span className="td-cat">
                            <span
                              className="cat-dot"
                              style={{ background: s.categoryColor }}
                            />
                            {s.categoryName || "—"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {s.qty}{" "}
                          <span style={{ color: "var(--text3)", fontSize: 11 }}>
                            {s.unit}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{fmt(s.salePrice)}</td>
                        <td style={{ color: "var(--red)", fontWeight: 600 }}>
                          {fmt(s.purchasePrice)}
                        </td>
                        <td style={{ color: "var(--blue)", fontWeight: 700 }}>
                          {fmt(s.revenue)}
                        </td>
                        <td
                          style={{
                            color:
                              s.profit >= 0 ? "var(--green)" : "var(--red)",
                            fontWeight: 700,
                          }}
                        >
                          {fmt(s.profit)}
                        </td>
                        <td style={{ color: "var(--text3)", fontSize: 12 }}>
                          {s.note || "—"}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            title="Eliminar y restaurar stock"
                            onClick={() => setConfirmSale(s)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredSales.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
              {filteredSales.length} venta
              {filteredSales.length !== 1 ? "s" : ""} · Ganancia total:{" "}
              <strong style={{ color: "var(--green)" }}>
                {fmt(filteredSales.reduce((s, v) => s + v.profit, 0))}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: ESTADÍSTICAS ══════════ */}
      {tab === "stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Chart + top products */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Daily chart */}
            <div className="card" style={{ padding: "20px 22px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                Ganancias diarias
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text3)",
                  marginBottom: 16,
                }}
              >
                Últimos 15 días
              </div>
              {stats.totalSales === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "var(--text3)",
                    fontSize: 13,
                  }}
                >
                  Sin datos aún
                </div>
              ) : (
                <>
                  <MiniBarChart data={stats.dailyChart} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 8,
                      fontSize: 11,
                      color: "var(--text3)",
                    }}
                  >
                    <span>{stats.dailyChart[0]?.label}</span>
                    <span>
                      {stats.dailyChart[stats.dailyChart.length - 1]?.label}{" "}
                      (hoy)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Top products */}
            <div className="card" style={{ padding: "20px 22px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>
                Productos más vendidos
              </div>
              {stats.topProducts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "var(--text3)",
                    fontSize: 13,
                  }}
                >
                  Sin datos aún
                </div>
              ) : (
                stats.topProducts.map((p, i) => {
                  const maxRev = stats.topProducts[0]?.revenue || 1;
                  return (
                    <div key={p.productId} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              background:
                                i === 0 ? "var(--accent)" : "var(--surface3)",
                              color: i === 0 ? "#fff" : "var(--text3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {p.name}
                            </div>
                            <div
                              style={{ fontSize: 11, color: "var(--text3)" }}
                            >
                              {p.qty} uds · {p.categoryName}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>
                            {fmt(p.revenue)}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--green)",
                              fontWeight: 600,
                            }}
                          >
                            +{fmt(p.profit)}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "var(--surface2)",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            background: p.categoryColor || "var(--accent)",
                            width: `${(p.revenue / maxRev) * 100}%`,
                            transition: "width .5s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* By category */}
          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>
              Ventas por categoría
            </div>
            {stats.topCategories.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "var(--text3)",
                  fontSize: 13,
                }}
              >
                Sin datos aún
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Unidades</th>
                      <th>Ingresos</th>
                      <th>Ganancia</th>
                      <th>Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCategories.map((c) => {
                      const margin =
                        c.revenue > 0
                          ? ((c.profit / c.revenue) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <tr key={c.categoryId}>
                          <td>
                            <span className="td-cat">
                              <span
                                className="cat-dot"
                                style={{ background: c.color }}
                              />
                              {c.name}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{c.qty}</td>
                          <td style={{ color: "var(--blue)", fontWeight: 700 }}>
                            {fmt(c.revenue)}
                          </td>
                          <td
                            style={{ color: "var(--green)", fontWeight: 700 }}
                          >
                            {fmt(c.profit)}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 99,
                                background: "var(--green-dim)",
                                color: "var(--green)",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {margin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary totals */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                label: "Ingresos totales",
                value: fmt(stats.revenueTotal),
                color: "var(--blue)",
              },
              {
                label: "Ganancia total",
                value: fmt(stats.profitTotal),
                color: "var(--green)",
              },
              {
                label: "Unidades vendidas",
                value: stats.unitsTotal,
                color: "var(--accent)",
              },
              {
                label: "Ventas registradas",
                value: stats.totalSales,
                color: "var(--text)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="card"
                style={{ padding: "16px 20px" }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text2)",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
