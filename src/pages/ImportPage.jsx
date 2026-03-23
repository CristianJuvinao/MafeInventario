import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { UNITS, CAT_COLORS } from '../utils/constants';
import * as XLSX from 'xlsx';

import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  Download,
  RefreshCw,
  Info,
} from 'lucide-react';

/* ─── Campos destino ─────────────────────────────────────── */
const DEST_FIELDS = [
  { key: 'name',          label: 'Nombre',         required: true  },
  { key: 'purchasePrice', label: 'Precio Compra',   required: false },
  { key: 'price',         label: 'Precio Venta',    required: true  },
  { key: 'quantity',      label: 'Cantidad',        required: true  },
  { key: 'category',      label: 'Categoría',       required: false },
  { key: 'unit',          label: 'Unidad',          required: false },
  { key: 'minStock',      label: 'Stock Mínimo',    required: false },
  { key: '__skip__',      label: '— Ignorar —',     required: false },
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
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString();

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
   IMPORT PAGE
═══════════════════════════════════════════════════════════ */
export default function ImportPage() {
  const { categories, addProduct, addCategory, toast } = useApp();

  // Pasos: 'upload' | 'map' | 'preview' | 'done'
  const [step,        setStep]        = useState('upload');
  const [dragging,    setDragging]    = useState(false);
  const [fileName,    setFileName]    = useState('');
  const [headers,     setHeaders]     = useState([]);
  const [rows,        setRows]        = useState([]);      // filas crudas (arrays)
  const [mapping,     setMapping]     = useState({});      // colIdx → fieldKey
  const [preview,     setPreview]     = useState([]);      // filas ya mapeadas
  const [errors,      setErrors]      = useState([]);      // errores de validación
  const [imported,    setImported]    = useState(0);
  const [importing,   setImporting]   = useState(false);

  const inputRef = useRef();

  /* ── Leer Excel ────────────────────────────────────────── */
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
      const data = new Uint8Array(e.target.result);
      const wb   = XLSX.read(data, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (raw.length < 2) {
        toast('El archivo está vacío o no tiene filas de datos', 'error');
        return;
      }

      const hdrs = raw[0].map(h => String(h).trim());
      const data_rows = raw.slice(1).filter(r => r.some(c => c !== ''));

      setHeaders(hdrs);
      setRows(data_rows);
      setMapping(autoDetect(hdrs));
      setStep('map');
    };
    reader.readAsArrayBuffer(file);
  }, [toast]);

  /* ── Drag & Drop ───────────────────────────────────────── */
  const onDrop = e => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files[0]);
  };

  /* ── Construir preview ─────────────────────────────────── */
  const buildPreview = () => {
    const errs  = [];
    const built = rows.map((row, ri) => {
      const obj = {};
      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field !== '__skip__') obj[field] = row[colIdx];
      });

      // Validaciones
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

    // Cache de categorías (para no duplicar)
    const catCache = {};
    categories.forEach(c => { catCache[c.name.toLowerCase()] = c.id; });

    // Garantizar que exista "Sin categoría" como fallback
    const DEFAULT_CAT_NAME = 'sin categoría';
    if (!catCache[DEFAULT_CAT_NAME]) {
      const newCatId = await addCategory({ name: 'Sin categoría', color: '#6b7280', icon: 'package' });
      catCache[DEFAULT_CAT_NAME] = newCatId;
    }
    const defaultCategoryId = catCache[DEFAULT_CAT_NAME];

    const validRows = preview.filter(r => !r.__error__);

    for (const row of validRows) {
      // Resolver categoryId
      let categoryId = defaultCategoryId;
      if (row.category) {
        const key = row.category.toLowerCase();
        if (catCache[key]) {
          categoryId = catCache[key];
        } else {
          // Crear categoría nueva y usar el ID real que retorna
          const color   = CAT_COLORS[Object.keys(catCache).length % CAT_COLORS.length];
          const newCatId = await addCategory({ name: row.category, color, icon: 'package' });
          catCache[key]  = newCatId;
          categoryId = newCatId;
        }
      }

      addProduct({
        name:          row.name,
        categoryId:    categoryId,
        purchasePrice: row.purchasePrice,
        price:         row.price,
        quantity:      row.quantity,
        unit:          row.unit,
        minStock:      row.minStock,
      });

      count++;
      // pequeño delay para no bloquear UI
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

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="page">

      {/* ── Stepper ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {['Subir archivo', 'Mapear columnas', 'Previsualizar', 'Listo'].map((s, i) => {
          const steps = ['upload', 'map', 'preview', 'done'];
          const cur   = steps.indexOf(step);
          const done  = i < cur;
          const active= i === cur;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done || active ? 'var(--accent)' : 'var(--surface2)',
                color:      done || active ? '#fff'          : 'var(--text3)',
              }}>
                {done ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? 'var(--text1)' : 'var(--text3)',
              }}>
                {s}
              </span>
              {i < 3 && <ChevronRight size={14} style={{ color: 'var(--text3)' }} />}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          PASO 1 — UPLOAD
      ══════════════════════════════════════════════════ */}
      {step === 'upload' && (
        <div>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}
            style={{
              border:        `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius:  16,
              padding:       '56px 32px',
              textAlign:     'center',
              cursor:        'pointer',
              background:    dragging ? 'var(--accent-dim, rgba(124,111,255,.08))' : 'var(--surface)',
              transition:    'all .2s',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent)',
            }}>
              <FileSpreadsheet size={32} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              Arrastra tu archivo aquí
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>
              o haz clic para seleccionarlo · .xlsx, .xls, .csv
            </div>
            <button className="btn btn-primary" type="button">
              <Upload size={14} /> Seleccionar archivo
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={e => readFile(e.target.files[0])}
            />
          </div>

          {/* Descargar plantilla */}
          <div className="card" style={{ marginTop: 20, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--green-dim)', color: 'var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Download size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>¿No tienes el formato?</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                  Descarga la plantilla oficial con los campos correctos y ejemplos incluidos.
                </div>
              </div>
              <a
                href="/plantilla_inventario.xlsx"
                download
                className="btn btn-ghost"
                style={{ flexShrink: 0 }}
                onClick={e => {
                  // Fallback: si no está en public, indicar al usuario
                  e.preventDefault();
                  toast('Descarga la plantilla desde los archivos entregados junto a este código', 'info');
                }}
              >
                Descargar plantilla
              </a>
            </div>
          </div>

          {/* Tip */}
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'var(--blue-dim)', color: 'var(--blue)',
            display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13,
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Tu archivo puede tener las columnas en cualquier orden. En el siguiente paso podrás
              indicarle al sistema a qué campo corresponde cada columna.
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PASO 2 — MAPEO DE COLUMNAS
      ══════════════════════════════════════════════════ */}
      {step === 'map' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Mapear columnas</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                Archivo: <strong>{fileName}</strong> · {rows.length} filas detectadas
              </div>
            </div>
            <button className="btn btn-ghost" onClick={reset}>
              <X size={14} /> Cambiar archivo
            </button>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
              Indicale al sistema qué contiene cada columna de tu archivo.
              Los campos marcados con <span style={{ color: 'var(--red)' }}>*</span> son obligatorios.
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {headers.map((h, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface2)',
                }}>
                  {/* Columna original */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>
                      Tu columna
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h || `Columna ${i + 1}`}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      Ej: {String(rows[0]?.[i] ?? '—')}
                    </div>
                  </div>

                  <ChevronRight size={16} style={{ color: 'var(--text3)' }} />

                  {/* Select destino */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>
                      Campo del sistema
                    </div>
                    <select
                      className="form-select"
                      style={{ width: '100%' }}
                      value={mapping[i] || '__skip__'}
                      onChange={e => setMapping(m => ({ ...m, [i]: e.target.value }))}
                    >
                      {DEST_FIELDS.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}{f.required ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Verificar campos obligatorios */}
            {(() => {
              const mappedFields = Object.values(mapping);
              const missing = DEST_FIELDS
                .filter(f => f.required && !mappedFields.includes(f.key))
                .map(f => f.label);
              return missing.length > 0 && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(248,113,113,0.12)', color: 'var(--red)',
                  fontSize: 13,
                }}>
                  <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Faltan campos obligatorios: <strong>{missing.join(', ')}</strong>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={reset}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={buildPreview}
                disabled={(() => {
                  const mf = Object.values(mapping);
                  return DEST_FIELDS.filter(f => f.required).some(f => !mf.includes(f.key));
                })()}
              >
                Previsualizar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PASO 3 — PREVIEW
      ══════════════════════════════════════════════════ */}
      {step === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Previsualización</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                {preview.filter(r => !r.__error__).length} productos válidos ·{' '}
                <span style={{ color: 'var(--red)' }}>{errors.length} errores</span>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => setStep('map')}>
              ← Volver
            </button>
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 6, fontSize: 13 }}>
                <AlertTriangle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Las siguientes filas serán ignoradas por tener datos incompletos:
              </div>
              {errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--red)', marginTop: 2 }}>• {e}</div>
              ))}
            </div>
          )}

          {/* Tabla preview */}
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>P. Compra</th>
                    <th>P. Venta</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Stock mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((r, i) => (
                    <tr key={i} style={r.__error__ ? { opacity: 0.45 } : {}}>
                      <td>
                        {r.__error__
                          ? <X size={14} style={{ color: 'var(--red)' }} />
                          : <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                        }
                      </td>
                      <td className="td-name">{r.name || '—'}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.category || '—'}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>
                        {r.purchasePrice ? `$${r.purchasePrice.toLocaleString('es-CO')}` : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {r.price ? `$${r.price.toLocaleString('es-CO')}` : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.quantity}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.unit}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>{r.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 50 && (
              <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text3)' }}>
                Mostrando 50 de {preview.length} filas en la previsualización.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={reset}>Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={doImport}
              disabled={importing || preview.filter(r => !r.__error__).length === 0}
            >
              {importing
                ? <><RefreshCw size={14} className="spin" /> Importando...</>
                : <>Importar {preview.filter(r => !r.__error__).length} productos</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PASO 4 — DONE
      ══════════════════════════════════════════════════ */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--green-dim)', color: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={40} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
            ¡Importación exitosa!
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 15, marginBottom: 32 }}>
            Se importaron <strong style={{ color: 'var(--green)' }}>{imported} productos</strong> a tu inventario.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={reset}>
              <Upload size={14} /> Importar otro archivo
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
            >
              Ver productos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}