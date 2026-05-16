// src/hooks/useAlerts.js
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useAlerts() {
  const { products, categories, getStatus } = useApp();

  const lowProds = useMemo(() =>
    products
      .filter(p => getStatus(p) !== 'ok')
      .sort((a, b) => a.quantity - b.quantity),
    [products, getStatus]
  );

  const agotados = lowProds.filter(p => getStatus(p) === 'agotado').length;
  const bajos = lowProds.filter(p => getStatus(p) === 'bajo').length;

  return { lowProds, categories, getStatus, agotados, bajos };
}
