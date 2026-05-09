import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Minus, AlertCircle, CheckCircle2, ChevronRight, XCircle, ArrowLeft } from 'lucide-react';
import { useExecuteImport } from '../../hooks/useExecuteImport';
import { useAccounts } from '../../hooks/useAccounts';
import { IMPORT_FIELDS } from '../../config/importFields';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export default function StepReview({ importSession, onReset, onBack }) {
  const navigate = useNavigate();
  const mutation = useExecuteImport();
  const { data: accounts = [] } = useAccounts();
  const [progress, setProgress] = useState(0);

  const selectedAccount = accounts.find((a) => String(a.id) === String(importSession.accountId));

  const viewState =
    mutation.isPending ? 'loading' :
    mutation.isSuccess ? 'success' :
    mutation.isError ? 'error' :
    'idle';

  // 1. Lock browser navigation during pending state
  useEffect(() => {
    if (!mutation.isPending) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [mutation.isPending]);

  // 2. Progress Heuristic Animation
  useEffect(() => {
    if (viewState === 'loading') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          return prev + Math.floor(Math.random() * 10) + 2;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (viewState === 'success') {
      setProgress(100);
    }
  }, [viewState]);

  const handleExecute = () => {
    mutation.mutate({
      importId: importSession.importId,
      accountId: importSession.accountId,
      columnMappings: importSession.columnMappings,
      dateFormat: importSession.dateFormat,
    });
  };

  const formatIDR = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount ?? 0);

  if (viewState === 'success') {
    const { success_count, errors = [] } = mutation.data;
    return (
      <div className="bg-green-50 border-2 border-black p-8 shadow-[5px_5px_0px_0px_#000]">
        <div className="flex items-center gap-4 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
          <h2 className="text-2xl font-black uppercase text-green-700">Import Berhasil!</h2>
        </div>

        <ul className="space-y-3 font-bold mb-6">
          <li className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            {success_count} transaksi berhasil diimpor
          </li>
          {errors.length > 0 && (
            <li className="flex items-center gap-3 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              {errors.length} baris dilewati (error)
            </li>
          )}
        </ul>

        <p className="font-medium text-gray-700 mb-8 border-l-4 border-black pl-4">
          Saldo untuk akun <strong>{selectedAccount?.name}</strong> telah diperbarui.
        </p>

        {errors.length > 0 && (
          <details className="mb-8 border-2 border-black bg-white group">
            <summary className="font-bold p-3 cursor-pointer select-none bg-yellow-100 border-b-2 border-transparent group-open:border-black flex justify-between items-center">
              Lihat Detail Baris Error
              <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="p-4 max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-left font-mono">
                <tbody>
                  {errors.map((e, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-4 font-bold whitespace-nowrap">Baris {e.row}</td>
                      <td className="py-2 text-red-600">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-black">
          <Button onClick={() => navigate('/transactions')} size="lg" className="flex-1 justify-center">
            Lihat Transaksi
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="secondary" onClick={onReset} size="lg" className="flex-1 justify-center">
            Import File Lainnya
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="bg-red-50 border-2 border-red-600 p-8 shadow-[5px_5px_0px_0px_theme(colors.red.600)]">
        <div className="flex items-center gap-4 mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
          <h2 className="text-2xl font-black uppercase text-red-700">Import Gagal</h2>
        </div>

        <div className="bg-white border-2 border-red-600 text-red-700 p-4 font-mono text-sm mb-8">
          {mutation.error?.response?.data?.error || mutation.error?.message || 'Terjadi kesalahan internal server.'}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-red-600">
          <Button variant="secondary" onClick={onBack} size="lg" className="flex-1 justify-center border-red-600 text-red-700 hover:bg-red-100">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Langkah 2
          </Button>
          <Button onClick={() => mutation.reset()} size="lg" className="flex-1 justify-center bg-red-600 text-white hover:bg-red-700 shadow-[4px_4px_0px_0px_#000]">
            Coba Lagi Eksekusi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Confidence Block */}
      <div className="bg-yellow-50 border-2 border-black p-8 shadow-[5px_5px_0px_0px_#000]">
        <h3 className="text-xl font-black uppercase mb-4 pb-2 border-b-2 border-black flex items-center gap-3">
          📋 Ringkasan Import
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-4 font-medium mb-6">
          <span className="text-gray-500">File</span>
          <span className="font-bold">{importSession.filename}</span>

          <span className="text-gray-500">Total Baris</span>
          <span className="font-bold">{importSession.rowsTotal} transaksi</span>

          <span className="text-gray-500">Akun Tujuan</span>
          <span className="font-bold bg-white border border-black px-2 py-1 inline-block w-fit">
            🏦 {selectedAccount?.name || 'Loading...'} {selectedAccount ? `(${formatIDR(selectedAccount.balance)})` : ''}
          </span>
        </div>

        <div>
          <p className="text-sm font-black uppercase text-gray-500 mb-3">Kolom Terpetakan:</p>
          <ul className="space-y-2 text-sm font-bold bg-white border-2 border-black p-4">
            {IMPORT_FIELDS.map((field) => {
              const mappedTo = importSession.columnMappings?.[field.key];
              const isMapped = !!mappedTo;
              return (
                <li key={field.key} className="flex items-center">
                  <span className="w-6 shrink-0 text-center">
                    {isMapped ? <Check className="w-4 h-4 text-green-600 inline" /> : <Minus className="w-4 h-4 text-gray-400 inline" />}
                  </span>
                  <span className="w-32 text-gray-600">{field.label}</span>
                  {isMapped ? (
                    <span className="text-black bg-gray-100 px-2 border border-gray-200">→ {mappedTo}</span>
                  ) : (
                    <span className="text-gray-400 font-medium">
                      — {field.key === 'type' ? '(auto-detect)' : '(diabaikan)'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Execute Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          disabled={viewState === 'loading'}
          onClick={onBack}
          className="px-6 py-4 bg-white font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <button
          type="button"
          disabled={viewState === 'loading'}
          onClick={handleExecute}
          className={cn(
            'flex-1 flex flex-col items-center justify-center p-4 min-h-[80px]',
            'font-black border-2 border-black transition-all',
            viewState === 'idle'
              ? 'bg-black text-white shadow-[6px_6px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none'
              : 'bg-black text-white opacity-90 shadow-none translate-x-[6px] translate-y-[6px]'
          )}
        >
          {viewState === 'idle' ? (
            <>
              <span className="text-xl tracking-wider uppercase">Lakukakan Import</span>
              <span className="text-sm font-medium text-gray-300 normal-case mt-1">
                Import {importSession.rowsTotal} transaksi ke {selectedAccount?.name}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center w-full max-w-sm">
              <span className="text-lg tracking-wider flex items-center gap-3">
                ⏳ Memproses {importSession.rowsTotal} baris...
              </span>
              <span className="text-xs font-medium text-gray-400 mt-1">Mohon jangan tutup halaman ini</span>
              <div className="w-full h-1 bg-gray-800 mt-3 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
