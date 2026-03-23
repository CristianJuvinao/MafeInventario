// src/hooks/useImport.js
import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { UNITS, CAT_COLORS } from '../utils/constants';
import * as XLSX from 'xlsx';

/* ─── Campos destino ─────────────────────────────────────── */
export const DEST_FIELDS = [
  { key: 'name',          label: 'Nombre',       required: true  },
  { key: 'purchasePrice', label: 'Precio Compra', required: false },
  { key: 'price',         label: 'Precio Venta',  required: true  },
  { key: 'quantity',      label: 'Cantidad',      required: true  },
  { key: 'category',      label: 'Categoría',     required: false },
  { key: 'unit',          label: 'Unidad',        required: false },
  { key: 'minStock',      label: 'Stock Mínimo',  required: false },
  { key: '__skip__',      label: '— Ignorar —',   required: false },
];

/* ─── Autodetección de columnas ──────────────────────────── */
const AUTOMAP = {
  name:          ['nombre', 'producto', 'name', 'item', 'descripcion', 'description'],
  purchasePrice: ['precio compra', 'p. compra', 'costo', 'cost', 'purchase', 'compra'],
  price:         ['precio venta', 'precio', 'p. venta', 'price', 'venta', 'sale'],
  quantity:      ['cantidad', 'qty', 'quantity', 'stock', 'existencias', 'unidades'],
  category:      ['categoria', 'categoría', 'category', 'tipo', 'type', 'grupo'],
  unit:          ['unidad', 'unit', 'medida', 'um'],
  minStock:      ['stock minimo', 'stock mínimo', 'min stock', 'minstock', 'minimo', 'min'],
};

function autoDetect(headers) {
  const mapping = {};
  const used    = new Set();
  headers.forEach((h, i) => {
    const norm = h.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(AUTOMAP)) {
      if (!used.has(field) && aliases.some(a => norm.includes(a))) {
        mapping[i] = field;
        used.add(field);
        break;
      }
    }
    if (mapping[i] === undefined) mapping[i] = '__skip__';
  });
  return mapping;
}

/* ─── Utilidades ─────────────────────────────────────────── */
const toNum = v => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

const normalizeUnit = raw => {
  if (!raw) return 'unidad';
  const r = String(raw).toLowerCase().trim();
  return UNITS.find(u => u === r) || 'unidad';
};

/* ═══════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════ */
export function useImport() {
  const { categories, addProduct, addCategory, toast } = useApp();

  const [step,      setStep]      = useState('upload');
  const [dragging,  setDragging]  = useState(false);
  const [fileName,  setFileName]  = useState('');
  const [headers,   setHeaders]   = useState([]);
  const [rows,      setRows]      = useState([]);
  const [mapping,   setMapping]   = useState({});
  const [preview,   setPreview]   = useState([]);
  const [errors,    setErrors]    = useState([]);
  const [imported,  setImported]  = useState(0);
  const [importing, setImporting] = useState(false);

  const inputRef = useRef();

  /* ── Leer archivo ──────────────────────────────────────── */
  const readFile = useCallback(file => {
    if (!file) return;
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast('Solo se aceptan archivos .xlsx, .xls o .csv', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const data      = new Uint8Array(e.target.result);
      const wb        = XLSX.read(data, { type: 'array' });
      const ws        = wb.Sheets[wb.SheetNames[0]];
      const raw       = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (raw.length < 2) {
        toast('El archivo está vacío o no tiene filas de datos', 'error');
        return;
      }

      const hdrs      = raw[0].map(h => String(h).trim());
      const dataRows  = raw.slice(1).filter(r => r.some(c => c !== ''));

      setHeaders(hdrs);
      setRows(dataRows);
      setMapping(autoDetect(hdrs));
      setStep('map');
    };
    reader.readAsArrayBuffer(file);
  }, [toast]);

  /* ── Drag & Drop ───────────────────────────────────────── */
  const onDragOver  = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = e => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); };

  /* ── Construir preview ─────────────────────────────────── */
  const buildPreview = () => {
    const errs  = [];
    const built = rows.map((row, ri) => {
      const obj = {};
      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field !== '__skip__') obj[field] = row[colIdx];
      });

      if (!obj.name || String(obj.name).trim() === '') {
        errs.push(`Fila ${ri + 2}: falta el Nombre`);
        obj.__error__ = true;
      }
      if (!obj.price || toNum(obj.price) === 0) {
        errs.push(`Fila ${ri + 2}: falta el Precio Venta`);
        obj.__error__ = true;
      }
      if (obj.quantity === '' || obj.quantity === undefined) {
        errs.push(`Fila ${ri + 2}: falta la Cantidad`);
        obj.__error__ = true;
      }

      return {
        ...obj,
        name:          String(obj.name || '').trim(),
        purchasePrice: toNum(obj.purchasePrice),
        price:         toNum(obj.price),
        quantity:      toNum(obj.quantity),
        minStock:      toNum(obj.minStock) || 5,
        unit:          normalizeUnit(obj.unit),
        category:      String(obj.category || '').trim(),
        __error__:     obj.__error__ || false,
      };
    });

    setErrors(errs);
    setPreview(built);
    setStep('preview');
  };

  /* ── Importar ──────────────────────────────────────────── */
  const doImport = async () => {
    setImporting(true);
    let count = 0;

    const catCache = {};
    categories.forEach(c => { catCache[c.name.toLowerCase()] = c.id; });

    const DEFAULT_CAT_NAME = 'sin categoría';
    if (!catCache[DEFAULT_CAT_NAME]) {
      const newId = await addCategory({ name: 'Sin categoría', color: '#6b7280', icon: 'package' });
      catCache[DEFAULT_CAT_NAME] = newId;
    }
    const defaultCategoryId = catCache[DEFAULT_CAT_NAME];

    for (const row of preview.filter(r => !r.__error__)) {
      let categoryId = defaultCategoryId;
      if (row.category) {
        const key = row.category.toLowerCase();
        if (catCache[key]) {
          categoryId = catCache[key];
        } else {
          const color  = CAT_COLORS[Object.keys(catCache).length % CAT_COLORS.length];
          const newId  = await addCategory({ name: row.category, color, icon: 'package' });
          catCache[key] = newId;
          categoryId   = newId;
        }
      }

      addProduct({
        name:          row.name,
        categoryId,
        purchasePrice: row.purchasePrice,
        price:         row.price,
        quantity:      row.quantity,
        unit:          row.unit,
        minStock:      row.minStock,
      });

      count++;
      if (count % 20 === 0) await new Promise(r => setTimeout(r, 10));
    }

    setImported(count);
    setImporting(false);
    setStep('done');
  };

  /* ── Reset ─────────────────────────────────────────────── */
  const reset = () => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setPreview([]);
    setErrors([]);
    setImported(0);
  };

  /* ── Helpers derivados ─────────────────────────────────── */
  const missingRequired = DEST_FIELDS
    .filter(f => f.required && !Object.values(mapping).includes(f.key))
    .map(f => f.label);

  const validRows = preview.filter(r => !r.__error__);

  return {
    // estado
    step, setStep, dragging, fileName, headers, rows,
    mapping, setMapping,
    preview, errors, imported, importing,
    inputRef,
    // derivados
    missingRequired, validRows,
    // acciones
    readFile, onDragOver, onDragLeave, onDrop,
    buildPreview, doImport, reset,
  };
}
