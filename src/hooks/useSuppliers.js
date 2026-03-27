// src/hooks/useSuppliers.js
// Proveedores persistidos en Firestore (colección `suppliers`)
import { useState, useMemo, useCallback, useEffect } from 'react';
import { onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { userCol, userDoc, uid } from '../utils/firestore';

export function useSuppliers() {
  const { categories } = useApp();
  const { user } = useAuth();
  const userId = user?.uid;

  const [suppliers, setSuppliers] = useState([]);
  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editSupp,  setEditSupp]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // ── Firestore listener ─────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(userCol(userId, 'suppliers'), snap => {
      setSuppliers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    });
    return unsub;
  }, [userId]);

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
