export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

export const storage = {
  get: (k, def) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};

/** Returns 'ok' | 'bajo' | 'agotado' */
export const getStatus = (p) => {
  if (p.quantity === 0) return 'agotado';
  if (p.quantity <= p.minStock) return 'bajo';
  return 'ok';
};