// src/hooks/useDashboard.js
import { useMemo } from 'react';
import { useApp }  from '../context/AppContext';

/* Devuelve 'YYYY-MM-DD' de una fecha ISO */
const toDay = iso => iso.slice(0, 10);

/* Últimos N días en formato 'YYYY-MM-DD' */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

/* Nombre corto del día o mes para el eje X */
const dayLabel = iso => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3);
};

export function useDashboard() {
  const { products, categories, movements, sales, getStatus, exportCSV } = useApp();

  /* ── Inventario ─────────────────────────────────────────── */
  const invStats = useMemo(() => {
    const low = [], out = [];
    let inversionTotal = 0, ingresosTotal = 0;
    for (const p of products) {
      const s = getStatus(p);
      if (s === 'bajo')    low.push(p);
      if (s === 'agotado') out.push(p);
      inversionTotal += (p.purchasePrice || 0) * p.quantity;
      ingresosTotal  += p.price * p.quantity;
    }
    return {
      low, out, inversionTotal, ingresosTotal,
      gananciasTotal: ingresosTotal - inversionTotal,
      okCount: products.length - low.length - out.length,
    };
  }, [products, getStatus]);

  /* ── Ventas reales ──────────────────────────────────────── */
  const salesStats = useMemo(() => {
    const now        = new Date();
    const todayStr   = now.toISOString().slice(0, 10);
    const weekAgo    = new Date(now); weekAgo.setDate(now.getDate() - 6);
    const monthAgo   = new Date(now); monthAgo.setDate(now.getDate() - 29);

    let profitToday = 0, revenueToday = 0, unitsToday = 0;
    let profitWeek  = 0, revenueWeek  = 0;
    let profitMonth = 0, revenueMonth = 0;
    let profitTotal = 0, revenueTotal = 0;

    const byProduct  = {};
    const byCategory = {};
    const byDay      = {};  // 'YYYY-MM-DD' → { revenue, profit, units }

    for (const s of sales) {
      const sDate = new Date(s.date);
      const sDay  = toDay(s.date);

      profitTotal  += s.profit;
      revenueTotal += s.revenue;

      if (sDay === todayStr) {
        profitToday  += s.profit;
        revenueToday += s.revenue;
        unitsToday   += s.qty;
      }
      if (sDate >= weekAgo) {
        profitWeek  += s.profit;
        revenueWeek += s.revenue;
      }
      if (sDate >= monthAgo) {
        profitMonth  += s.profit;
        revenueMonth += s.revenue;
      }

      // By product
      if (!byProduct[s.productId]) {
        byProduct[s.productId] = {
          productId: s.productId, name: s.productName,
          categoryName: s.categoryName, categoryColor: s.categoryColor,
          qty: 0, revenue: 0, profit: 0,
        };
      }
      byProduct[s.productId].qty     += s.qty;
      byProduct[s.productId].revenue += s.revenue;
      byProduct[s.productId].profit  += s.profit;

      // By category
      const catKey = s.categoryId || '__none__';
      if (!byCategory[catKey]) {
        byCategory[catKey] = {
          name: s.categoryName || 'Sin categoría',
          color: s.categoryColor || '#888',
          revenue: 0, profit: 0,
        };
      }
      byCategory[catKey].revenue += s.revenue;
      byCategory[catKey].profit  += s.profit;

      // By day
      if (!byDay[sDay]) byDay[sDay] = { revenue: 0, profit: 0, units: 0 };
      byDay[sDay].revenue += s.revenue;
      byDay[sDay].profit  += s.profit;
      byDay[sDay].units   += s.qty;
    }

    // Chart — últimos 14 días
    const days14 = lastNDays(14);
    const dailyChart = days14.map(day => ({
      day,
      label: dayLabel(day),
      revenue: byDay[day]?.revenue || 0,
      profit:  byDay[day]?.profit  || 0,
      units:   byDay[day]?.units   || 0,
      isToday: day === todayStr,
    }));

    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topCategories = Object.values(byCategory)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      profitToday, revenueToday, unitsToday,
      profitWeek,  revenueWeek,
      profitMonth, revenueMonth,
      profitTotal, revenueTotal,
      dailyChart, topProducts, topCategories,
      totalSales: sales.length,
    };
  }, [sales]);

  /* ── Movimientos recientes ──────────────────────────────── */
  const recentMovements = useMemo(() =>
    movements.slice(0, 6),
    [movements]
  );

  /* ── Ventas recientes ───────────────────────────────────── */
  const recentSales = useMemo(() =>
    sales.slice(0, 8),
    [sales]
  );

  /* ── Cat stats (inventario) ─────────────────────────────── */
  const catStats = useMemo(() =>
    categories
      .map(c => {
        const prods    = products.filter(p => p.categoryId === c.id);
        const inversion = prods.reduce((s, p) => s + (p.purchasePrice || 0) * p.quantity, 0);
        const ingresos  = prods.reduce((s, p) => s + p.price * p.quantity, 0);
        return { ...c, count: prods.length, inversion, ingresos, ganancia: ingresos - inversion, value: ingresos };
      })
      .sort((a, b) => b.value - a.value),
    [categories, products]
  );

  const maxCatValue = Math.max(...catStats.map(c => c.value), 1);

  return {
    products, categories, movements, sales,
    invStats, salesStats,
    catStats, maxCatValue,
    recentMovements, recentSales,
    exportCSV, getStatus,
  };
}
