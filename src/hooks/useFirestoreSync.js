// src/hooks/useFirestoreSync.js
// Mantiene categories, products, movements, sales, orders y suppliers
// sincronizados con Firestore en tiempo real.
import { useState, useEffect } from 'react';
import { onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { userCol, userDoc } from '../utils/firestore';
import { INIT_CATEGORIES, INIT_PRODUCTS } from '../utils/constants';

export function useFirestoreSync(userId) {
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [movements,  setMovements]  = useState([]);
  const [sales,      setSales]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [suppliers,  setSuppliers]  = useState([]);
  const [ready,      setReady]      = useState(false);

  useEffect(() => {
    if (!userId) { setReady(false); return; }

    setReady(false);
    const loaded = {
      categories: false, products: false, movements: false,
      sales: false, orders: false, suppliers: false,
    };

    const markLoaded = key => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setReady(true);
    };

    const unsubCat = onSnapshot(userCol(userId, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      markLoaded('categories');
    });

    const unsubProd = onSnapshot(userCol(userId, 'products'), snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      markLoaded('products');
    });

    const unsubMov = onSnapshot(userCol(userId, 'movements'), snap => {
      setMovements(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      markLoaded('movements');
    });

    const unsubSales = onSnapshot(userCol(userId, 'sales'), snap => {
      setSales(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      markLoaded('sales');
    });

    const unsubOrders = onSnapshot(userCol(userId, 'orders'), snap => {
      setOrders(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      markLoaded('orders');
    });

    const unsubSuppliers = onSnapshot(userCol(userId, 'suppliers'), snap => {
      setSuppliers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
      markLoaded('suppliers');
    });

    return () => {
      unsubCat(); unsubProd(); unsubMov();
      unsubSales(); unsubOrders(); unsubSuppliers();
    };
  }, [userId]);

  // Seed inicial
  useEffect(() => {
    if (!ready || !userId) return;
    if (categories.length > 0 || products.length > 0) return;

    const batch = writeBatch(db);
    INIT_CATEGORIES.forEach(c => batch.set(userDoc(userId, 'categories', c.id), c));
    INIT_PRODUCTS.forEach(p   => batch.set(userDoc(userId, 'products',   p.id), p));
    batch.commit();
  }, [ready, userId, categories.length, products.length]);

  return { categories, products, movements, sales, orders, suppliers, ready };
}
