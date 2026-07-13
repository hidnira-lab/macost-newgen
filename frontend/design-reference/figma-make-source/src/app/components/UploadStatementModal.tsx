import { useState, useRef } from 'react';
import { X, Upload, Check, FileText, ChevronDown, FolderOpen } from 'lucide-react';
import type { Transaction } from '../App';
import { formatRupiah } from '../App';

type UploadStep = 'upload' | 'processing' | 'preview';

const categoryOptions = ['Food & Drink', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Education', 'Housing', 'Allowance', 'Freelance Income'];

const mockExtracted: (Omit<Transaction, 'id'> & { extractedId: number })[] = [
  { extractedId: 1, date: '2026-07-08', description: 'TRANSFER MASUK - PT KLIEN ABC', amount: 500000, type: 'income', category: 'Freelance Income', note: 'TRANSFER MASUK - PT KLIEN ABC' },
  { extractedId: 2, date: '2026-07-07', description: 'QRIS - INDOMARET KEMANG', amount: 45000, type: 'expense', category: 'Food & Drink', note: 'QRIS - INDOMARET KEMANG' },
  { extractedId: 3, date: '2026-07-06', description: 'TRANSFER KELUAR - KOS BULANAN', amount: 1200000, type: 'expense', category: 'Housing', note: 'TRANSFER KELUAR - KOS BULANAN' },
  { extractedId: 4, date: '2026-07-05', description: 'SHOPEE PAY - BELANJA ONLINE', amount: 150000, type: 'expense', category: 'Shopping', note: 'SHOPEE PAY - BELANJA ONLINE' },
  { extractedId: 5, date: '2026-07-03', description: 'GoPay - GOFOOD ORDER', amount: 38000, type: 'expense', category: 'Food & Drink', note: 'GoPay - GOFOOD ORDER' },
];

export function UploadStatementModal({
  onImport,
  onClose,
}: {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set(mockExtracted.map(t => t.extractedId)));
  const [categories, setCategories] = useState<Record<number, string>>(
    Object.fromEntries(mockExtracted.map(t => [t.extractedId, t.category]))
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const startProcessing = (name?: string) => {
    setFileName(name || 'mutasi_bank_juli_2026.pdf');
    setStep('processing');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => setStep('preview'), 450);
      }
      setProgress(Math.min(p, 100));
    }, 280);
  };

  const toggleRow = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = selected.size === mockExtracted.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(mockExtracted.map(t => t.extractedId)));

  const handleImport = () => {
    const toImport = mockExtracted
      .filter(t => selected.has(t.extractedId))
      .map(({ extractedId, description, ...rest }) => ({
        ...rest,
        category: categories[extractedId] ?? rest.category,
      }));
    onImport(toImport);
  };

  // ─── UPLOAD ──────────────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 150,
          backgroundColor: 'rgba(7,37,72,0.6)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          backdropFilter: 'blur(5px)',
          fontFamily: "'Inter', sans-serif",
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            backgroundColor: '#FCFCFC', borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
          </div>
          <div style={{ padding: '14px 20px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Upload Mutasi Bank
              </h2>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#717182" />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDrop={e => { e.preventDefault(); startProcessing(e.dataTransfer.files[0]?.name); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(41,141,255,0.35)', borderRadius: 20,
                padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
                backgroundColor: '#F8FBFF',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: 'linear-gradient(135deg, #EEF6FF, #DBEAFE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Upload size={28} color="#298DFF" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Upload File Mutasi
                </p>
                <p style={{ fontSize: 13, color: '#717182', margin: '0 0 2px' }}>
                  Seret & lepas di sini, atau klik untuk pilih
                </p>
                <p style={{ fontSize: 11, color: '#A0A0A8', margin: 0 }}>
                  Mendukung PDF dari BCA, BNI, Mandiri, GoPay, OVO
                </p>
              </div>
              <div
                style={{
                  padding: '10px 24px', borderRadius: 12, backgroundColor: '#298DFF',
                  color: 'white', fontSize: 14, fontWeight: 600,
                }}
              >
                Pilih File
              </div>
            </div>
            <input
              ref={fileRef} type="file" accept=".pdf,.csv,.xlsx"
              onChange={e => startProcessing(e.target.files?.[0]?.name)}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => startProcessing()}
              style={{
                marginTop: 14, width: '100%', padding: '13px', borderRadius: 14,
                border: '1.5px solid #E0E0E0', backgroundColor: 'transparent',
                color: '#717182', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
                <FolderOpen size={16} /> Demo: Muat Data Contoh
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PROCESSING ───────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 150,
          backgroundColor: 'rgba(7,37,72,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(5px)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: '#FCFCFC', borderRadius: 24, padding: '40px 32px',
            textAlign: 'center', width: '100%', maxWidth: 360,
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #EEF6FF, #298DFF20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <FileText size={32} color="#298DFF" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Memproses {fileName}...
          </p>
          <p style={{ fontSize: 13, color: '#717182', margin: '0 0 22px' }}>
            AI mengekstrak transaksi, harap tunggu
          </p>

          <div style={{ height: 10, backgroundColor: '#F0F0F0', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
            <div
              style={{
                height: '100%', borderRadius: 99, width: `${progress}%`,
                background: 'linear-gradient(90deg, #298DFF, #66AAFF)',
                transition: 'width 0.28s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#298DFF', margin: 0 }}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    );
  }

  // ─── PREVIEW ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 150,
        backgroundColor: '#FCFCFC',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Preview Transaksi
          </h2>
          <p style={{ fontSize: 12, color: '#717182', margin: '3px 0 0' }}>
            {mockExtracted.length} transaksi ditemukan dari {fileName}
          </p>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color="#717182" />
        </button>
      </div>

      {/* Select all */}
      <div style={{ padding: '10px 20px', backgroundColor: '#F8FBFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <button
          onClick={toggleAll}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            style={{
              width: 22, height: 22, borderRadius: 6,
              backgroundColor: allSelected ? '#298DFF' : 'white',
              border: `2px solid ${allSelected ? '#298DFF' : '#C0C0C0'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {allSelected && <Check size={13} color="white" strokeWidth={3} />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E' }}>Pilih Semua</span>
        </button>
        <span style={{ fontSize: 12, color: '#717182' }}>
          <span style={{ fontWeight: 700, color: '#298DFF' }}>{selected.size}</span> dipilih
        </span>
      </div>

      {/* Transaction rows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mockExtracted.map(t => {
          const isSelected = selected.has(t.extractedId);
          return (
            <div
              key={t.extractedId}
              style={{
                borderRadius: 16, overflow: 'hidden',
                border: `1.5px solid ${isSelected ? 'rgba(41,141,255,0.22)' : 'rgba(0,0,0,0.07)'}`,
                backgroundColor: isSelected ? '#F0F7FF' : 'white',
                transition: 'all 0.15s',
              }}
            >
              {/* Row header */}
              <div
                onClick={() => toggleRow(t.extractedId)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    backgroundColor: isSelected ? '#298DFF' : 'white',
                    border: `2px solid ${isSelected ? '#298DFF' : '#C0C0C0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.description}
                  </p>
                  <p style={{ fontSize: 11, color: '#A0A0A8', margin: '2px 0 0' }}>
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0, flexShrink: 0, color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                  {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
                </p>
              </div>

              {/* Category selector (only when selected) */}
              {isSelected && (
                <div style={{ padding: '0 14px 12px', paddingLeft: 46 }}>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={categories[t.extractedId] ?? t.category}
                      onChange={e => setCategories(prev => ({ ...prev, [t.extractedId]: e.target.value }))}
                      style={{
                        width: '100%', padding: '8px 32px 8px 10px', borderRadius: 10,
                        border: '1.5px solid rgba(41,141,255,0.2)', backgroundColor: 'white',
                        fontSize: 12, color: '#1E1E1E', appearance: 'none', cursor: 'pointer',
                        outline: 'none', fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} color="#717182" style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Import button */}
      <div style={{ padding: '12px 16px 36px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <button
          onClick={handleImport}
          disabled={selected.size === 0}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none',
            background: selected.size > 0 ? 'linear-gradient(135deg, #298DFF, #0070E0)' : '#E0E0E0',
            color: selected.size > 0 ? 'white' : '#A0A0A8',
            fontSize: 15, fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            boxShadow: selected.size > 0 ? '0 4px 16px rgba(41,141,255,0.35)' : 'none',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          Import {selected.size} Transaksi
          {selected.size > 0 && (
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10,
                padding: '2px 9px', fontSize: 13, fontWeight: 800,
                minWidth: 24, textAlign: 'center',
              }}
            >
              {selected.size}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
