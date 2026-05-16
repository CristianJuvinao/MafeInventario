// src/pages/ImportPage.jsx
import { useImport }     from '../hooks/useImport';
import { ImportStepper } from '../components/atoms/ImportStepper';
import { ImportUpload }  from '../components/molecules/ImportUpload';
import { ImportMapper }  from '../components/molecules/ImportMapper';
import { ImportPreview } from '../components/molecules/ImportPreview';
import { ImportDone }    from '../components/molecules/ImportDone';

export default function ImportPage() {
  const ctx = useImport();

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Importar Excel
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Sube un archivo .xlsx, .xls o .csv para agregar productos en masa.
        </p>
      </div>

      {/* Stepper */}
      <ImportStepper step={ctx.step} />

      {ctx.step === 'upload'  && <ImportUpload  {...ctx} />}
      {ctx.step === 'map'     && <ImportMapper   {...ctx} onBack={ctx.reset} onNext={ctx.buildPreview} />}
      {ctx.step === 'preview' && <ImportPreview  {...ctx} onBack={() => ctx.setStep('map')} onImport={ctx.doImport} />}
      {ctx.step === 'done'    && <ImportDone     imported={ctx.imported} onReset={ctx.reset} />}
    </div>
  );
}