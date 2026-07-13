import { useState } from 'react';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Sparkles, ScanLine, Target, Wallet } from 'lucide-react';
import type { Transaction, Goal } from '../App';
import { formatRupiah } from '../App';
import { AddTransactionModal } from './AddTransactionModal';
import { ScanReceiptModal } from './ScanReceiptModal';
import { UploadStatementModal } from './UploadStatementModal';
import { GoalDetailSheet } from './GoalDetailSheet';
import { CategoryIcon } from './CategoryIcon';

type ActiveModal = 'none' | 'add' | 'scan' | 'upload';

export function HomeScreen({
  balance, goals, transactions, addTransaction, addTransactions, onShowAllocation, updateGoalProgress,
}: {
  balance: number;
  goals: Goal[];
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addTransactions: (ts: Omit<Transaction, 'id'>[]) => void;
  onShowAllocation: () => void;
  updateGoalProgress: (id: number, amount: number) => void;
}) {
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [quickGoal, setQuickGoal] = useState<Goal | null>(null);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topGoals = [...goals].sort((a, b) => a.rank - b.rank).slice(0, 2);
  const topGoal = topGoals[0] ?? null;

  return (
    <div style={{ paddingBottom: 24, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: '#717182', margin: '0 0 2px' }}>Selamat datang</p>
          <h1
            style={{
              fontSize: 22, fontWeight: 700, color: '#1E1E1E', margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.3px',
            }}
          >
            Rania Putri
          </h1>
        </div>
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #298DFF, #072548)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 18,
            boxShadow: '0 4px 12px rgba(41,141,255,0.4)',
          }}
        >
          R
        </div>
      </div>

      {/* ── Quick Access Panel ── */}
      <div style={{ padding: '0 16px 14px' }}>
        <div
          style={{
            borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(135deg, #F0F7FF 0%, #F8F3FF 100%)',
            border: '1.5px solid rgba(41,141,255,0.12)',
            boxShadow: '0 2px 16px rgba(41,141,255,0.08)',
          }}
        >
          {/* Panel title */}
          <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Akses Cepat
            </p>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
          </div>

          {/* 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 10px 10px' }}>

            {/* Card 1 — Add Transaction */}
            <button
              onClick={() => setActiveModal('add')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 8, padding: '14px 14px 12px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #298DFF, #0070E0)',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 4px 14px rgba(41,141,255,0.32)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tambah</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Transaksi baru</p>
              </div>
            </button>

            {/* Card 2 — Scan Receipt */}
            <button
              onClick={() => setActiveModal('scan')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 8, padding: '14px 14px 12px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #FF8929, #E86800)',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 4px 14px rgba(255,137,41,0.32)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanLine size={20} color="white" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Scan</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Scan struk</p>
              </div>
            </button>

            {/* Card 3 — Top Priority Goal */}
            {topGoal ? (() => {
              const goalPct = Math.round((topGoal.collected / topGoal.target) * 100);
              return (
                <button
                  onClick={() => setQuickGoal(topGoal)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 6, padding: '14px 14px 12px', borderRadius: 16, border: '1.5px solid rgba(168,85,247,0.2)',
                    backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 2px 10px rgba(168,85,247,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={18} color="#A855F7" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#A855F7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{goalPct}%</span>
                  </div>
                  <div style={{ width: '100%' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1E1E1E', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topGoal.name}</p>
                    <div style={{ height: 5, backgroundColor: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${goalPct}%`, backgroundColor: '#A855F7' }} />
                    </div>
                  </div>
                </button>
              );
            })() : (
              <button
                onClick={() => {}}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '14px', borderRadius: 16, border: '1.5px dashed #E0E0E0',
                  backgroundColor: 'white', cursor: 'pointer',
                }}
              >
                <Target size={22} color="#C0C0C8" />
                <p style={{ fontSize: 12, color: '#C0C0C8', margin: 0, fontWeight: 500 }}>Buat Goal</p>
              </button>
            )}

            {/* Card 4 — Balance */}
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 6, padding: '14px 14px 12px', borderRadius: 16,
                border: '1.5px solid rgba(7,37,72,0.1)',
                background: 'linear-gradient(135deg, #F0F4FA, #E8EEF8)',
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(7,37,72,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="#072548" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#717182', margin: '0 0 2px', fontWeight: 500 }}>Saldo</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#072548', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1 }}>
                  {formatRupiah(balance)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Goal Detail triggered from Quick Access */}
      {quickGoal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <GoalDetailSheet
            goal={goals.find(g => g.id === quickGoal.id) ?? quickGoal}
            onAddFunds={amount => updateGoalProgress(quickGoal.id, amount)}
            onClose={() => setQuickGoal(null)}
          />
        </div>
      )}

      {/* Balance Card */}
      <div style={{ padding: '0 16px 14px' }}>
        <div
          style={{
            borderRadius: 22, padding: '22px 22px 20px',
            background: 'linear-gradient(145deg, #072548 0%, #0F3870 55%, #1858A0 100%)',
            color: 'white', position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 36px rgba(7,37,72,0.4)',
          }}
        >
          <div
            style={{
              position: 'absolute', top: -40, right: -30,
              width: 150, height: 150, borderRadius: '50%',
              backgroundColor: 'rgba(41,141,255,0.18)',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -30, left: -20,
              width: 100, height: 100, borderRadius: '50%',
              backgroundColor: 'rgba(41,141,255,0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute', top: 20, right: 90,
              width: 60, height: 60, borderRadius: '50%',
              backgroundColor: 'rgba(255,137,41,0.12)',
            }}
          />

          <p style={{ fontSize: 12, color: 'rgba(180,210,255,0.85)', margin: '0 0 6px', position: 'relative', fontWeight: 500 }}>
            Total Saldo
          </p>
          <p
            style={{
              fontSize: 32, fontWeight: 800, margin: '0 0 18px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              position: 'relative', letterSpacing: '-0.8px', lineHeight: 1.1,
            }}
          >
            {formatRupiah(balance)}
          </p>

          <div style={{ display: 'flex', gap: 28, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  backgroundColor: 'rgba(74,222,128,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <TrendingUp size={14} color="#4ade80" />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(180,210,255,0.7)', margin: 0, fontWeight: 500 }}>Pemasukan</p>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{formatRupiah(totalIncome)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  backgroundColor: 'rgba(251,113,133,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <TrendingDown size={14} color="#fb7185" />
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(180,210,255,0.7)', margin: 0, fontWeight: 500 }}>Pengeluaran</p>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{formatRupiah(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => setActiveModal('add')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: '15px',
            borderRadius: 18, border: 'none',
            background: 'linear-gradient(135deg, #298DFF 0%, #0070E0 100%)',
            color: 'white', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(41,141,255,0.4)',
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          Tambah Transaksi
        </button>
      </div>

      {/* Smart Allocation Banner */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={onShowAllocation}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '14px 16px',
            borderRadius: 16, border: '1.5px solid rgba(255,137,41,0.25)',
            backgroundColor: '#FFF8F3', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42, height: 42, borderRadius: 13,
                background: 'linear-gradient(135deg, #FF8929, #FFB36B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(255,137,41,0.3)',
              }}
            >
              <Sparkles size={19} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>
                Saran Alokasi Cerdas
              </p>
              <p style={{ fontSize: 12, color: '#996633', margin: '2px 0 0' }}>
                Pemasukan barumu bisa dioptimalkan!
              </p>
            </div>
          </div>
          <ChevronRight size={16} color="#FF8929" />
        </button>
      </div>

      {/* Goals Section */}
      <div style={{ paddingBottom: 16 }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px 12px',
          }}
        >
          <h2
            style={{
              fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Target Tabungan
          </h2>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              color: '#298DFF', fontSize: 13, background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Semua <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }}>
          {topGoals.map(goal => {
            const pct = Math.round((goal.collected / goal.target) * 100);
            const isHigh = pct >= 50;
            return (
              <div
                key={goal.id}
                style={{
                  minWidth: 210, backgroundColor: 'white', borderRadius: 18,
                  padding: '16px', boxShadow: '0 2px 14px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: 0, flex: 1, marginRight: 8 }}>
                    {goal.name}
                  </p>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px',
                      borderRadius: 8, whiteSpace: 'nowrap',
                      backgroundColor: isHigh ? '#FFF3E8' : '#EEF6FF',
                      color: isHigh ? '#FF8929' : '#298DFF',
                    }}
                  >
                    #{goal.rank}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#A0A0A8', margin: '0 0 10px' }}>
                  {formatRupiah(goal.collected)} / {formatRupiah(goal.target)}
                </p>
                <div
                  style={{
                    width: '100%', height: 8, backgroundColor: '#F0F0F0',
                    borderRadius: 99, overflow: 'hidden', marginBottom: 7,
                  }}
                >
                  <div
                    style={{
                      height: '100%', borderRadius: 99, width: `${pct}%`,
                      background: isHigh
                        ? 'linear-gradient(90deg, #FF8929, #FFB36B)'
                        : 'linear-gradient(90deg, #298DFF, #66AAFF)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: isHigh ? '#FF8929' : '#298DFF' }}>
                  {pct}% tercapai
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Transaksi Terbaru
          </h2>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              color: '#298DFF', fontSize: 13, background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Semua <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentTransactions.map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'white', borderRadius: 14, padding: '12px 14px',
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CategoryIcon category={t.category} size={16} containerSize={40} borderRadius={12} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', margin: 0 }}>
                    {t.category}
                  </p>
                  <p style={{ fontSize: 11, color: '#A0A0A8', margin: '2px 0 0' }}>
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {t.note ? ` · ${t.note}` : ''}
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontSize: 14, fontWeight: 700, margin: 0,
                  color: t.type === 'income' ? '#16a34a' : '#dc2626',
                  flexShrink: 0,
                }}
              >
                {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {activeModal === 'add' && (
        <AddTransactionModal
          onSave={t => { addTransaction(t); setActiveModal('none'); }}
          onClose={() => setActiveModal('none')}
          onScanReceipt={() => setActiveModal('scan')}
          onUploadStatement={() => setActiveModal('upload')}
        />
      )}

      {activeModal === 'scan' && (
        <ScanReceiptModal
          onSave={t => { addTransaction(t); setActiveModal('none'); }}
          onClose={() => setActiveModal('none')}
          onSwitchManual={() => setActiveModal('add')}
        />
      )}

      {activeModal === 'upload' && (
        <UploadStatementModal
          onImport={ts => { addTransactions(ts); setActiveModal('none'); }}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
