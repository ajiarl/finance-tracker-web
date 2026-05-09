import { useState, useEffect } from 'react';
import { ChevronDown, Info, AlertTriangle } from 'lucide-react';
import { IMPORT_FIELDS, REQUIRED_FIELDS } from '../../config/importFields';
import { useAccounts } from '../../hooks/useAccounts';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export default function StepMapColumns({ importSession, updateSession, onAdvance, onBack }) {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();

  const [accountId, setAccountId] = useState(importSession.accountId || '');
  const [mappings, setMappings] = useState(
    importSession.columnMappings && Object.keys(importSession.columnMappings).length > 0
      ? importSession.columnMappings
      : {
          date: '',
          amount: '',
          type: '',
          description: '',
          category: '',
          notes: '',
        }
  );
  const [dateFormat, setDateFormat] = useState(importSession.dateFormat || 'd/m/Y');
  const [highlightedColumn, setHighlighted] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const headers = importSession.headers || [];
  const preview = importSession.preview || [];

  // 🪄 Auto-Mapping Logic
  useEffect(() => {
    if (headers.length > 0 && (!importSession.columnMappings || Object.keys(importSession.columnMappings).length === 0)) {
      const autoMappings = { ...mappings };
      let hasChanges = false;

      headers.forEach((header) => {
        const h = header.toLowerCase();

        if (!autoMappings.date && (h.includes('tgl') || h.includes('tanggal') || h.includes('waktu') || h.includes('date') || h.includes('bulan'))) {
          autoMappings.date = header;
          hasChanges = true;
        } else if (!autoMappings.amount && (h.includes('nominal') || h.includes('jumlah') || h.includes('kredit') || h.includes('debit') || h.includes('amount') || h.includes('total') || h.includes('saldo'))) {
          autoMappings.amount = header;
          hasChanges = true;
        } else if (!autoMappings.description && (h.includes('ket') || h.includes('keterangan') || h.includes('deskripsi') || h.includes('desc') || h.includes('nama') || h.includes('rincian'))) {
          autoMappings.description = header;
          hasChanges = true;
        } else if (!autoMappings.category && (h.includes('kategori') || h.includes('category') || h.includes('jenis') || h.includes('tipe') || h.includes('group'))) {
          autoMappings.category = header;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setMappings(autoMappings);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  const handleMappingChange = (fieldKey, headerValue) => {
    setMappings((prev) => ({ ...prev, [fieldKey]: headerValue }));
    if (headerValue) {
      setHighlighted(headerValue);
    }
    setValidationErrors((prev) => prev.filter((e) => e.field !== fieldKey && e.field !== 'global'));
  };

  const validate = () => {
    const errors = [];

    if (!accountId) {
      errors.push({ field: 'account', message: 'Silakan pilih Akun Tujuan terlebih dahulu.' });
    }

    for (const key of REQUIRED_FIELDS) {
      if (!mappings[key]) {
        const field = IMPORT_FIELDS.find((f) => f.key === key);
        errors.push({ field: key, message: `Kolom "${field.label}" wajib diisi.` });
      }
    }

    // Duplicate mapping guard
    const mappedValues = Object.values(mappings).filter(Boolean);
    const hasDupes = mappedValues.length !== new Set(mappedValues).size;
    if (hasDupes) {
      errors.push({ field: 'global', message: 'Satu kolom CSV hanya boleh dipakai sekali.' });
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    updateSession({
      accountId: Number(accountId),
      columnMappings: mappings,
      dateFormat: dateFormat || null,
    });

    onAdvance();
  };

  const globalError = validationErrors.find((e) => e.field === 'global');
  const accountError = validationErrors.find((e) => e.field === 'account');

  return (
    <div className="w-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="w-full text-center mb-8">
        <h2 className="text-2xl font-black mb-2">Petakan Kolom</h2>
        <p className="text-gray-600 font-medium">Cocokkan kolom CSV dengan data transaksi Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT PANEL: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          {globalError && (
            <div className="border-2 border-red-600 bg-red-50 p-4 shadow-[4px_4px_0px_0px_theme(colors.red.600)] flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <span className="font-bold text-red-700">{globalError.message}</span>
            </div>
          )}

          {/* Account Selector */}
        <div className="bg-gray-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
          <label className="block font-black text-lg mb-4">Pilih Akun Tujuan</label>
          {isLoadingAccounts ? (
            <div className="h-12 bg-gray-200 animate-pulse border-2 border-black" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {accounts.map((acc) => {
                const isSelected = accountId === String(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setAccountId(String(acc.id));
                      setValidationErrors((prev) => prev.filter((e) => e.field !== 'account'));
                    }}
                    className={cn(
                      'text-left font-bold border-2 border-black px-4 py-2 text-sm transition-all',
                      isSelected
                        ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                    )}
                  >
                    {acc.name}
                  </button>
                );
              })}
            </div>
          )}
          {accountError && (
            <p className="mt-2 text-red-600 font-bold text-sm">{accountError.message}</p>
          )}
        </div>

        {/* Mapping Rows */}
        <div className="space-y-5">
          {IMPORT_FIELDS.filter((f) => f.required || showAdvanced).map((field) => {
            const error = validationErrors.find((e) => e.field === field.key);
            const isMapped = !!mappings[field.key];
            const hasError = !!error;

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="font-bold">{field.label}</label>
                    {field.required && (
                      <span className="bg-[#FAFF00] border-2 border-black text-[10px] px-2 py-0.5 font-black uppercase tracking-wide">
                        Wajib
                      </span>
                    )}
                  </div>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-black cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 bg-black text-white text-xs p-2 font-medium z-10">
                      {field.hint}
                    </div>
                  </div>
                </div>

                <div className="relative mb-2">
                  <select
                    value={mappings[field.key]}
                    onFocus={() => {
                      if (mappings[field.key]) setHighlighted(mappings[field.key]);
                    }}
                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    className={cn(
                      'w-full appearance-none border-2 p-3 font-bold bg-white cursor-pointer transition-all focus:outline-none',
                      hasError
                        ? 'border-red-600 shadow-[4px_4px_0px_0px_theme(colors.red.600)]'
                        : isMapped
                        ? 'border-black shadow-[4px_4px_0px_0px_#000]'
                        : 'border-black shadow-[4px_4px_0px_0px_#000]',
                      'focus:shadow-[2px_2px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px]'
                    )}
                  >
                    <option value="">-- Jangan di-map (Abaikan) --</option>
                    {headers.map((h, i) => (
                      <option key={`${h}-${i}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5" />
                </div>
                {hasError && <p className="text-red-600 font-bold text-sm mt-1">{error.message}</p>}
              </div>
            );
          })}

          {/* Toggle Advanced Options */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm font-bold text-black underline hover:text-gray-600 mt-2"
          >
            {showAdvanced ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan'}
          </button>
        </div>

        {/* Date Format Field (Conditional) */}
        {mappings.date && (
          <div className="bg-[#FAFF00] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
            <label className="block font-black mb-2">Format Tanggal (Opsional)</label>
            <p className="text-sm font-medium mb-3">
              Format tanggal PHP yang sesuai dengan CSV Anda (Contoh: d/m/Y untuk 17/04/2026).
            </p>
            <input
              type="text"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full border-2 border-black p-2 font-bold mb-3 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000]"
              placeholder="e.g. d/m/Y"
            />
            <div className="flex flex-wrap gap-2">
              {['d/m/Y', 'm/d/Y', 'Y-m-d'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setDateFormat(fmt)}
                  className={cn(
                    'text-xs font-bold border-2 border-black px-3 py-1 transition-all',
                    dateFormat === fmt
                      ? 'bg-black text-white shadow-none translate-x-[1px] translate-y-[1px]'
                      : 'bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t-2 border-black mt-4">
          <Button variant="secondary" onClick={onBack}>
            Kembali
          </Button>
          <Button onClick={handleNext} size="lg">
            Konfirmasi Mapping
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: Live Preview Table */}
      <div className="lg:col-span-7 lg:sticky lg:top-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-black text-white p-4 font-bold flex justify-between items-center">
          <span>Live Data Preview</span>
          <span className="text-xs bg-white text-black px-2 py-1 rounded-sm">
            {preview.length} rows shown
          </span>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left border-collapse min-w-max whitespace-nowrap">
            <thead className="bg-gray-100 border-b-2 border-black">
              <tr>
                {headers.map((h, i) => {
                  const isHigh = highlightedColumn === h;
                  return (
                    <th
                      key={i}
                      className={cn(
                        'px-4 py-3 font-black border-r-2 border-black last:border-r-0 transition-colors',
                        isHigh ? 'bg-black text-white' : ''
                      )}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, rIndex) => (
                <tr key={rIndex} className="border-b border-gray-200 last:border-b-0">
                  {headers.map((h, cIndex) => {
                    const isHigh = highlightedColumn === h;
                    return (
                      <td
                        key={cIndex}
                        className={cn(
                          'px-4 py-3 border-r-2 border-gray-200 last:border-r-0 font-medium transition-colors',
                          isHigh ? 'bg-gray-800 text-white border-black' : ''
                        )}
                      >
                        {row[h]}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {preview.length === 0 && (
                <tr>
                  <td colSpan={headers.length || 1} className="p-6 text-center text-gray-500 font-bold">
                    Pratinjau data tidak tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}
