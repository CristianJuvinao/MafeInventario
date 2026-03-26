// src/hooks/useDashboard.js
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useDashboard() {
  const { products, categories, getStatus, exportCSV } = useApp();

  const stats = useMemo(() => {
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

  const catStats = useMemo(() =>
    categories
      .map(c => {
        const prods     = products.filter(p => p.categoryId === c.id);
        const inversion = prods.reduce((s, p) => s + (p.purchasePrice || 0) * p.quantity, 0);
        const ingresos  = prods.reduce((s, p) => s + p.price * p.quantity, 0);
        return { ...c, count: prods.length, inversion, ingresos, ganancia: ingresos - inversion, value: ingresos };
      })
      .sort((a, b) => b.value - a.value),
    [categories, products]
  );

  const maxValue = Math.max(...catStats.map(c => c.value), 1);

  return { products, categories, stats, catStats, maxValue, exportCSV, getStatus };
}
