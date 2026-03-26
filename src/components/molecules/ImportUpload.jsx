// src/components/molecules/ImportUpload.jsx
import { Upload, FileSpreadsheet, Download, Info } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ImportUpload({
  dragging,
  inputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  readFile,
}) {
  const { toast } = useApp();

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 16,
          padding: "56px 32px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging
            ? "var(--accent-dim, rgba(124,111,255,.08))"
            : "var(--surface)",
          transition: "all .2s",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--surface2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "var(--accent)",
          }}
        >
          <FileSpreadsheet size={32} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          Arrastra tu archivo aquí
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20 }}>
          o haz clic para seleccionarlo · .xlsx, .xls, .csv
        </div>
        <button className="btn btn-primary" type="button">
          <Upload size={14} /> Seleccionar archivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={(e) => readFile(e.target.files[0])}
        />
      </div>

      {/* Descargar plantilla */}
      <div className="card" style={{ marginTop: 20, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--green-dim)",
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Download size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              ¿No tienes el formato?
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>
              Descarga la plantilla oficial con los campos correctos y ejemplos
              incluidos.
            </div>
          </div>
          <a
            href="/plantilla_inventario.xlsx"
            download="Plantilla_Inventario.xlsx"
            className="btn btn-ghost"
            style={{ flexShrink: 0 }}
            onClick={() => {
              toast("Descargando plantilla…", "info");
            }}
          >
            Descargar plantilla
          </a>
        </div>
      </div>

      {/* Tip */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 10,
          background: "var(--blue-dim)",
          color: "var(--blue)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 13,
        }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Tu archivo puede tener las columnas en cualquier orden. En el
          siguiente paso podrás indicarle al sistema a qué campo corresponde
          cada columna.
        </span>
      </div>
    </div>
  );
}
