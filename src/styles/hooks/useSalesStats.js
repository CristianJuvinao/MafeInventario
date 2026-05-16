// src/hooks/useSalesStats.js
// Fuente única de verdad para estadísticas de ventas reales.
import { useMemo } from 'react';

const toDay = iso => iso.slice(0, 10);

function getLast15Days() {
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    return d.toISOString().slice(0, 10);
  });
}

function emptyStats() {
  return {
    profitToday: 0, revenueToday: 0, unitsToday: 0,
    profitWeek:  0, revenueWeek:  0, unitsWeek:  0,
    profitMonth: 0, revenueMonth: 0, unitsMonth: 0,
    profitTotal: 0, revenueTotal: 0, unitsTotal: 0,
    topProducts: [], topCategories: [], dailyChart: [],
    totalSales: 0,
  };
}

/**
 * useSalesStats(sales)
 * Calcula todas las métricas de ventas a partir de la colección `sales`.
 * Usado en SalesPage, DashboardPage y ReportsPage.
 */
export function useSalesStats(sales) {
  return useMemo(() => {
    if (!sales.length) return emptyStats();

    const now        = new Date();
    const todayStr   = now.toISOString().slice(0, 10);
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6);
    const monthStart = new Date(now); monthStart.setDate(now.getDate() - 29);

    let profitToday = 0, revenueToday = 0, unitsToday = 0;
    let profitWeek  = 0, revenueWeek  = 0, unitsWeek  = 0;
    let profitMonth = 0, revenueMonth = 0, unitsMonth = 0;
    let profitTotal = 0, revenueTotal = 0, unitsTotal = 0;

    const byProduct  = {};
    const byCategory = {};
    const byDay      = {};

    for (const s of sales) {
      const sDate = new Date(s.date);
      const sDay  = toDay(s.date);

      profitTotal  += s.profit;
      revenueTotal += s.revenue;
      unitsTotal   += s.qty;

      if (sDay === todayStr) {
        profitToday  += s.profit;
        revenueToday += s.revenue;
        unitsToday   += s.qty;
      }
      if (sDate >= weekStart) {
        profitWeek  += s.profit;
        revenueWeek += s.revenue;
        unitsWeek   += s.qty;
      }
      if (sDate >= monthStart) {
        profitMonth  += s.profit;
        revenueMonth += s.revenue;
        unitsMonth   += s.qty;
      }

      // Por producto
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

      // Por categoría
      const catKey = s.categoryId || 'sin-categoria';
      if (!byCategory[catKey]) {
        byCategory[catKey] = {
          categoryId: catKey,
          name:  s.categoryName  || 'Sin categoría',
          color: s.categoryColor || '#888',
          qty: 0, revenue: 0, profit: 0,
        };
      }
      byCategory[catKey].qty     += s.qty;
      byCategory[catKey].revenue += s.revenue;
      byCategory[catKey].profit  += s.profit;

      // Por día
      if (!byDay[sDay]) byDay[sDay] = { revenue: 0, profit: 0, units: 0 };
      byDay[sDay].revenue += s.revenue;
      byDay[sDay].profit  += s.profit;
      byDay[sDay].units   += s.qty;
    }

    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const topCategories = Object.values(byCategory)
      .sort((a, b) => b.revenue - a.revenue);

    // Gráfica — últimos 15 días
    const dailyChart = getLast15Days().map(day => {
      const d = new Date(day + 'T00:00:00');
      const label = d.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3);
      return {
        day,
        label,
        isToday: day === todayStr,
        revenue: byDay[day]?.revenue || 0,
        profit:  byDay[day]?.profit  || 0,
        units:   byDay[day]?.units   || 0,
      };
    });

    return {
      profitToday, revenueToday, unitsToday,
      profitWeek,  revenueWeek,  unitsWeek,
      profitMonth, revenueMonth, unitsMonth,
      profitTotal, revenueTotal, unitsTotal,
      topProducts, topCategories, dailyChart,
      totalSales: sales.length,
    };
  }, [sales]);
}
