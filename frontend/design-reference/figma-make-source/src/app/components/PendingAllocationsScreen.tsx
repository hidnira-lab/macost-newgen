import { ArrowLeft, RefreshCw, Clock, Inbox, Lightbulb, Sparkles } from 'lucide-react';
import type { Goal } from '../App';
import { formatRupiah } from '../App';

export type PendingSuggestion = {
  id: number;
  goalId: number;
  goalName: string;
  amount: number;
  suggestedAt: string;
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export function PendingAllocationsScreen({
  suggestions,
  goals,
  onReview,
  onDismissAll,
  onBack,
}: {
  suggestions: PendingSuggestion[];
  goals: Goal[];
  onReview: (s: PendingSuggestion) => void;
  onDismissAll: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 20px',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Saran Tertunda
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(180,210,255,0.75)', margin: '3px 0 0' }}>
                Alokasi yang belum kamu konfirmasi
              </p>
            </div>
          </div>
          {suggestions.length > 0 && (
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: '#FF8929',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'white',
              }}
            >
              {suggestions.length}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F4F6F8' }}>
        {suggestions.length === 0 ? (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: '40px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: 88, height: 88, borderRadius: 26,
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, boxShadow: '0 4px 20px rgba(41,141,255,0.1)',
              }}
            >
              <Inbox size={38} color="#298DFF" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E1E1E', margin: '0 0 10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Tidak Ada Saran Tertunda
            </h2>
            <p style={{ fontSize: 14, color: '#717182', margin: '0 0 24px', lineHeight: 1.6, maxWidth: 280 }}>
              Semua saran alokasi telah dikonfirmasi atau belum ada saran baru untukmu saat ini.
            </p>
            <div style={{
              padding: '14px 18px', borderRadius: 16,
              backgroundColor: '#FFF8F3', border: '1.5px solid rgba(255,137,41,0.2)',
              maxWidth: 280,
            }}>
              <p style={{ fontSize: 12, color: '#996633', margin: 0, lineHeight: 1.55, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Lightbulb size={14} color="#FF8929" style={{ flexShrink: 0, marginTop: 1 }} />
                Saran baru akan muncul saat kamu menerima pemasukan atau ada perubahan pada prioritas goalmu.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 12px 24px' }}>
            {/* Info bar */}
            <div style={{
              backgroundColor: '#FFF8F3', borderRadius: 14, padding: '12px 16px',
              border: '1.5px solid rgba(255,137,41,0.2)', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Clock size={16} color="#FF8929" />
              <p style={{ fontSize: 13, color: '#996633', margin: 0, flex: 1 }}>
                {suggestions.length} saran alokasi menunggu konfirmasimu
              </p>
              <button
                onClick={onDismissAll}
                style={{
                  fontSize: 12, color: '#A0A0A8', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", padding: 0,
                }}
              >
                Hapus Semua
              </button>
            </div>

            {/* Suggestion cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map(s => {
                const goal = goals.find(g => g.id === s.goalId);
                const pct = goal ? Math.round((goal.collected / goal.target) * 100) : 0;
                const afterPct = goal ? Math.min(100, Math.round(((goal.collected + s.amount) / goal.target) * 100)) : pct;

                return (
                  <div
                    key={s.id}
                    style={{
                      backgroundColor: 'white', borderRadius: 20,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      border: '1.5px solid rgba(255,137,41,0.12)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Orange top strip */}
                    <div style={{ height: 4, background: 'linear-gradient(90deg, #FF8929, #FFB36B)' }} />

                    <div style={{ padding: '16px 18px' }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 7, backgroundColor: '#FEF3C7', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Sparkles size={10} /> Saran AI
                            </span>
                            <span style={{ fontSize: 11, color: '#A0A0A8' }}>{timeAgo(s.suggestedAt)}</span>
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {s.goalName}
                          </h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 18, fontWeight: 900, color: '#FF8929', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {formatRupiah(s.amount)}
                          </p>
                          <p style={{ fontSize: 11, color: '#A0A0A8', margin: '2px 0 0' }}>saran alokasi</p>
                        </div>
                      </div>

                      {/* Progress preview */}
                      {goal && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#717182' }}>Progress saat ini</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#FF8929' }}>
                              {pct}% → <span style={{ color: '#22C55E' }}>{afterPct}%</span>
                            </span>
                          </div>
                          <div style={{ height: 8, backgroundColor: '#F0F0F0', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, #FF8929, #FFB36B)' }} />
                            {afterPct > pct && (
                              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 99, width: `${afterPct}%`, background: 'rgba(34,197,94,0.25)' }} />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Review button */}
                      <button
                        onClick={() => onReview(s)}
                        style={{
                          width: '100%', padding: '12px', borderRadius: 13, border: 'none',
                          background: 'linear-gradient(135deg, #FF8929, #E86800)',
                          color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: '0 4px 14px rgba(255,137,41,0.35)',
                        }}
                      >
                        <RefreshCw size={15} />
                        Tinjau Saran Ini
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
