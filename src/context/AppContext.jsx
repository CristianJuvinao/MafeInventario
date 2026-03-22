import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { storage, getStatus } from '../utils/helpers.js';
import { INIT_CATEGORIES, INIT_PRODUCTS } from '../utils/constants.js';

const AppContext = createContext(null);

/* ──────────────────────────────────────────────────────────────
   Utils
────────────────────────────────────────────────────────────── */
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString();

/* ──────────────────────────────────────────────────────────────
   Provider
────────────────────────────────────────────────────────────── */
export function AppProvider({ children }) {
  const [categories, setCategories] = useState(() =>
    storage.get('inv_categories', INIT_CATEGORIES)
  );
  const [products, setProducts] = useState(() =>
    storage.get('inv_products', INIT_PRODUCTS)
  );
  const [theme, setTheme] = useState(() =>
    storage.get('inv_theme', 'dark')
  );

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /* ── Persistencia ────────────────────────────────────────── */
  useEffect(() => storage.set('inv_categories', categories), [categories]);
  useEffect(() => storage.set('inv_products', products), [products]);
  useEffect(() => storage.set('inv_theme', theme), [theme]);

  /* ── Sync theme with DOM (opcional pero pro) ─────────────── */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /* ── Toast system ───────────────────────────────────────── */
  const toast = useCallback((msg, type = 'success') => {
    const id = ++toastId.current;

    setToasts(t =>
      [...t, { id, msg, type }].slice(-4) // máximo 4 toasts
    );

    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3000);
  }, []);

  /* ── Category actions ───────────────────────────────────── */
  const addCategory = useCallback(cat => {
    setCategories(c => [...c, { ...cat, id: 'c_' + uid() }]);
    toast('Categoría creada ✓');
  }, [toast]);

  const updateCategory = useCallback((id, data) => {
    setCategories(c =>
      c.map(x => (x.id === id ? { ...x, ...data } : x))
    );
    toast('Categoría actualizada ✓');
  }, [toast]);

  const deleteCategory = useCallback(id => {
    setCategories(c => c.filter(x => x.id !== id));
    setProducts(p => p.filter(x => x.categoryId !== id));
    toast('Categoría eliminada');
  }, [toast]);

  /* ── Product actions ────────────────────────────────────── */
  const addProduct = useCallback(prod => {
    setProducts(p => [...p, { ...prod, id: 'p_' + uid() }]);
    toast('Producto agregado ✓');
  }, [toast]);

  const updateProduct = useCallback((id, data) => {
    setProducts(p =>
      p.map(x => (x.id === id ? { ...x, ...data } : x))
    );
    toast('Producto actualizado ✓');
  }, [toast]);

  const deleteProduct = useCallback(id => {
    setProducts(p => p.filter(x => x.id !== id));
    toast('Producto eliminado');
  }, [toast]);

  /* ── CSV export ─────────────────────────────────────────── */
  const exportCSV = useCallback(() => {
    const header =
      'Nombre,Categoría,Precio,Cantidad,Unidad,Stock mín.,Estado\n';

    const rows = products
      .map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        return `"${p.name}","${cat?.name || ''}",${p.price},${p.quantity},"${p.unit}",${p.minStock},"${getStatus(p)}"`;
      })
      .join('\n');

    const blob = new Blob([header + rows], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.csv';
    a.click();

    URL.revokeObjectURL(url);
    toast('CSV exportado ✓');
  }, [products, categories, toast]);

  return (
    <AppContext.Provider
      value={{
        categories,
        products,
        theme,
        setTheme,
        toasts,
        toast,

        addCategory,
        updateCategory,
        deleteCategory,

        addProduct,
        updateProduct,
        deleteProduct,

        getStatus,
        exportCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ──────────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────────── */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de <AppProvider>');
  }
  return ctx;
};