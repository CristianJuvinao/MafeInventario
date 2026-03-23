// src/hooks/useProducts.js
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, getStatus, exportCSV } = useApp();

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sortBy,    setSortBy]    = useState('name');
  const [sortDir,   setSortDir]   = useState(1);
  const [showForm,  setShowForm]  = useState(false);
  const [editProd,  setEditProd]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d * -1);
    else { setSortBy(col); setSortDir(1); }
  };

  const sortArrow = col => sortBy === col ? (sortDir === 1 ? ' ↑' : ' ↓') : '';

  const filtered = useMemo(() =>
    products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => !catFilter || p.categoryId === catFilter)
      .sort((a, b) => {
        const va = a[sortBy], vb = b[sortBy];
        return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * sortDir;
      }),
    [products, search, catFilter, sortBy, sortDir]
  );

  const totals = useMemo(() => {
    let inversion = 0, ingresos = 0;
    for (const p of filtered) {
      inversion += (p.purchasePrice || 0) * p.quantity;
      ingresos  += p.price * p.quantity;
    }
    return { inversion, ingresos, ganancias: ingresos - inversion };
  }, [filtered]);

  const closeForm = () => { setShowForm(false); setEditProd(null); };

  const handleSave = data => {
    editProd ? updateProduct(editProd.id, data) : addProduct(data);
    closeForm();
  };

  const handleDelete = () => { deleteProduct(confirmId); setConfirmId(null); };

  return {
    // estado
    products, categories, filtered, totals,
    search, setSearch,
    catFilter, setCatFilter,
    showForm, setShowForm,
    editProd, setEditProd,
    confirmId, setConfirmId,
    // acciones
    handleSort, sortArrow,
    closeForm, handleSave, handleDelete,
    getStatus, exportCSV,
  };
}
