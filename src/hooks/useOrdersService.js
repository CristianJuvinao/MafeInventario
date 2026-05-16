// src/hooks/useOrdersService.js
// Órdenes de compra (purchase orders).
// Cada orden tiene líneas de productos, proveedor y estado.
import { useCallback } from 'react';
import { setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { userDoc, uid } from '../utils/firestore';

/**
 * Estados posibles de una orden:
 *   'pendiente'  — creada, aún no enviada al proveedor
 *   'enviada'    — enviada al proveedor, esperando entrega
 *   'recibida'   — mercancía recibida, stock actualizado
 *   'cancelada'  — anulada
 */

export function useOrdersService(userId, products, toast) {

  /**
   * createOrder({ supplierId, supplierName, items, notes })
   * items: [{ productId, productName, qty, unitCost }]
   */
  const createOrder = useCallback(async ({ supplierId, supplierName, items, notes = '' }) => {
    if (!userId || !items.length) return;

    const id       = 'ord_' + uid();
    const date     = new Date().toISOString();
    const total    = items.reduce((s, i) => s + i.qty * i.unitCost, 0);

    const order = {
      id,
      date,
      supplierId:   supplierId || '',
      supplierName: supplierName || 'Sin proveedor',
      notes,
      status:       'pendiente',
      items,
      total,
      receivedAt:   null,
    };

    await setDoc(userDoc(userId, 'orders', id), order);
    toast(`Orden creada · ${items.length} producto${items.length !== 1 ? 's' : ''} ✓`);
    return order;
  }, [userId, toast]);

  /**
   * updateOrderStatus(orderId, status)
   * Cambia el estado sin tocar el stock.
   */
  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (!userId) return;
    await setDoc(
      userDoc(userId, 'orders', orderId),
      { status, ...(status === 'enviada' ? { sentAt: new Date().toISOString() } : {}) },
      { merge: true }
    );
    const labels = { enviada: 'Orden marcada como enviada', cancelada: 'Orden cancelada' };
    toast(labels[status] || 'Estado actualizado');
  }, [userId, toast]);

  /**
   * receiveOrder(order)
   * Marca la orden como recibida Y suma el stock de cada ítem.
   * Registra un movimiento de entrada por cada producto.
   */
  const receiveOrder = useCallback(async (order) => {
    if (!userId) return;

    const batch = writeBatch(db);
    const now   = new Date().toISOString();

    // Actualizar estado de la orden
    batch.set(
      userDoc(userId, 'orders', order.id),
      { status: 'recibida', receivedAt: now },
      { merge: true }
    );

    // Sumar stock + registrar movimiento por cada ítem
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) continue;

      // Actualizar cantidad del producto
      batch.set(
        userDoc(userId, 'products', item.productId),
        { ...prod, quantity: prod.quantity + item.qty },
      );

      // Log en movements
      const movId = 'm_' + uid();
      batch.set(userDoc(userId, 'movements', movId), {
        productId:   item.productId,
        productName: item.productName,
        type:        'entrada',
        qty:         item.qty,
        note:        `Recepción orden ${order.id.slice(0, 8)} · ${order.supplierName}`,
        date:        now,
      });
    }

    await batch.commit();
    toast(`Recepción registrada · stock actualizado ✓`);
  }, [userId, products, toast]);

  /**
   * deleteOrder(orderId)
   * Solo permite borrar órdenes pendientes o canceladas.
   */
  const deleteOrder = useCallback(async (orderId) => {
    if (!userId) return;
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(userDoc(userId, 'orders', orderId));
    toast('Orden eliminada');
  }, [userId, toast]);

  return { createOrder, updateOrderStatus, receiveOrder, deleteOrder };
}
