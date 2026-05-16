// src/hooks/useCategoryService.js
// Responsabilidad única: escrituras de categorías en Firestore.
import { useCallback } from 'react';
import { setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { userDoc, uid } from '../utils/firestore';

export function useCategoryService(userId, categories, products, toast) {
  const addCategory = useCallback(async cat => {
    if (!userId) return;
    const id = 'c_' + uid();
    await setDoc(userDoc(userId, 'categories', id), { ...cat, id });
    toast('Categoría creada ✓');
    return id;
  }, [userId, toast]);

  const updateCategory = useCallback(async (id, data) => {
    if (!userId) return;
    const cur = categories.find(c => c.id === id);
    await setDoc(userDoc(userId, 'categories', id), { ...cur, ...data });
    toast('Categoría actualizada ✓');
  }, [userId, categories, toast]);

  const deleteCategory = useCallback(async id => {
    if (!userId) return;
    const batch = writeBatch(db);
    batch.delete(userDoc(userId, 'categories', id));
    products
      .filter(p => p.categoryId === id)
      .forEach(p => batch.delete(userDoc(userId, 'products', p.id)));
    await batch.commit();
    toast('Categoría eliminada');
  }, [userId, products, toast]);

  return { addCategory, updateCategory, deleteCategory };
}
