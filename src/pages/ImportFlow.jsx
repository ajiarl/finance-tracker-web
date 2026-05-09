import { useState } from 'react';
import StepUpload from '../components/import/StepUpload';
import StepMapColumns from '../components/import/StepMapColumns';
import StepReview from '../components/import/StepReview';
import { cn } from '../lib/utils';

export default function ImportFlow() {
  const [step, setStep] = useState(1);

  const [importSession, setImportSession] = useState({
    importId: null,
    filename: null,
    rowsTotal: null,
    headers: [],
    preview: [],

    accountId: null,
    columnMappings: {},
    dateFormat: null,

    result: null,
  });

  const updateSession = (patch) =>
    setImportSession((prev) => ({ ...prev, ...patch }));

  const handleAdvance = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setImportSession({
      importId: null,
      filename: '',
      headers: [],
      preview: [],
      rowsTotal: 0,
      accountId: null,
      columnMappings: null,
      dateFormat: null,
    });
    setStep(1);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6">Import Transaksi (CSV)</h1>
      
      {/* Simple Step Indicator */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "flex-1 p-3 border-2 border-black font-bold text-center transition-all",
              step === s
                ? "bg-[#FAFF00] shadow-[4px_4px_0px_0px_#000]"
                : step > s
                ? "bg-green-300 shadow-[2px_2px_0px_0px_#000]"
                : "bg-white opacity-50 border-dashed"
            )}
          >
            Langkah {s}
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
        {step === 1 && (
          <StepUpload updateSession={updateSession} onAdvance={handleAdvance} />
        )}
        {step === 2 && (
          <StepMapColumns
            importSession={importSession}
            updateSession={updateSession}
            onAdvance={handleAdvance}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <StepReview
            importSession={importSession}
            onBack={handleBack}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
