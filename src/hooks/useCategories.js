// src/hooks/useCategories.js
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const productCount = useMemo(() => {
    const map = {};
    for (const p of products) map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    return map;
  }, [products]);

  const closeForm = () => { setShowForm(false); setEditCat(null); };

  const handleSave = data => {
    editCat ? updateCategory(editCat.id, data) : addCategory(data);
    closeForm();
  };

  const handleDelete = () => {
    deleteCategory(confirmId);
    setConfirmId(null);
  };

  return {
    categories,
    productCount,
    showForm, setShowForm,
    editCat, setEditCat,
    confirmId, setConfirmId,
    closeForm, handleSave, handleDelete,
  };
}
