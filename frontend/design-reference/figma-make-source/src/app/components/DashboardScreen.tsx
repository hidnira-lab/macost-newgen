import { useState } from 'react';
import { X, ChevronDown, AlertTriangle, Utensils, Car, Tv2, BookOpen, Home } from 'lucide-react';
import type { Transaction, Goal } from '../App';
import { formatRupiah } from '../App';

const expenseBreakdown = [
  { name: 'Makanan', value: 35, color: '#FF8929', Icon: Utensils },
  { name: 'Transport', value: 17, color: '#298DFF', Icon: Car },
  { name: 'Hiburan', value: 16, color: '#A855F7', Icon: Tv2 },
  { name: 'Pendidikan', value: 12, color: '#22C55E', Icon: BookOpen },
  { name: 'Tempat Tinggal', value: 20, color: '#072548', Icon: Home },
];

const monthlyTrend = [
  { month: 'Mei', Pemasukan: 1800000, Pengeluaran: 900000 },
  { month: 'Jun', Pemasukan: 2000000, Pengeluaran: 1100000 },
  { month: 'Jul', Pemasukan: 2000000, Pengeluaran: 1500000 },
];

// Custom SVG donut chart — avoids recharts internal duplicate-key bug
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const cx = 75, cy = 75, r = 55, innerR = 33;
  let angle = -90;
  const slices = data.map(d => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    angle += sweep;
    return { ...d, start, sweep };
  });

  const arc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return { x1, y1, x2, y2, large };
  };

  return (
    <svg viewBox="0 0 150 150" width="100%" height="100%">
      {slices.map(s => {
        const end = s.start + s.sweep;
        const o = arc(cx, cy, r, s.start, end);
        const i = arc(cx, cy, innerR, s.start, end);
        const d = [
          `M ${o.x1} ${o.y1}`,
          `A ${r} ${r} 0 ${o.large} 1 ${o.x2} ${o.y2}`,
          `L ${i.x2} ${i.y2}`,
          `A ${innerR} ${innerR} 0 ${i.large} 0 ${i.x1} ${i.y1}`,
          'Z',
        ].join(' ');
        return <path key={s.name} d={d} fill={s.color} stroke="#FCFCFC" strokeWidth="2" />;
      })}
    </svg>
  );
}

const formatShort = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
  return `${v}`;
};

type BarRow = { month: string; Pemasukan: number; Pengeluaran: number };

function BarChartSVG({ data }: { data: BarRow[] }) {
  const W = 300, H = 160, padL = 36, padB = 24, padT = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const maxVal = Math.max(...data.flatMap(d => [d.Pemasukan, d.Pengeluaran]));
  const rounded = Math.ceil(maxVal / 500000) * 500000;
  const yTicks = [0, rounded / 2, rounded];
  const groupW = chartW / data.length;
  const barW = Math.min(18, groupW * 0.3);
  const gap = 4;

  const yPos = (v: number) => padT + chartH - (v / rounded) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      {/* Y gridlines + labels */}
      {yTicks.map(tick => {
        const y = yPos(tick);
        return (
          <g key={`y-${tick}`}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F0F0F0" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#A0A0A8">{formatShort(tick)}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = padL + groupW * i + groupW / 2;
        const x1 = cx - barW - gap / 2;
        const x2 = cx + gap / 2;
        const h1 = (d.Pemasukan / rounded) * chartH;
        const h2 = (d.Pengeluaran / rounded) * chartH;
        const y1 = yPos(d.Pemasukan);
        const y2 = yPos(d.Pengeluaran);
        const rx = 4;
        return (
          <g key={d.month}>
            {/* Pemasukan bar */}
            <rect x={x1} y={y1} width={barW} height={h1} fill="#298DFF" rx={rx} ry={rx} />
            {/* Pengeluaran bar */}
            <rect x={x2} y={y2} width={barW} height={h2} fill="#FF8929" rx={rx} ry={rx} />
            {/* X label */}
            <text x={cx} y={H - 4} textAnchor="middle" fontSize="11" fill="#717182" fontWeight="500">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function DashboardScreen({
  transactions, goals,
}: {
  transactions: Transaction[];
  goals: Goal[];
}) {
  const [period, setPeriod] = useState('Bulan Ini');
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const totalBalance = transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount), 0
  );
  const topGoals = [...goals].sort((a, b) => a.rank - b.rank).slice(0, 2);

  return (
    <div style={{ paddingBottom: 24, fontFamily: "'Inter', sans-serif" }}>
      {/* Header + Period Filter */}
      <div
        style={{
          padding: '22px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <h1
          style={{
            fontSize: 22, fontWeight: 700, color: '#1E1E1E', margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Dashboard
        </h1>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 13px', borderRadius: 11,
              border: '1.5px solid #E0E0E0', backgroundColor: 'white',
              fontSize: 13, fontWeight: 600, color: '#1E1E1E', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {period} <ChevronDown size={14} />
          </button>
          {showDropdown && (
            <div
              style={{
                position: 'absolute', right: 0, top: '110%',
                backgroundColor: 'white', borderRadius: 14,
                boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                border: '1px solid rgba(0,0,0,0.08)', zIndex: 10,
                minWidth: 170, overflow: 'hidden',
              }}
            >
              {['Bulan Ini', 'Bulan Lalu', 'Kustom'].map(p => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setShowDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '13px 16px',
                    textAlign: 'left', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: p === period ? 700 : 400,
                    color: p === period ? '#298DFF' : '#1E1E1E',
                    backgroundColor: p === period ? '#EEF6FF' : 'white',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 1. Expense Breakdown */}
      <div style={{ margin: '0 16px 14px' }}>
        <div
          style={{
            backgroundColor: 'white', borderRadius: 20, padding: '18px',
            boxShadow: '0 2px 14px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Breakdown Pengeluaran
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 150, height: 150, flexShrink: 0 }}>
              <DonutChart data={expenseBreakdown} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {expenseBreakdown.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <item.Icon size={13} color={item.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <div
                    style={{
                      flex: 1, height: 6, backgroundColor: '#F0F0F0',
                      borderRadius: 99, overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%', borderRadius: 99,
                        width: `${item.value}%`, backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E1E1E', minWidth: 32, textAlign: 'right' }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Goals Progress */}
      <div style={{ margin: '0 16px 14px' }}>
        <div
          style={{
            backgroundColor: 'white', borderRadius: 20, padding: '18px',
            boxShadow: '0 2px 14px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Progress Target Aktif
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topGoals.map(goal => {
              const pct = Math.round((goal.collected / goal.target) * 100);
              const isHigh = pct >= 50;
              return (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 7, backgroundColor: '#F2F2F2', color: '#717182',
                        }}
                      >
                        #{goal.rank}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E' }}>{goal.name}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 14, fontWeight: 800,
                        color: isHigh ? '#FF8929' : '#298DFF',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 9, backgroundColor: '#F0F0F0',
                      borderRadius: 99, overflow: 'hidden', marginBottom: 5,
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
                  <p style={{ fontSize: 11, color: '#A0A0A8', margin: 0 }}>
                    {formatRupiah(goal.collected)} / {formatRupiah(goal.target)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Monthly Trend */}
      <div style={{ margin: '0 16px 14px' }}>
        <div
          style={{
            backgroundColor: 'white', borderRadius: 20, padding: '18px',
            boxShadow: '0 2px 14px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Tren 3 Bulan Terakhir
          </h3>
          <div style={{ height: 180 }}>
            <BarChartSVG data={monthlyTrend} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, justifyContent: 'center' }}>
            {[
              { color: '#298DFF', label: 'Pemasukan' },
              { color: '#FF8929', label: 'Pengeluaran' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color }} />
                <span style={{ fontSize: 12, color: '#717182', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Overspending Alert (dismissible) */}
      {!alertDismissed && (
        <div style={{ margin: '0 16px 14px' }}>
          <div
            style={{
              borderRadius: 16, padding: '14px 14px',
              background: 'linear-gradient(135deg, #FFF4E8, #FFE9CC)',
              border: '1.5px solid rgba(255,137,41,0.28)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}
          >
            <AlertTriangle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#B45309', margin: '0 0 3px' }}>
                Pengeluaran Melebihi Rata-Rata
              </p>
              <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.55 }}>
                Pengeluaran Hiburan bulan ini 16% dari total — lebih tinggi dari rata-rata 3 bulan terakhirmu.
              </p>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#B45309', padding: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Total Balance (small, intentionally near bottom) */}
      <div style={{ margin: '0 16px' }}>
        <div
          style={{
            backgroundColor: '#F6F8FA', borderRadius: 14, padding: '13px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: 13, color: '#717182', margin: 0, fontWeight: 500 }}>Total Saldo</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1E1E1E', margin: 0 }}>
            {formatRupiah(totalBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
