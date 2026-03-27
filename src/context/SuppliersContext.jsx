// src/context/SuppliersContext.jsx
//
// Proveedor de datos para proveedores.
// Persiste en localStorage (o puedes swapear a Firestore).
// Expone: suppliers, addSupplier, updateSupplier, deleteSupplier
//
import { createContext, useContext, useEffect, useState } from 'react';

const SuppliersContext = createContext(null);

const STORAGE_KEY = 'mafe_suppliers';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function SuppliersProvider({ children }) {
  const [suppliers, setSuppliers] = useState(loadFromStorage);

  // Sync to localStorage whenever suppliers change
  useEffect(() => saveToStorage(suppliers), [suppliers]);

  // ── CRUD ─────────────────────────────────────────────────────
  const addSupplier = (form) => {
    const newSupplier = {
      ...form,
      id:        crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const updateSupplier = (id, form) => {
    setSuppliers(prev =>
      prev.map(s => s.id === id ? { ...s, ...form, updatedAt: new Date().toISOString() } : s)
    );
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SuppliersContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error('useSuppliers must be used inside <SuppliersProvider>');
  return ctx;
}
