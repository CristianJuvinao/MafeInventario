// src/pages/ImportPage.jsx
import { useImport }      from '../hooks/useImport';
import { ImportStepper }  from '../components/atoms/ImportStepper';
import { ImportUpload }   from '../components/molecules/ImportUpload';
import { ImportMapper }   from '../components/molecules/ImportMapper';
import { ImportPreview }  from '../components/molecules/ImportPreview';
import { ImportDone }     from '../components/molecules/ImportDone';

export default function ImportPage() {
  const ctx = useImport();

  return (
    <div className="page">
      <ImportStepper step={ctx.step} />

      {ctx.step === 'upload' && (
        <ImportUpload
          dragging={ctx.dragging}
          inputRef={ctx.inputRef}
          onDragOver={ctx.onDragOver}
          onDragLeave={ctx.onDragLeave}
          onDrop={ctx.onDrop}
          readFile={ctx.readFile}
        />
      )}

      {ctx.step === 'map' && (
        <ImportMapper
          fileName={ctx.fileName}
          rows={ctx.rows}
          headers={ctx.headers}
          mapping={ctx.mapping}
          setMapping={ctx.setMapping}
          missingRequired={ctx.missingRequired}
          onBack={ctx.reset}
          onNext={ctx.buildPreview}
        />
      )}

      {ctx.step === 'preview' && (
        <ImportPreview
          preview={ctx.preview}
          errors={ctx.errors}
          validRows={ctx.validRows}
          importing={ctx.importing}
          onBack={() => ctx.setStep('map')}
          onImport={ctx.doImport}
        />
      )}

      {ctx.step === 'done' && (
        <ImportDone
          imported={ctx.imported}
          onReset={ctx.reset}
        />
      )}
    </div>
  );
}
