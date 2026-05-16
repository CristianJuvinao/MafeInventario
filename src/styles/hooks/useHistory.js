// src/hooks/useHistory.js
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useHistory() {
  const { movements, clearMovements } = useApp();

  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() =>
    movements
      .filter((m) =>
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        (m.note || '').toLowerCase().includes(search.toLowerCase())
      )
      .filter((m) => !typeFilter || m.type === typeFilter),
    [movements, search, typeFilter]
  );

  const summary = useMemo(() => {
    const entradas = movements.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.qty, 0);
    const salidas  = movements.filter((m) => m.type === 'salida').reduce((s, m) => s + m.qty, 0);
    const ajustes  = movements.filter((m) => m.type === 'ajuste').length;
    return { entradas, salidas, ajustes, total: movements.length };
  }, [movements]);

  const handleClear = () => {
    clearMovements();
    setConfirmClear(false);
  };

  return {
    // data
    movements,
    filtered,
    summary,
    // filters
    search, setSearch,
    typeFilter, setTypeFilter,
    // modal
    showModal, setShowModal,
    // confirm
    confirmClear, setConfirmClear, handleClear,
  };
}
