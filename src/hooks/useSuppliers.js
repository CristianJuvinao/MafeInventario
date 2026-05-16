// src/hooks/useSuppliers.js
// UI logic para la página de proveedores.
// Los datos vienen de AppContext (useFirestoreSync) — sin listener propio.
import { useState, useMemo, useCallback } from 'react';
import { setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { userDoc, uid } from '../utils/firestore';

export function useSuppliers() {
  const { suppliers, categories } = useApp();
  const { user } = useAuth();
  const userId = user?.uid;

  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editSupp,  setEditSupp]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = useMemo(() =>
    suppliers.filter(s => {
      const q = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.contact?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q)
      );
    }),
    [suppliers, search]
  );

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditSupp(null);
  }, []);

  const handleSave = useCallback(async (data) => {
    if (!userId) return;
    if (editSupp) {
      await updateDoc(userDoc(userId, 'suppliers', editSupp.id), data);
    } else {
      const id = 'sup_' + uid();
      await setDoc(userDoc(userId, 'suppliers', id), { ...data, id, active: true });
    }
    closeForm();
  }, [userId, editSupp, closeForm]);

  const handleDelete = useCallback(async () => {
    if (!userId || !confirmId) return;
    await deleteDoc(userDoc(userId, 'suppliers', confirmId));
    setConfirmId(null);
  }, [userId, confirmId]);

  const toggleActive = useCallback(async (id) => {
    if (!userId) return;
    const s = suppliers.find(x => x.id === id);
    if (s) await updateDoc(userDoc(userId, 'suppliers', id), { active: !s.active });
  }, [userId, suppliers]);

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
