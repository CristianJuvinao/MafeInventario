export const UNITS = [
  'unidad','kg','g','litros','ml','caja',
  'paquete','docena','par','metro','cm','rollo'
];

export const CAT_COLORS = [
  '#7c6fff','#f87171','#4ade80','#fbbf24','#60a5fa',
  '#f472b6','#34d399','#fb923c','#a78bfa','#38bdf8',
];

// 🔑 ahora usamos keys de iconos
export const INIT_CATEGORIES = [
  { id: 'c1', name: 'Maquillaje', color: '#f472b6', icon: 'palette' },
  { id: 'c2', name: 'Bebidas', color: '#60a5fa', icon: 'cup' },
  { id: 'c3', name: 'Tecnología', color: '#7c6fff', icon: 'laptop' },
];

export const INIT_PRODUCTS = [
  { id: 'p1', name: 'Base Líquida HD',     categoryId: 'c1', purchasePrice: 18000, price: 28500,  quantity: 12, unit: 'unidad', minStock: 5 },
  { id: 'p2', name: 'Labial Mate Rojo',    categoryId: 'c1', purchasePrice:  9000, price: 15000,  quantity:  3, unit: 'unidad', minStock: 5 },
  { id: 'p3', name: 'Agua Mineral 500ml',  categoryId: 'c2', purchasePrice:  1500, price:  2500,  quantity: 48, unit: 'unidad', minStock: 10 },
  { id: 'p4', name: 'Jugo Naranja 1L',     categoryId: 'c2', purchasePrice:  3500, price:  5800,  quantity:  0, unit: 'unidad', minStock: 8 },
  { id: 'p5', name: 'Mouse Inalámbrico',   categoryId: 'c3', purchasePrice: 55000, price: 85000,  quantity:  7, unit: 'unidad', minStock: 3 },
  { id: 'p6', name: 'Teclado Mecánico',    categoryId: 'c3', purchasePrice:140000, price: 220000, quantity:  2, unit: 'unidad', minStock: 3 },
];