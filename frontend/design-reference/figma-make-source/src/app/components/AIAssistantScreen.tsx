import { useState } from 'react';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Star, Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { Goal, Transaction } from '../App';
import { formatRupiah } from '../App';

type InsightCard = {
  id: number;
  IconComp: React.FC<{ size: number; color: string }>;
  title: string;
  message: string;
  time: string;
  type: 'goal' | 'warning' | 'achievement' | 'tip';
  accentColor: string;
  bgColor: string;
  borderColor: string;
};

const insights: InsightCard[] = [
  {
    id: 1,
    IconComp: Target,
    title: 'Peluang Goal',
    message: 'Side income kamu bulan ini bisa nutup 60% dari goal Laptop kalau dialokasikan penuh. Ini saat yang tepat!',
    time: '2 menit lalu',
    type: 'goal',
    accentColor: '#FF8929',
    bgColor: 'linear-gradient(135deg, #FFF8F0, #FFF3E4)',
    borderColor: 'rgba(255,137,41,0.22)',
  },
  {
    id: 2,
    IconComp: AlertTriangle,
    title: 'Peringatan Pengeluaran',
    message: 'Pengeluaran kategori Hiburan naik 16% dari rata-rata 3 bulan terakhir. Perlu diperhatikan sebelum akhir bulan ya!',
    time: '1 jam lalu',
    type: 'warning',
    accentColor: '#EF4444',
    bgColor: 'linear-gradient(135deg, #FFF5F5, #FEF0F0)',
    borderColor: 'rgba(239,68,68,0.2)',
  },
  {
    id: 3,
    IconComp: Star,
    title: 'Pencapaian Minggu Ini',
    message: 'Kamu konsisten menabung 5 hari berturut-turut minggu ini! Pertahankan — konsistensi adalah kunci kebebasan finansial.',
    time: '2 hari lalu',
    type: 'achievement',
    accentColor: '#22C55E',
    bgColor: 'linear-gradient(135deg, #F0FFF4, #E8FFF1)',
    borderColor: 'rgba(34,197,94,0.22)',
  },
  {
    id: 4,
    IconComp: Lightbulb,
    title: 'Tips Cerdas',
    message: 'Dana Darurat kamu sudah 65% terkumpul! Coba tambahkan Rp 100.000/minggu — goal selesai dalam 5 minggu lagi.',
    time: '3 hari lalu',
    type: 'tip',
    accentColor: '#298DFF',
    bgColor: 'linear-gradient(135deg, #F0F7FF, #E8F3FF)',
    borderColor: 'rgba(41,141,255,0.2)',
  },
];

export function AIAssistantScreen({
  goals,
  transactions,
}: {
  goals: Goal[];
  transactions: Transaction[];
}) {
  const [refreshed, setRefreshed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const topGoal = [...goals].sort((a, b) => a.rank - b.rank)[0];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshed(true);
    }, 1200);
  };

  return (
    <div style={{ paddingBottom: 32, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 20px 20px',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 55%, #1858A0 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Deco circles */}
        <div style={{ position: 'absolute', top: -20, right: -10, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,137,41,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 90, height: 90, borderRadius: '50%', backgroundColor: 'rgba(41,141,255,0.15)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'linear-gradient(135deg, #FF8929, #FFB36B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Sparkles size={17} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(180,210,255,0.75)', margin: 0, fontWeight: 500 }}>Macost AI</p>
                <h1
                  style={{
                    fontSize: 20, fontWeight: 800, color: 'white', margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px',
                  }}
                >
                  Insight Keuanganmu
                </h1>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(180,210,255,0.7)', margin: 0 }}>
              Diperbarui berdasarkan data terbaru
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <RefreshCw
              size={16} color="white"
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>
        </div>

        {/* Quick stats bar */}
        <div
          style={{
            marginTop: 16, display: 'flex', gap: 10, position: 'relative',
          }}
        >
          {[
            { label: 'Pemasukan', value: formatRupiah(totalIncome), color: '#4ade80' },
            { label: 'Pengeluaran', value: formatRupiah(totalExpense), color: '#fb7185' },
            { label: 'Goals Aktif', value: `${goals.length} target`, color: '#FFB36B' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
                padding: '10px 10px', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p style={{ fontSize: 10, color: 'rgba(180,210,255,0.7)', margin: '0 0 2px', fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight feed label */}
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: '0 0 2px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {refreshed ? 'Insight Terbaru' : 'Insight Untukmu'}
            </h2>
            <p style={{ fontSize: 12, color: '#A0A0A8', margin: 0 }}>
              {insights.length} insight dipersonalisasi
            </p>
          </div>
          <div
            style={{
              padding: '5px 10px', borderRadius: 20,
              backgroundColor: '#FFF3E8', border: '1px solid rgba(255,137,41,0.2)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#FF8929', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FF8929' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {insights.map((card, index) => {
          const IconComp = card.IconComp;
          return (
            <div
              key={card.id}
              style={{
                borderRadius: 20, padding: '18px',
                background: card.bgColor,
                border: `1.5px solid ${card.borderColor}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                animation: `fadeInUp 0.4s ease ${index * 0.1}s both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    backgroundColor: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 3px 10px ${card.borderColor}`,
                  }}
                >
                  <IconComp size={22} color={card.accentColor} />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Type badge + time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        color: card.accentColor,
                        border: `1px solid ${card.borderColor}`,
                      }}
                    >
                      {card.title}
                    </span>
                    <span style={{ fontSize: 10, color: '#A0A0A8' }}>{card.time}</span>
                  </div>

                  {/* Message */}
                  <p
                    style={{
                      fontSize: 14, color: '#1E1E1E', margin: 0, lineHeight: 1.65,
                      fontWeight: 500,
                    }}
                  >
                    {card.message}
                  </p>
                </div>
              </div>

              {/* Action for goal card */}
              {card.type === 'goal' && topGoal && (
                <div
                  style={{
                    marginTop: 14, padding: '10px 14px', borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,137,41,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1E1E1E' }}>{topGoal.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FF8929' }}>
                      {Math.round((topGoal.collected / topGoal.target) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'rgba(255,137,41,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%', borderRadius: 99,
                        width: `${Math.round((topGoal.collected / topGoal.target) * 100)}%`,
                        background: 'linear-gradient(90deg, #FF8929, #FFB36B)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Trend indicator for warning */}
              {card.type === 'warning' && (
                <div
                  style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 10,
                    backgroundColor: 'rgba(239,68,68,0.08)',
                  }}
                >
                  <TrendingUp size={14} color="#EF4444" />
                  <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>+16% dari rata-rata</span>
                  <span style={{ fontSize: 12, color: '#717182' }}>di kategori Hiburan</span>
                </div>
              )}

              {/* Streak indicator for achievement */}
              {card.type === 'achievement' && (
                <div
                  style={{
                    marginTop: 12, display: 'flex', gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  {[1, 2, 3, 4, 5].map(day => (
                    <div
                      key={day}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: '#22C55E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 1,
                      }}
                    >
                      <CheckCircle2 size={14} color="white" strokeWidth={2.5} />
                      <span style={{ fontSize: 8, color: 'white', fontWeight: 700 }}>H{day}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{ padding: '20px 20px 0' }}>
        <div
          style={{
            padding: '14px 16px', borderRadius: 16,
            backgroundColor: 'rgba(41,141,255,0.06)',
            border: '1.5px solid rgba(41,141,255,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <Sparkles size={16} color="#298DFF" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#717182', margin: 0, lineHeight: 1.6 }}>
            Insight dihasilkan dari pola keuangan 30 hari terakhir. Semakin rajin kamu mencatat, semakin akurat sarannya!
          </p>
        </div>
      </div>
    </div>
  );
}
