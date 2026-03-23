// src/context/AppContext.jsx
// ─────────────────────────────────────────────────────────────
// Los datos ahora se guardan en Firestore bajo:
//   users/{uid}/categories
//   users/{uid}/products
//   users/{uid}/movements
// Cada usuario tiene su propio inventario completamente aislado.
// ─────────────────────────────────────────────────────────────
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { getStatus } from "../utils/helpers.js";
import { INIT_CATEGORIES, INIT_PRODUCTS } from "../utils/constants.js";

const AppContext = createContext(null);

const uid_local = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString();

/* ── Rutas Firestore helpers ───────────────────────────────── */
const col = (userId, name) => collection(db, "users", userId, name);

const docRef = (userId, name, id) => doc(db, "users", userId, name, id);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.uid;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [ready, setReady] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /* ── Cargar datos del usuario desde Firestore ─────────── */
  useEffect(() => {
    if (!userId) {
      setReady(false);
      return;
    }

    setReady(false);
    let loaded = { categories: false, products: false, movements: false };

    const markLoaded = (key) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setReady(true);
    };

    const unsubCat = onSnapshot(col(userId, "categories"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(docs.length ? docs : []);
      markLoaded("categories");
    });

    const unsubProd = onSnapshot(col(userId, "products"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(docs.length ? docs : []);
      markLoaded("products");
    });

    const unsubMov = onSnapshot(col(userId, "movements"), (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setMovements(docs);
      markLoaded("movements");
    });

    return () => {
      unsubCat();
      unsubProd();
      unsubMov();
    };
  }, [userId]);

  /* ── Seed inicial (primera vez que entra el usuario) ──── */
  useEffect(() => {
    if (!ready || !userId) return;
    if (categories.length === 0 && products.length === 0) {
      const batch = writeBatch(db);
      INIT_CATEGORIES.forEach((c) =>
        batch.set(docRef(userId, "categories", c.id), c),
      );
      INIT_PRODUCTS.forEach((p) =>
        batch.set(docRef(userId, "products", p.id), p),
      );
      batch.commit();
    }
  }, [ready, userId, categories.length, products.length]);

  /* ── Tema ─────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("inv_theme");
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("inv_theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /* ── Toast ─────────────────────────────────────────────── */
  const toast = useCallback((msg, type = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }].slice(-4));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  /* ── Log movimiento ─────────────────────────────────────── */
  const _logMovement = useCallback(
    async (productId, productName, type, qty, note = "") => {
      if (!userId) return;
      const id = "m_" + uid_local();
      await setDoc(docRef(userId, "movements", id), {
        productId,
        productName,
        type,
        qty,
        note,
        date: new Date().toISOString(),
      });
    },
    [userId],
  );

  /* ── Categories ─────────────────────────────────────────── */
  const addCategory = useCallback(
    async (cat) => {
      if (!userId) return;
      const id = "c_" + uid_local();
      await setDoc(docRef(userId, "categories", id), { ...cat, id });
      toast("Categoría creada ✓");
      return id;
    },
    [userId, toast],
  );

  const updateCategory = useCallback(
    async (id, data) => {
      if (!userId) return;
      const cur = categories.find((c) => c.id === id);
      await setDoc(docRef(userId, "categories", id), { ...cur, ...data });
      toast("Categoría actualizada ✓");
    },
    [userId, categories, toast],
  );

  const deleteCategory = useCallback(
    async (id) => {
      if (!userId) return;
      const batch = writeBatch(db);
      batch.delete(docRef(userId, "categories", id));
      products
        .filter((p) => p.categoryId === id)
        .forEach((p) => batch.delete(docRef(userId, "products", p.id)));
      await batch.commit();
      toast("Categoría eliminada");
    },
    [userId, products, toast],
  );

  /* ── Products ───────────────────────────────────────────── */
  const addProduct = useCallback(
    async (prod) => {
      if (!userId) return;
      const id = "p_" + uid_local();
      const newProd = {
        ...prod,
        id,
        imageUrl: null,
        imagePath: null,
      };
      await setDoc(docRef(userId, "products", id), newProd);
      if (newProd.quantity > 0) {
        await _logMovement(
          id,
          newProd.name,
          "creacion",
          newProd.quantity,
          "Stock inicial",
        );
      }
      toast("Producto agregado ✓");
    },
    [userId, toast, _logMovement],
  );

  const updateProduct = useCallback(
    async (id, data) => {
      if (!userId) return;
      const prev = products.find((p) => p.id === id);
      const updated = {
        ...prev,
        ...data,
        imageUrl: null,
        imagePath: null,
      };
      await setDoc(docRef(userId, "products", id), updated);

      if (prev && prev.quantity !== updated.quantity) {
        const diff = updated.quantity - prev.quantity;
        await _logMovement(
          id,
          updated.name,
          diff > 0 ? "entrada" : "salida",
          Math.abs(diff),
          "Actualización manual",
        );
      }
      toast("Producto actualizado ✓");
    },
    [userId, products, toast, _logMovement],
  );

  const deleteProduct = useCallback(
    async (id) => {
      if (!userId) return;
      const prod = products.find((p) => p.id === id);
      await deleteDoc(docRef(userId, "products", id));
      if (prod?.quantity > 0) {
        await _logMovement(
          id,
          prod.name,
          "eliminacion",
          prod.quantity,
          "Producto eliminado",
        );
      }
      toast("Producto eliminado");
    },
    [userId, products, toast, _logMovement],
  );

  /* ── Movimiento manual ──────────────────────────────────── */
  const registerMovement = useCallback(
    async (productId, type, qty, note = "") => {
      if (!userId) return;
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;

      let newQty = prod.quantity;
      if (type === "entrada") newQty += qty;
      if (type === "salida") newQty = Math.max(0, newQty - qty);
      if (type === "ajuste") newQty = qty;

      const logQty = type === "ajuste" ? Math.abs(newQty - prod.quantity) : qty;
      await setDoc(docRef(userId, "products", productId), {
        ...prod,
        quantity: newQty,
      });
      await _logMovement(productId, prod.name, type, logQty, note);

      toast(
        type === "entrada"
          ? "Entrada registrada ✓"
          : type === "salida"
            ? "Salida registrada ✓"
            : "Ajuste registrado ✓",
      );
    },
    [userId, products, _logMovement, toast],
  );

  const clearMovements = useCallback(async () => {
    if (!userId) return;
    const batch = writeBatch(db);
    movements.forEach((m) => batch.delete(docRef(userId, "movements", m.id)));
    await batch.commit();
    toast("Historial limpiado");
  }, [userId, movements, toast]);

  /* ── CSV export ─────────────────────────────────────────── */
  const exportCSV = useCallback(() => {
    const header =
      "Nombre,Categoría,P.Compra,P.Venta,Cantidad,Unidad,Inversión,Ingresos,Ganancia,Stock mín.,Estado\n";
    const rows = products
      .map((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        const purchasePrice = p.purchasePrice || 0;
        const inversion = purchasePrice * p.quantity;
        const ingresos = p.price * p.quantity;
        return [
          `"${p.name}"`,
          `"${cat?.name || ""}"`,
          purchasePrice,
          p.price,
          p.quantity,
          `"${p.unit}"`,
          inversion,
          ingresos,
          ingresos - inversion,
          p.minStock,
          `"${getStatus(p)}"`,
        ].join(",");
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventario.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exportado ✓");
  }, [products, categories, toast]);

  return (
    <AppContext.Provider
      value={{
        categories,
        products,
        movements,
        theme,
        setTheme,
        toasts,
        toast,
        ready,

        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        registerMovement,
        clearMovements,
        getStatus,
        exportCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
};