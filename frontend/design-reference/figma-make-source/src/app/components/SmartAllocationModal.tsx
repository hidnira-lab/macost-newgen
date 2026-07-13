import { useState } from 'react';
import { X, Check, Sparkles, Trophy } from 'lucide-react';
import type { Goal } from '../App';
import { formatRupiah } from '../App';

const SIDE_INCOME = 500000;
const SUGGESTED_AMOUNT = 175000;
const SUGGESTED_PCT = 35;

export function SmartAllocationModal({
  goals,
  onConfirm,
  onClose,
  onDismiss,
}: {
  goals: Goal[];
  onConfirm: (goalId: number, amount: number) => void;
  onClose: () => void;
  onDismiss?: (goalId: number, goalName: string, amount: number) => void;
}) {
  const topGoal = [...goals].sort((a, b) => a.rank - b.rank)[0];
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!topGoal) return null;

  const pct = Math.round((topGoal.collected / topGoal.target) * 100);
  const rawCustom = parseInt(customAmount.replace(/\./g, '') || '0');
  const allocationAmount = customMode && rawCustom > 0 ? rawCustom : SUGGESTED_AMOUNT;
  const newPct = Math.min(100, Math.round(((topGoal.collected + allocationAmount) / topGoal.target) * 100));

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(topGoal.id, allocationAmount);
    }, 900);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(7,37,72,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#FCFCFC', borderRadius: 26, padding: '26px 24px',
          width: '100%', maxWidth: 390,
          boxShadow: '0 24px 64px rgba(7,37,72,0.35)',
          position: 'relative',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 18,
            width: 30, height: 30, borderRadius: '50%',
            backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={15} color="#717182" />
        </button>

        {/* Confirmed State */}
        {confirmed ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 6px 24px rgba(34,197,94,0.4)',
              }}
            >
              <Check size={34} color="white" strokeWidth={3} />
            </div>
            <h2
              style={{
                fontSize: 20, fontWeight: 800, color: '#1E1E1E', margin: '0 0 8px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Berhasil Dialokasikan!
            </h2>
            <p style={{ fontSize: 14, color: '#717182', margin: 0 }}>
              {formatRupiah(allocationAmount)} berhasil ditambahkan ke{' '}
              <strong style={{ color: '#1E1E1E' }}>{topGoal.name}</strong>
            </p>
          </div>
        ) : (
          <>
            {/* Icon + Title */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: 'linear-gradient(135deg, #FF8929, #FFB36B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 6px 20px rgba(255,137,41,0.38)',
                }}
              >
                <Sparkles size={28} color="white" />
              </div>
              <h2
                style={{
                  fontSize: 18, fontWeight: 800, color: '#1E1E1E', margin: '0 0 10px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.3px',
                }}
              >
                Saran Alokasi Cerdas!
              </h2>
              <p style={{ fontSize: 14, color: '#717182', margin: 0, lineHeight: 1.65 }}>
                Pemasukan sampinganmu sebesar{' '}
                <strong style={{ color: '#1E1E1E' }}>{formatRupiah(SIDE_INCOME)}</strong>{' '}
                baru saja masuk! Kami sarankan mengalokasikan{' '}
                <strong style={{ color: '#FF8929' }}>
                  {formatRupiah(SUGGESTED_AMOUNT)} ({SUGGESTED_PCT}%)
                </strong>{' '}
                ke target prioritas utamamu.
              </p>
            </div>

            {/* Goal Card */}
            <div
              style={{
                backgroundColor: '#FFF8F3', borderRadius: 18, padding: '16px',
                border: '1.5px solid rgba(255,137,41,0.22)', marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 10, fontWeight: 700,
                      color: '#D97706', backgroundColor: '#FEF3C7',
                      padding: '2px 8px', borderRadius: 7, marginBottom: 5,
                    }}
                  >
                    <Trophy size={11} strokeWidth={2.5} /> Prioritas #1
                  </span>
                  <h3
                    style={{
                      fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {topGoal.name}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: 20, fontWeight: 900, margin: 0, color: '#FF8929',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {pct}%
                  </p>
                  {!customMode && (
                    <p style={{ fontSize: 10, color: '#996633', margin: '2px 0 0' }}>
                      → {newPct}% setelah
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar showing current → after */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <div
                  style={{
                    height: 10, backgroundColor: 'rgba(255,137,41,0.12)',
                    borderRadius: 99, overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%', borderRadius: 99,
                      background: 'linear-gradient(90deg, #FF8929, #FFB36B)',
                      width: `${pct}%`, transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                {/* Preview line */}
                {!customMode && newPct > pct && (
                  <div
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      height: 10, borderRadius: 99, overflow: 'hidden',
                      width: `${newPct}%`,
                      background: 'linear-gradient(90deg, rgba(255,137,41,0), rgba(255,179,107,0.35))',
                    }}
                  />
                )}
              </div>
              <p style={{ fontSize: 12, color: '#996633', margin: 0 }}>
                {formatRupiah(topGoal.collected)} / {formatRupiah(topGoal.target)}
              </p>
            </div>

            {/* Custom Amount Input */}
            {customMode && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 7px' }}>Jumlah Alokasi</p>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 14, fontWeight: 700, color: '#717182',
                    }}
                  >
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={customAmount}
                    onChange={handleCustomChange}
                    autoFocus
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px', borderRadius: 13,
                      border: '2px solid #FF8929', backgroundColor: '#FFFDF8',
                      fontSize: 18, fontWeight: 700, color: '#1E1E1E', outline: 'none',
                      boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '15px', borderRadius: 15, border: 'none',
                  background: 'linear-gradient(135deg, #298DFF, #0070E0)',
                  color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 5px 18px rgba(41,141,255,0.38)',
                  fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
                }}
              >
                Konfirmasi Alokasi {formatRupiah(allocationAmount)}
              </button>

              <button
                onClick={() => {
                  setCustomMode(!customMode);
                  if (customMode) setCustomAmount('');
                }}
                style={{
                  padding: '13px', borderRadius: 14,
                  border: '1.5px solid #298DFF',
                  backgroundColor: 'white', color: '#298DFF',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {customMode ? '← Gunakan Saran Awal' : 'Ubah Jumlah'}
              </button>

              <button
                onClick={() => {
                  onDismiss?.(topGoal.id, topGoal.name, allocationAmount);
                  onClose();
                }}
                style={{
                  padding: '13px', border: 'none', backgroundColor: 'transparent',
                  color: '#717182', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
                }}
              >
                Nanti Saja
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
