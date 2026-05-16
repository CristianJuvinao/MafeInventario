// src/hooks/useProductService.js
// Responsabilidad única: escrituras de productos y movimientos en Firestore.
import { useCallback } from 'react';
import { setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { userDoc, uid } from '../utils/firestore';

export function useProductService(userId, products, toast) {

  /* ── Log interno ─────────────────────────────────────── */
  const _logMovement = useCallback(async (productId, productName, type, qty, note = '') => {
    if (!userId) return;
    const id = 'm_' + uid();
    await setDoc(userDoc(userId, 'movements', id), {
      productId, productName, type, qty, note,
      date: new Date().toISOString(),
    });
  }, [userId]);

  /* ── Products ────────────────────────────────────────── */
  const addProduct = useCallback(async prod => {
    if (!userId) return;
    const id = 'p_' + uid();
    const newProd = { ...prod, id, imageUrl: null, imagePath: null };
    await setDoc(userDoc(userId, 'products', id), newProd);
    if (newProd.quantity > 0)
      await _logMovement(id, newProd.name, 'creacion', newProd.quantity, 'Stock inicial');
    toast('Producto agregado ✓');
  }, [userId, toast, _logMovement]);

  const updateProduct = useCallback(async (id, data) => {
    if (!userId) return;
    const prev    = products.find(p => p.id === id);
    const updated = { ...prev, ...data, imageUrl: null, imagePath: null };
    await setDoc(userDoc(userId, 'products', id), updated);
    if (prev && prev.quantity !== updated.quantity) {
      const diff = updated.quantity - prev.quantity;
      await _logMovement(id, updated.name, diff > 0 ? 'entrada' : 'salida', Math.abs(diff), 'Actualización manual');
    }
    toast('Producto actualizado ✓');
  }, [userId, products, toast, _logMovement]);

  const deleteProduct = useCallback(async id => {
    if (!userId) return;
    const prod = products.find(p => p.id === id);
    await deleteDoc(userDoc(userId, 'products', id));
    if (prod?.quantity > 0)
      await _logMovement(id, prod.name, 'eliminacion', prod.quantity, 'Producto eliminado');
    toast('Producto eliminado');
  }, [userId, products, toast, _logMovement]);

  /* ── Movimiento manual ───────────────────────────────── */
  const registerMovement = useCallback(async (productId, type, qty, note = '') => {
    if (!userId) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newQty =
      type === 'entrada' ? prod.quantity + qty :
      type === 'salida'  ? Math.max(0, prod.quantity - qty) :
      qty; // ajuste

    const logQty = type === 'ajuste' ? Math.abs(newQty - prod.quantity) : qty;
    await setDoc(userDoc(userId, 'products', productId), { ...prod, quantity: newQty });
    await _logMovement(productId, prod.name, type, logQty, note);

    toast(
      type === 'entrada' ? 'Entrada registrada ✓' :
      type === 'salida'  ? 'Salida registrada ✓'  :
                           'Ajuste registrado ✓'
    );
  }, [userId, products, _logMovement, toast]);

  /* ── Movements ───────────────────────────────────────── */
  const clearMovements = useCallback(async movements => {
    if (!userId) return;
    const batch = writeBatch(db);
    movements.forEach(m => batch.delete(userDoc(userId, 'movements', m.id)));
    await batch.commit();
    toast('Historial limpiado');
  }, [userId, toast]);

  return { addProduct, updateProduct, deleteProduct, registerMovement, clearMovements };
}
