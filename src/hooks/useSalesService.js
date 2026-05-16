// src/hooks/useSalesService.js
// Responsabilidad única: registrar ventas reales en Firestore
// y descontar el stock correspondiente.
import { useCallback } from 'react';
import { setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { userDoc, userCol, uid } from '../utils/firestore';

export function useSalesService(userId, products, categories, toast) {

  /**
   * registerSale(items, note, paymentMethod)
   * items: [{ productId, qty }]
   * Crea un sale_group con N líneas y descuenta el stock.
   */
  const registerSale = useCallback(async (items, note = '', paymentMethod = 'efectivo') => {
    if (!userId || !items.length) return;

    const batch       = writeBatch(db);
    const saleGroupId = 'sg_' + uid();
    const date        = new Date().toISOString();
    let   totalProfit  = 0;
    let   totalRevenue = 0;

    const lines = [];

    for (const { productId, qty } of items) {
      const prod = products.find(p => p.id === productId);
      if (!prod || qty <= 0) continue;

      const salePrice     = prod.price || 0;
      const purchasePrice = prod.purchasePrice || 0;
      const profit        = (salePrice - purchasePrice) * qty;
      const revenue       = salePrice * qty;
      const cat           = categories.find(c => c.id === prod.categoryId);

      totalProfit  += profit;
      totalRevenue += revenue;

      const saleId  = 'sale_' + uid();
      const saleDoc = {
        id:            saleId,
        saleGroupId,
        date,
        note,
        paymentMethod,
        productId:     prod.id,
        productName:   prod.name,
        categoryId:    prod.categoryId  || '',
        categoryName:  cat?.name        || '',
        categoryColor: cat?.color       || '#888',
        qty,
        salePrice,
        purchasePrice,
        profit,
        revenue,
        unit:          prod.unit || 'unidad',
      };

      batch.set(userDoc(userId, 'sales', saleId), saleDoc);
      lines.push(saleDoc);

      // Descontar stock
      batch.set(userDoc(userId, 'products', productId), {
        ...prod,
        quantity: Math.max(0, prod.quantity - qty),
      });

      // Log en movements
      const movId = 'm_' + uid();
      batch.set(userDoc(userId, 'movements', movId), {
        productId:   prod.id,
        productName: prod.name,
        type:        'salida',
        qty,
        note:        note || 'Venta registrada',
        date,
      });
    }

    await batch.commit();

    const count = lines.length;
    toast(
      count === 1
        ? `Venta registrada · ${lines[0].productName} ×${lines[0].qty} ✓`
        : `Venta registrada · ${count} productos ✓`
    );

    return { saleGroupId, lines, totalProfit, totalRevenue };
  }, [userId, products, categories, toast]);

  /**
   * deleteSale(sale)
   * Elimina una línea de venta y devuelve el stock.
   */
  const deleteSale = useCallback(async (sale) => {
    if (!userId) return;

    const batch = writeBatch(db);
    batch.delete(userDoc(userId, 'sales', sale.id));

    const prod = products.find(p => p.id === sale.productId);
    if (prod) {
      batch.set(userDoc(userId, 'products', sale.productId), {
        ...prod,
        quantity: prod.quantity + sale.qty,
      });
    }

    await batch.commit();
    toast('Venta eliminada y stock restaurado');
  }, [userId, products, toast]);

  return { registerSale, deleteSale };
}
