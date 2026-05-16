// src/hooks/useSales.js
import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',     },
  { key: 'transferencia', label: 'Transferencia', },
  { key: 'tarjeta',       label: 'Tarjeta',       },
  { key: 'otro',          label: 'Otro',          },
];

export function useSales() {
  const { products, categories, sales, registerSale, deleteSale, getStatus } = useApp();

  // ── Cart state ────────────────────────────────────────────
  const [cart,          setCart]          = useState([]);
  const [note,          setNote]          = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [search,        setSearch]        = useState('');
  const [saving,        setSaving]        = useState(false);

  // ── History filters ───────────────────────────────────────
  const [histSearch, setHistSearch] = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');

  // ── Confirm delete ────────────────────────────────────────
  const [confirmSale, setConfirmSale] = useState(null);

  // ── Filtered products for picker ─────────────────────────
  const availableProducts = useMemo(() =>
    products
      .filter(p => getStatus(p) !== 'agotado')
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [products, search, getStatus]
  );

  // ── Cart helpers ──────────────────────────────────────────
  const addToCart = useCallback((productId) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        const prod = products.find(p => p.id === productId);
        const maxQty = prod?.quantity || 1;
        return prev.map(i =>
          i.productId === productId
            ? { ...i, qty: Math.min(i.qty + 1, maxQty) }
            : i
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
    setSearch('');
  }, [products]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId, qty) => {
    const prod = products.find(p => p.id === productId);
    const maxQty = prod?.quantity || 1;
    const safeQty = Math.max(1, Math.min(Number(qty) || 1, maxQty));
    setCart(prev =>
      prev.map(i => i.productId === productId ? { ...i, qty: safeQty } : i)
    );
  }, [products]);

  const clearCart = useCallback(() => {
    setCart([]);
    setNote('');
    setPaymentMethod('efectivo');
  }, []);

  // ── Cart totals ───────────────────────────────────────────
  const cartTotals = useMemo(() => {
    let revenue = 0, cost = 0;
    for (const item of cart) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) continue;
      revenue += prod.price * item.qty;
      cost    += (prod.purchasePrice || 0) * item.qty;
    }
    return { revenue, cost, profit: revenue - cost };
  }, [cart, products]);

  // ── Submit sale ───────────────────────────────────────────
  const submitSale = useCallback(async () => {
    if (!cart.length || saving) return;
    setSaving(true);
    try {
      await registerSale(cart, note, paymentMethod);
      clearCart();
    } finally {
      setSaving(false);
    }
  }, [cart, note, paymentMethod, saving, registerSale, clearCart]);

  // ── History (filtered) ────────────────────────────────────
  const filteredSales = useMemo(() => {
    let list = [...sales];
    if (histSearch) {
      const q = histSearch.toLowerCase();
      list = list.filter(s =>
        s.productName.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q) ||
        (s.note || '').toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter(s => s.date >= dateFrom);
    if (dateTo)   list = list.filter(s => s.date <= dateTo + 'T23:59:59');
    return list;
  }, [sales, histSearch, dateFrom, dateTo]);

  // ── Delete sale ───────────────────────────────────────────
  const handleDeleteSale = useCallback(async () => {
    if (!confirmSale) return;
    await deleteSale(confirmSale);
    setConfirmSale(null);
  }, [confirmSale, deleteSale]);

  return {
    availableProducts, products, categories,
    search, setSearch,
    cart, note, setNote,
    paymentMethod, setPaymentMethod,
    addToCart, removeFromCart, setQty, clearCart,
    cartTotals, saving, submitSale,
    sales, filteredSales,
    histSearch, setHistSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    confirmSale, setConfirmSale,
    handleDeleteSale,
  };
}
