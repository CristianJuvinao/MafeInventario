// src/hooks/useSuppliers.js
import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useSuppliers() {
  const { products, categories } = useApp();

  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editSupp,  setEditSupp]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // Local state for suppliers (not persisted to Firestore in this version)
  const [suppliers, setSuppliers] = useState([
    {
      id: 's1',
      name: 'Distribuidora Nacional',
      contact: 'Carlos Pérez',
      phone: '+57 310 000 0001',
      email: 'ventas@distnacional.com',
      city: 'Bogotá',
      categoryIds: [],
      notes: 'Proveedor principal de maquillaje y cosméticos.',
      active: true,
    },
    {
      id: 's2',
      name: 'Tech Import S.A.S',
      contact: 'Laura Gómez',
      phone: '+57 320 000 0002',
      email: 'compras@techimport.co',
      city: 'Medellín',
      categoryIds: [],
      notes: 'Importación de electrónica y accesorios.',
      active: true,
    },
  ]);

  const filtered = useMemo(() =>
    suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    ),
    [suppliers, search]
  );

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditSupp(null);
  }, []);

  const handleSave = useCallback((data) => {
    if (editSupp) {
      setSuppliers(prev =>
        prev.map(s => s.id === editSupp.id ? { ...s, ...data } : s)
      );
    } else {
      setSuppliers(prev => [
        ...prev,
        { ...data, id: `s${Date.now()}`, active: true },
      ]);
    }
    closeForm();
  }, [editSupp, closeForm]);

  const handleDelete = useCallback(() => {
    setSuppliers(prev => prev.filter(s => s.id !== confirmId));
    setConfirmId(null);
  }, [confirmId]);

  const toggleActive = useCallback((id) => {
    setSuppliers(prev =>
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    );
  }, []);

  return {
    suppliers, filtered,
    search, setSearch,
    showForm, setShowForm,
    editSupp, setEditSupp,
    confirmId, setConfirmId,
    closeForm, handleSave, handleDelete, toggleActive,
    categories,
  };
}
