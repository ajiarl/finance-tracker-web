export const ACCOUNT_TYPE_MAP = {
  bank:       { label: 'Rekening Bank', color: 'bg-blue-300'  },
  cash:       { label: 'Tunai',         color: 'bg-green-300' },
  investment: { label: 'Investasi',     color: 'bg-purple-300'},
  credit:     { label: 'Kartu Kredit',  color: 'bg-red-300' },
  'e-wallet': { label: 'E-Wallet',      color: 'bg-yellow-300'},
};

export default function AccountTypeBadge({ type }) {
  const config = ACCOUNT_TYPE_MAP[type] || { label: type, color: 'bg-gray-300' };

  return (
    <span
      className={`
        px-2 py-0.5 text-[10px] font-black uppercase tracking-wider
        border-2 border-black text-black
        ${config.color}
      `}
    >
      {config.label}
    </span>
  );
}
