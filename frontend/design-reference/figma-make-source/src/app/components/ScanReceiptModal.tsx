import { useState } from 'react';
import { X, Camera, Edit3, ChevronDown, PenLine, FileText, Frown, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../App';

type ScanStep = 'viewfinder' | 'loading' | 'success' | 'error';

const expenseCategories = [
  'Food & Drink', 'Transportation', 'Entertainment',
  'Shopping', 'Bills', 'Education', 'Housing',
];

const MOCK = {
  merchant: 'Indomaret',
  amount: '27.500',
  date: new Date().toISOString().split('T')[0],
  category: 'Food & Drink',
};

export function ScanReceiptModal({
  onSave,
  onClose,
  onSwitchManual,
}: {
  onSave: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  onSwitchManual: () => void;
}) {
  const [step, setStep] = useState<ScanStep>('viewfinder');
  const [merchant, setMerchant] = useState(MOCK.merchant);
  const [amount, setAmount] = useState(MOCK.amount);
  const [date, setDate] = useState(MOCK.date);
  const [category, setCategory] = useState(MOCK.category);

  const handleCapture = () => {
    setStep('loading');
    setTimeout(() => {
      setStep(Math.random() > 0.25 ? 'success' : 'error');
    }, 2000);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  const handleSave = () => {
    const rawAmount = parseInt(amount.replace(/\./g, '') || '0');
    if (!rawAmount) return;
    onSave({ amount: rawAmount, type: 'expense', category, date, note: merchant });
  };

  // ─── VIEWFINDER ───────────────────────────────────────────────────────────
  if (step === 'viewfinder') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 150,
          backgroundColor: '#0A0A0A',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: '20px 20px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={24} color="white" />
          </button>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Scan Struk
          </p>
          <div style={{ width: 32 }} />
        </div>

        {/* Viewfinder area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div
            style={{
              width: '78%', aspectRatio: '3/4', position: 'relative',
              borderRadius: 20, overflow: 'hidden', backgroundColor: '#1C1C1C',
            }}
          >
            {/* Grid lines */}
            <div
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '33.33% 33.33%',
              }}
            />
            {/* Corner brackets */}
            {([
              { top: 14, left: 14, borderTop: '3px solid #298DFF', borderLeft: '3px solid #298DFF' },
              { top: 14, right: 14, borderTop: '3px solid #298DFF', borderRight: '3px solid #298DFF' },
              { bottom: 14, left: 14, borderBottom: '3px solid #298DFF', borderLeft: '3px solid #298DFF' },
              { bottom: 14, right: 14, borderBottom: '3px solid #298DFF', borderRight: '3px solid #298DFF' },
            ] as React.CSSProperties[]).map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 26, height: 26, borderRadius: 3, ...s }} />
            ))}
            {/* Scanning line */}
            <div
              style={{
                position: 'absolute', left: 10, right: 10, height: 2, borderRadius: 1,
                background: 'linear-gradient(90deg, transparent, #298DFF 20%, #66AAFF 50%, #298DFF 80%, transparent)',
                animation: 'scanLine 2.5s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(41,141,255,0.7)',
              }}
            />
            {/* Receipt skeleton */}
            <div style={{ position: 'absolute', inset: '20px 28px', display: 'flex', flexDirection: 'column', gap: 9, opacity: 0.28 }}>
              {[85, 55, 100, 65, 80, 45, 70, 90, 50].map((w, i) => (
                <div key={i} style={{ height: 11, width: `${w}%`, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4 }} />
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, textAlign: 'center' }}>
            Arahkan kamera ke struk belanja
          </p>
        </div>

        {/* Capture controls */}
        <div style={{ padding: '16px 0 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <button
            onClick={handleCapture}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.3)',
              backgroundColor: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
            }}
          >
            <Camera size={34} color="#1E1E1E" />
          </button>
          <button
            onClick={onSwitchManual}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
              fontFamily: "'Inter', sans-serif", padding: '7px 18px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <PenLine size={13} /> Input Manual
          </button>
        </div>
      </div>
    );
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 150,
          backgroundColor: 'rgba(7,37,72,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: '#FCFCFC', borderRadius: 24, padding: '40px 32px',
            textAlign: 'center', width: 300, maxWidth: '90%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <FileText size={44} color="#298DFF" strokeWidth={1.5} />
          </div>
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '4px solid #EEF6FF', borderTop: '4px solid #298DFF',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <p
            style={{
              fontSize: 17, fontWeight: 700, color: '#1E1E1E', margin: '0 0 6px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Membaca strikmu...
          </p>
          <p style={{ fontSize: 13, color: '#717182', margin: 0 }}>
            AI sedang mengekstrak data, harap tunggu
          </p>
        </div>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────
  if (step === 'error') {
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
            backgroundColor: '#FCFCFC', borderRadius: 24, padding: '36px 28px',
            textAlign: 'center', width: '100%', maxWidth: 360,
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Frown size={56} color="#A0A0A8" strokeWidth={1.5} />
          </div>
          <h2
            style={{
              fontSize: 19, fontWeight: 800, color: '#1E1E1E', margin: '0 0 10px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Struk Tidak Terbaca
          </h2>
          <p
            style={{
              fontSize: 14, color: '#717182', margin: '0 0 26px', lineHeight: 1.65,
            }}
          >
            Foto kurang jelas atau pencahayaan kurang. Coba foto ulang dengan pencahayaan yang lebih baik.
          </p>
          <button
            onClick={() => setStep('viewfinder')}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #298DFF, #0070E0)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              marginBottom: 14, fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 16px rgba(41,141,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <RefreshCw size={16} /> Coba Lagi
          </button>
          <button
            onClick={onSwitchManual}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#717182', fontSize: 14, fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              textDecoration: 'underline',
            }}
          >
            Switch ke Input Manual
          </button>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ─────────────────────────────────────────────────────────────
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
          maxHeight: '88vh', overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>

        <div style={{ padding: '14px 20px 32px' }}>
          {/* Success header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12, backgroundColor: '#EDFFF3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={22} color="#22C55E" strokeWidth={2} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Struk Terbaca!
                </p>
                <p style={{ fontSize: 12, color: '#22C55E', margin: '2px 0 0', fontWeight: 600 }}>
                  Periksa & edit data jika perlu
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#717182" />
            </button>
          </div>

          {/* Extracted fields */}
          {/* Merchant */}
          <div style={{ marginBottom: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#717182' }}>Nama Merchant</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <input
              type="text"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '1.5px solid rgba(41,141,255,0.25)', backgroundColor: '#F8FBFF',
                fontSize: 14, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#717182' }}>Jumlah</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: '#717182' }}>Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                  border: '1.5px solid rgba(41,141,255,0.25)', backgroundColor: '#F8FBFF',
                  fontSize: 14, fontWeight: 700, color: '#1E1E1E', outline: 'none',
                  boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#717182' }}>Tanggal</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '1.5px solid rgba(41,141,255,0.25)', backgroundColor: '#F8FBFF',
                fontSize: 14, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#717182' }}>Kategori</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '12px 36px 12px 14px', borderRadius: 12,
                  border: '1.5px solid rgba(41,141,255,0.25)', backgroundColor: '#F8FBFF',
                  fontSize: 14, color: '#1E1E1E', appearance: 'none', cursor: 'pointer',
                  outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                }}
              >
                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} color="#717182" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '15px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #298DFF, #0070E0)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(41,141,255,0.35)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}
