import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowDown, XCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUploadCsv } from '../../hooks/useUploadCsv';
import Button from '../ui/Button';

export default function StepUpload({ updateSession, onAdvance }) {
  const [file, setFile] = useState(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [clientError, setClientError] = useState(null);

  const uploadMutation = useUploadCsv();

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDropAccepted: ([acceptedFile]) => {
      setFile(acceptedFile);
      setClientError(null);
    },
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      setClientError(
        code === 'file-too-large'
          ? 'File exceeds 5MB limit.'
          : 'Only CSV files are accepted.'
      );
      setFile(null);
    },
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setClientError(null);
    uploadMutation.reset();
  };

  const handleSubmit = () => {
    if (!file) {
      setClientError('Please select a CSV file first.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setClientError('File is too large.');
      return;
    }

    uploadMutation.mutate(
      { file, hasHeader },
      {
        onSuccess: (serverData) => {
          updateSession({
            importId: serverData.import_id,
            filename: serverData.filename,
            rowsTotal: serverData.rows_total,
            headers: serverData.headers,
            preview: serverData.preview,
          });
          onAdvance();
        },
      }
    );
  };

  const displayError =
    clientError ?? uploadMutation.error?.response?.data?.message ?? null;

  const dropzoneClasses = cn(
    "border-2 border-black p-10 cursor-pointer transition-none",
    "flex flex-col items-center justify-center gap-4 min-h-[220px]",
    !isDragActive && !isDragReject && !file && "bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-gray-50 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5",
    isDragActive && !isDragReject && "bg-black text-white shadow-none",
    isDragReject && "bg-white border-red-600 shadow-[4px_4px_0px_0px_theme(colors.red.600)]",
    file && "bg-green-50 shadow-[4px_4px_0px_0px_#000]"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Upload CSV</h2>
          <p className="text-gray-600">Pilih file transaksi untuk diimpor.</p>
        </div>
      </div>

      <div {...getRootProps()} className={dropzoneClasses}>
        <input {...getInputProps()} />
        
        {file ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div className="flex items-center gap-2 bg-white border-2 border-black p-2 px-4 shadow-[2px_2px_0px_0px_#000]">
              <span className="font-bold truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-semibold mt-2">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : isDragActive && !isDragReject ? (
          <>
            <ArrowDown className="w-12 h-12" />
            <p className="font-bold text-lg">Lepaskan untuk upload</p>
          </>
        ) : isDragReject ? (
          <>
            <XCircle className="w-12 h-12 text-red-600" />
            <p className="font-bold text-lg text-red-600">Hanya file .csv di bawah 5MB</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-12 h-12" />
            <p className="font-bold text-lg text-center">
              Tarik file CSV ke sini, atau klik untuk memilih
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Maks. ukuran 5MB
            </p>
          </>
        )}
      </div>

      {displayError && (
        <div className="border-2 border-red-600 bg-red-50 p-3 shadow-[3px_3px_0px_0px_theme(colors.red.600)] flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-bold text-red-700 text-sm">{displayError}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasHeader"
          checked={hasHeader}
          onChange={(e) => setHasHeader(e.target.checked)}
          className="w-5 h-5 border-2 border-black rounded-none checked:bg-black focus:ring-0 cursor-pointer"
        />
        <label htmlFor="hasHeader" className="font-bold cursor-pointer select-none">
          File CSV memiliki baris header (Nama Kolom)
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t-2 border-black">
        <Button
          onClick={handleSubmit}
          disabled={!file}
          loading={uploadMutation.isPending}
          size="lg"
        >
          Lanjut ke Pemetaan Kolom
        </Button>
      </div>
    </div>
  );
}
