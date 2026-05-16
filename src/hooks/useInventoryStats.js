// src/hooks/useInventoryStats.js
// Estadísticas de inventario: inversión, ingresos potenciales, alertas de stock.
import { useMemo } from 'react';
import { getStatus } from '../utils/helpers';

/**
 * useInventoryStats(products, categories)
 * Devuelve métricas sobre el stock actual (proyecciones, no ventas reales).
 */
export function useInventoryStats(products, categories) {
  return useMemo(() => {
    const low = [], out = [];
    let inversionTotal = 0, ingresosTotal = 0;

    for (const p of products) {
      const s = getStatus(p);
      if (s === 'bajo')    low.push(p);
      if (s === 'agotado') out.push(p);
      inversionTotal += (p.purchasePrice || 0) * p.quantity;
      ingresosTotal  += p.price * p.quantity;
    }

    const gananciasTotal = ingresosTotal - inversionTotal;
    const margen = inversionTotal > 0
      ? ((gananciasTotal / inversionTotal) * 100).toFixed(1)
      : '0.0';

    // Desglose por categoría
    const catBreakdown = categories.map(c => {
      const prods    = products.filter(p => p.categoryId === c.id);
      const inv      = prods.reduce((s, p) => s + (p.purchasePrice || 0) * p.quantity, 0);
      const ing      = prods.reduce((s, p) => s + p.price * p.quantity, 0);
      return { ...c, count: prods.length, inversion: inv, ingresos: ing, ganancia: ing - inv };
    }).sort((a, b) => b.ingresos - a.ingresos);

    // Top productos por valor en stock
    const topProducts = [...products]
      .map(p => ({
        ...p,
        totalValue: p.price * p.quantity,
        ganancia: (p.price - (p.purchasePrice || 0)) * p.quantity,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 6);

    return {
      low, out,
      okCount: products.length - low.length - out.length,
      inversionTotal, ingresosTotal, gananciasTotal, margen,
      catBreakdown,
      topProducts,
    };
  }, [products, categories]);
}
