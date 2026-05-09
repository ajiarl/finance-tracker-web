export const IMPORT_FIELDS = [
  {
    key: 'date',
    label: 'Tanggal Transaksi',
    required: true,
    hint: 'Kolom yang berisi tanggal terjadinya transaksi.',
  },
  {
    key: 'amount',
    label: 'Nominal Transaksi',
    required: true,
    hint: 'Kolom yang berisi nilai transaksi (angka positif atau negatif).',
  },
  {
    key: 'type',
    label: 'Tipe Transaksi',
    required: false,
    hint: 'Pemasukan / Pengeluaran / Transfer. Kosongkan untuk deteksi otomatis dari tanda minus/plus.',
  },
  {
    key: 'description',
    label: 'Keterangan',
    required: false,
    hint: 'Nama atau deskripsi singkat untuk transaksi tersebut.',
  },
  {
    key: 'category',
    label: 'Kategori',
    required: false,
    hint: 'Nama kategori. Akan otomatis dicocokkan, atau dilewati jika tidak ditemukan.',
  },
  {
    key: 'notes',
    label: 'Catatan Tambahan',
    required: false,
    hint: 'Teks referensi ekstra atau memo.',
  },
];

export const REQUIRED_FIELDS = IMPORT_FIELDS.filter((f) => f.required).map((f) => f.key);
