// src/hooks/useDashboard.js
import { useMemo } from 'react';
import { useApp }             from '../context/AppContext';
import { useSalesStats }      from './useSalesStats';
import { useInventoryStats }  from './useInventoryStats';

export function useDashboard() {
  const { products, categories, movements, sales, exportCSV, getStatus } = useApp();

  const salesStats = useSalesStats(sales);
  const invStats   = useInventoryStats(products, categories);

  const recentMovements = useMemo(() => movements.slice(0, 6), [movements]);
  const recentSales     = useMemo(() => sales.slice(0, 8),     [sales]);

  // Barras de categorías (inventario) para la sidebar del dashboard
  const catStats = useMemo(() =>
    invStats.catBreakdown.map(c => ({ ...c, value: c.ingresos })),
    [invStats.catBreakdown]
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
