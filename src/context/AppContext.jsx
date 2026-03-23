
import { createContext, useContext, useCallback } from 'react';
import { useAuth }             from './AuthContext';
import { useTheme }            from '../hooks/useTheme';
import { useToast }            from '../hooks/useToast';
import { useFirestoreSync }    from '../hooks/useFirestoreSync';
import { useCategoryService }  from '../hooks/useCategoryService';
import { useProductService }   from '../hooks/useProductService';
import { getStatus }           from '../utils/helpers.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user }  = useAuth();
  const userId    = user?.uid;

  const { theme, setTheme }                               = useTheme();
  const { toasts, toast }                                 = useToast();
  const { categories, products, movements, ready }        = useFirestoreSync(userId);
  const { addCategory, updateCategory, deleteCategory }   = useCategoryService(userId, categories, products, toast);
  const { addProduct, updateProduct, deleteProduct,
          registerMovement, clearMovements: _clearMovements } = useProductService(userId, products, toast);

  /* clearMovements necesita el array actual de movements */
  const clearMovements = useCallback(
    () => _clearMovements(movements),
    [_clearMovements, movements]
  );

  /* exportCSV vive aquí porque depende de products + categories + toast */
  const exportCSV = useCallback(() => {
    const header = 'Nombre,Categoría,P.Compra,P.Venta,Cantidad,Unidad,Inversión,Ingresos,Ganancia,Stock mín.,Estado\n';
    const rows = products.map(p => {
      const cat           = categories.find(c => c.id === p.categoryId);
      const purchasePrice = p.purchasePrice || 0;
      const inversion     = purchasePrice * p.quantity;
      const ingresos      = p.price * p.quantity;
      return [
        `"${p.name}"`, `"${cat?.name || ''}"`,
        purchasePrice, p.price, p.quantity, `"${p.unit}"`,
        inversion, ingresos, ingresos - inversion,
        p.minStock, `"${getStatus(p)}"`,
      ].join(',');
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'inventario.csv' });
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exportado ✓');
  }, [products, categories, toast]);

  return (
    <AppContext.Provider value={{
      categories, products, movements, ready,
      theme, setTheme, toasts, toast,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      registerMovement, clearMovements,
      getStatus, exportCSV,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
};
