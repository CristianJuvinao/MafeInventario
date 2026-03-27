// src/hooks/useSalesStats.js
// Calcula estadísticas reales a partir de la colección `sales`.
import { useMemo } from 'react';

const startOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(0,0,0,0); }
  if (unit === 'week')  { const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0,0,0,0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); }
  return d;
};

export function useSalesStats(sales) {
  return useMemo(() => {
    if (!sales.length) return empty();

    const now = new Date();
    const todayStart  = startOf(now, 'day');
    const weekStart   = startOf(now, 'week');
    const monthStart  = startOf(now, 'month');

    let profitToday = 0, revenueToday = 0, unitsToday = 0;
    let profitWeek  = 0, revenueWeek  = 0, unitsWeek  = 0;
    let profitMonth = 0, revenueMonth = 0, unitsMonth = 0;
    let profitTotal = 0, revenueTotal = 0, unitsTotal = 0;

    const byProduct  = {};  // productId → { name, qty, revenue, profit, categoryName, categoryColor }
    const byCategory = {};  // categoryId → { name, color, qty, revenue, profit }
    const byDay      = {};  // 'YYYY-MM-DD' → { revenue, profit }

    for (const s of sales) {
      const sDate = new Date(s.date);
      profitTotal  += s.profit;
      revenueTotal += s.revenue;
      unitsTotal   += s.qty;

      if (sDate >= todayStart) {
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
          productId:     s.productId,
          name:          s.productName,
          categoryName:  s.categoryName,
          categoryColor: s.categoryColor,
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
          categoryId:    catKey,
          name:          s.categoryName || 'Sin categoría',
          color:         s.categoryColor || '#888',
          qty: 0, revenue: 0, profit: 0,
        };
      }
      byCategory[catKey].qty     += s.qty;
      byCategory[catKey].revenue += s.revenue;
      byCategory[catKey].profit  += s.profit;

      // Por día (últimos 30 días)
      const dayKey = s.date.slice(0, 10); // 'YYYY-MM-DD'
      if (!byDay[dayKey]) byDay[dayKey] = { revenue: 0, profit: 0 };
      byDay[dayKey].revenue += s.revenue;
      byDay[dayKey].profit  += s.profit;
    }

    // Top products (por revenue)
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Top categories
    const topCategories = Object.values(byCategory)
      .sort((a, b) => b.revenue - a.revenue);

    // Daily chart — últimos 15 días
    const dailyChart = getLast15Days().map(day => ({
      label: day.slice(5),           // MM-DD
      date:  day,
      revenue: byDay[day]?.revenue || 0,
      profit:  byDay[day]?.profit  || 0,
    }));

    return {
      profitToday,  revenueToday,  unitsToday,
      profitWeek,   revenueWeek,   unitsWeek,
      profitMonth,  revenueMonth,  unitsMonth,
      profitTotal,  revenueTotal,  unitsTotal,
      topProducts,
      topCategories,
      dailyChart,
      totalSales: sales.length,
    };
  }, [sales]);
}

function empty() {
  return {
    profitToday: 0, revenueToday: 0, unitsToday: 0,
    profitWeek:  0, revenueWeek:  0, unitsWeek:  0,
    profitMonth: 0, revenueMonth: 0, unitsMonth: 0,
    profitTotal: 0, revenueTotal: 0, unitsTotal: 0,
    topProducts: [], topCategories: [], dailyChart: [],
    totalSales: 0,
  };
}

function getLast15Days() {
  const days = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
