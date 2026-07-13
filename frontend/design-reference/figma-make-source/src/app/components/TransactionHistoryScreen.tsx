import { useState } from 'react';
import { ArrowLeft, Search, X, Edit2, Trash2, ChevronDown, Check, PackageOpen } from 'lucide-react';
import type { Transaction } from '../App';
import { formatRupiah } from '../App';
import { CategoryIcon } from './CategoryIcon';

const CATEGORIES = ['Semua', 'Food & Drink', 'Transportation', 'Entertainment', 'Education', 'Bills', 'Housing', 'Shopping', 'Health', 'Other'];

function ActionSheet({
  transaction,
  onEdit,
  onDelete,
  onClose,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 120,
        backgroundColor: 'rgba(7,37,72,0.5)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '16px 16px 36px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>
        <div style={{ padding: '0 4px 14px', borderBottom: '1px solid #F0F0F0', marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: '#A0A0A8', margin: '0 0 2px', fontFamily: "'Inter', sans-serif" }}>
            {transaction.date}
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {transaction.category}
          </p>
          <p style={{
            fontSize: 17, fontWeight: 800, margin: 0,
            color: transaction.type === 'income' ? '#22C55E' : '#EF4444',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
          </p>
        </div>
        <button
          onClick={onEdit}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            backgroundColor: '#F0F7FF', color: '#298DFF',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Edit2 size={18} />
          Edit Transaksi
        </button>
        <button
          onClick={onDelete}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            backgroundColor: '#FEF2F2', color: '#EF4444',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Trash2 size={18} />
          Hapus Transaksi
        </button>
      </div>
    </div>
  );
}

function EditModal({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  onSave: (t: Transaction) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(transaction.amount.toLocaleString('id-ID'));
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note);
  const [type, setType] = useState(transaction.type);

  const rawAmount = parseInt(amount.replace(/\./g, '') || '0');
  const canSave = rawAmount > 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 130,
        backgroundColor: 'rgba(7,37,72,0.55)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '16px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1E1E1E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Transaksi
          </p>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="#717182" />
          </button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 0, backgroundColor: '#F4F4F4', borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {(['expense', 'income'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                backgroundColor: type === t ? 'white' : 'transparent',
                color: type === t ? (t === 'income' ? '#22C55E' : '#EF4444') : '#A0A0A8',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                boxShadow: type === t ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Jumlah</p>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#717182' }}>Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              style={{
                width: '100%', padding: '12px 12px 12px 38px', borderRadius: 12,
                border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                fontSize: 16, fontWeight: 700, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Kategori</p>
          <div style={{ position: 'relative' }}>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '12px 36px 12px 14px', borderRadius: 12,
                border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                fontSize: 14, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                appearance: 'none',
              }}
            >
              {CATEGORIES.filter(c => c !== 'Semua').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={15} color="#A0A0A8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Tanggal</p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid #E0E0E0', backgroundColor: 'white',
              fontSize: 14, color: '#1E1E1E', outline: 'none',
              boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Catatan</p>
          <input
            type="text"
            placeholder="Opsional..."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid #E0E0E0', backgroundColor: 'white',
              fontSize: 14, color: '#1E1E1E', outline: 'none',
              boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        <button
          onClick={() => canSave && onSave({ ...transaction, amount: rawAmount, category, date, note, type })}
          disabled={!canSave}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: canSave ? 'linear-gradient(135deg, #298DFF, #0070E0)' : '#E0E0E0',
            color: canSave ? 'white' : '#A0A0A8',
            fontSize: 15, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Check size={17} /> Simpan Perubahan
        </button>
      </div>
    </div>
  );
}

export function TransactionHistoryScreen({
  transactions,
  onDelete,
  onEdit,
  onBack,
}: {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  onEdit: (t: Transaction) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = sorted.filter(t => {
    const matchSearch = search === '' ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.note.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === 'all' || t.type === filter;
    const matchCat = categoryFilter === 'Semua' || t.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  const groupByDate = () => {
    const groups: Record<string, Transaction[]> = {};
    for (const t of filtered) {
      const key = t.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 18px',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Riwayat Transaksi
          </h1>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={16} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 36px 11px 40px',
              borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.12)', color: 'white',
              fontSize: 14, outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={15} color="rgba(255,255,255,0.7)" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                border: filter === f ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                backgroundColor: filter === f ? 'white' : 'transparent',
                color: filter === f
                  ? (f === 'income' ? '#22C55E' : f === 'expense' ? '#EF4444' : '#072548')
                  : 'rgba(255,255,255,0.8)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {f === 'all' ? 'Semua' : f === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F4F6F8' }}>
        {/* Summary bar */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#A0A0A8', margin: '0 0 2px', fontWeight: 500 }}>Pemasukan</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#22C55E', margin: 0 }}>
              {formatRupiah(filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0))}
            </p>
          </div>
          <div style={{ width: 1, backgroundColor: '#F0F0F0' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#A0A0A8', margin: '0 0 2px', fontWeight: 500 }}>Pengeluaran</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', margin: 0 }}>
              {formatRupiah(filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0))}
            </p>
          </div>
          <div style={{ width: 1, backgroundColor: '#F0F0F0' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#A0A0A8', margin: '0 0 2px', fontWeight: 500 }}>Transaksi</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>{filtered.length}</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={44} color="#C0C0C8" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1E1E1E', margin: '0 0 6px' }}>Tidak ditemukan</p>
            <p style={{ fontSize: 13, color: '#A0A0A8', margin: 0 }}>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div style={{ padding: '10px 0 24px' }}>
            {groupByDate().map(([date, txs]) => (
              <div key={date}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A8', padding: '8px 16px 6px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {formatDate(date)}
                </p>
                <div style={{ backgroundColor: 'white', margin: '0 12px', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
                  {txs.map((t, idx) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTx(t)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                        borderTop: idx > 0 ? '1px solid #F4F4F4' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                    >
                      <CategoryIcon category={t.category} size={18} containerSize={42} borderRadius={12} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {t.category}
                        </p>
                        {t.note && (
                          <p style={{ fontSize: 12, color: '#A0A0A8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.note}
                          </p>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 15, fontWeight: 700, margin: 0, flexShrink: 0,
                          color: t.type === 'income' ? '#22C55E' : '#EF4444',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action sheet */}
      {selectedTx && !editingTx && (
        <ActionSheet
          transaction={selectedTx}
          onEdit={() => { setEditingTx(selectedTx); setSelectedTx(null); }}
          onDelete={() => { onDelete(selectedTx.id); setSelectedTx(null); }}
          onClose={() => setSelectedTx(null)}
        />
      )}
      {editingTx && (
        <EditModal
          transaction={editingTx}
          onSave={t => { onEdit(t); setEditingTx(null); }}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
