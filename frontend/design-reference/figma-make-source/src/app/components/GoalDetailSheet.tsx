import { useState } from 'react';
import { X, Plus, Calendar, Target, TrendingUp, Check, Sprout, Leaf, Flower2, TreeDeciduous, Trophy } from 'lucide-react';
import type { Goal } from '../App';
import { formatRupiah } from '../App';

// ─── Pixel-Art Plant Illustration ────────────────────────────────────────────

const PX = 7;
const GW = 14;
const GH = 17;

function R(x: number, y: number, w: number, h: number, fill: string, key: string) {
  return <rect key={key} x={x * PX} y={y * PX} width={w * PX} height={h * PX} fill={fill} />;
}

// Natural green leaves + brand-orange flowers
const C = {
  s:  '#1A5E2A',  // stem dark green
  s2: '#2E7D32',  // stem highlight
  l1: '#388E3C',  // leaf primary
  l2: '#66BB6A',  // leaf highlight (lit top-left)
  l3: '#1B5E20',  // leaf shadow (dark underside)
  fp: '#FF8929',  // flower petal – brand orange
  fl: '#FFC107',  // flower gold center
  pt: '#8B5E3C',  // pot terracotta body
  pl: '#C4834A',  // pot rim / left highlight
  pb: '#5C3A1E',  // pot right shadow edge
  so: '#3E2208',  // soil dark
  sL: '#6B4019',  // soil lighter patch
  sk: '#2D1403',  // seed dark brown
  sl: '#7B4820',  // seed lighter
};

// Shared pot + soil base rendered under every stage
const potBase = [
  R(2, 11, 10, 1, C.so,      'soil'),   // dark soil band
  R(3, 11,  5, 1, C.sL,      'soilH'),  // lighter soil highlight
  R(1, 12, 12, 1, C.pl,      'rim'),    // wide pot rim
  R(1, 12,  2, 1, '#D9A563', 'rimH'),   // rim left highlight pixel
  R(2, 13, 10, 4, C.pt,      'pot'),    // pot body
  R(2, 13,  1, 4, C.pl,      'potH'),   // pot left highlight strip
  R(11,13,  1, 4, C.pb,      'potS'),   // pot right shadow strip
];

function PixelArt({ pct }: { pct: number }) {
  const stage = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;

  return (
    <svg
      viewBox={`0 0 ${GW * PX} ${GH * PX}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', width: '100%', maxWidth: 148 }}
    >
      {/* ── STAGE 0 · Seedling just emerged ─────────────────────────────── */}
      {stage === 0 && [
        ...potBase,
        // Seed peeking from soil (center)
        R(6,  9, 2, 2, C.sk,  'sd'),
        R(6,  9, 2, 1, C.sl,  'sdh'),
        // Thin single stem going up
        R(7,  5, 1, 4, C.s,   'st'),
        // Left first leaf (slightly higher, unfurling left)
        R(4,  6, 3, 1, C.l1,  'lL'),
        R(4,  6, 1, 1, C.l2,  'lLh'),
        // Right first leaf (slightly lower, asymmetric)
        R(8,  7, 3, 1, C.l1,  'lR'),
        R(10, 7, 1, 1, C.l2,  'lRh'),
        // Tiny new bud at tip
        R(6,  3, 3, 2, C.l1,  'bud'),
        R(7,  2, 1, 1, C.l2,  'budh'),
        R(7,  4, 1, 1, C.s2,  'buds'),
      ]}

      {/* ── STAGE 1 · Young plant with two branches ──────────────────────── */}
      {stage === 1 && [
        ...potBase,
        // Main stem – tall, 1 cell wide
        R(7,  1, 1, 10, C.s,  'st'),
        R(7,  1, 1,  1, C.s2, 'stH'),
        // Left branch at y=8
        R(3,  8, 4,  1, C.s,  'bL'),
        // Left leaf cluster
        R(0,  5, 5,  3, C.l1, 'lL'),
        R(0,  5, 2,  1, C.l2, 'lLh1'),
        R(0,  6, 1,  1, C.l2, 'lLh2'),
        R(0,  8, 3,  1, C.l3, 'lLs'),
        // Right branch at y=5
        R(8,  5, 4,  1, C.s,  'bR'),
        // Right leaf cluster
        R(9,  2, 4,  3, C.l1, 'lR'),
        R(11, 2, 2,  1, C.l2, 'lRh'),
        R(9,  5, 3,  1, C.l3, 'lRs'),
        // Crown leaves
        R(5,  0, 5,  2, C.l1, 'lt'),
        R(6,  0, 3,  1, C.l2, 'lth'),
        R(4,  2, 2,  1, C.l1, 'ltL'),
        R(10, 1, 2,  1, C.l1, 'ltR'),
        // First small flower bud
        R(6,  1, 2,  2, C.fp, 'fb'),
        R(7,  2, 1,  1, C.fl, 'fbc'),
      ]}

      {/* ── STAGE 2 · Established plant with 3 open flowers ─────────────── */}
      {stage === 2 && [
        ...potBase,
        // Thick trunk (2 wide) with highlight
        R(6,  3, 2,  8, C.s,  'tr'),
        R(6,  3, 1,  8, C.s2, 'trH'),
        // Left branch at y=7
        R(2,  7, 4,  1, C.s,  'bL'),
        // Left leaf cluster
        R(0,  4, 6,  4, C.l1, 'lL'),
        R(0,  4, 2,  2, C.l2, 'lLh'),
        R(1,  8, 4,  1, C.l3, 'lLs'),
        R(0,  6, 1,  2, C.l2, 'lLe'),
        // Right branch at y=5
        R(8,  5, 4,  1, C.s,  'bR'),
        // Right leaf cluster
        R(8,  2, 6,  4, C.l1, 'lR'),
        R(11, 2, 2,  2, C.l2, 'lRh'),
        R(9,  6, 4,  1, C.l3, 'lRs'),
        R(13, 3, 1,  3, C.l2, 'lRe'),
        // Top crown
        R(4,  0, 6,  3, C.l1, 'lT'),
        R(5,  0, 4,  1, C.l2, 'lTh'),
        R(3,  1, 2,  2, C.l1, 'lTL'),
        R(9,  1, 2,  2, C.l1, 'lTR'),
        // 3 open flowers (2×2 petal + 1×1 gold center)
        R(0,  5, 2,  2, C.fp, 'f1'), R(1,  6, 1, 1, C.fl, 'f1c'),
        R(11, 2, 2,  2, C.fp, 'f2'), R(12, 3, 1, 1, C.fl, 'f2c'),
        R(6,  0, 2,  2, C.fp, 'f3'), R(7,  1, 1, 1, C.fl, 'f3c'),
      ]}

      {/* ── STAGE 3 · Full lush bloom ────────────────────────────────────── */}
      {stage === 3 && [
        ...potBase,
        // Trunk (mostly hidden by foliage)
        R(5,  6, 4,  5, C.s,  'tr'),
        R(5,  6, 2,  5, C.s2, 'trH'),
        // Bottom shadow layer
        R(1,  8,12,  3, C.l3, 'fB'),
        R(0,  9, 1,  2, C.l3, 'fBL'),
        R(13, 9, 1,  2, C.l3, 'fBR'),
        // Mid foliage layer
        R(0,  5,14,  4, C.l1, 'fM'),
        R(0,  5, 3,  2, C.l2, 'fMhL'),
        R(11, 5, 3,  2, C.l2, 'fMhR'),
        R(2,  9, 4,  1, C.l3, 'fMs1'),
        R(8,  9, 4,  1, C.l3, 'fMs2'),
        // Top dome
        R(1,  1,12,  5, C.l1, 'fT'),
        R(2,  0,10,  2, C.l2, 'fTh'),
        R(3,  5, 4,  1, C.l3, 'fTs1'),
        R(7,  5, 4,  1, C.l3, 'fTs2'),
        // Corner fillers to round the dome
        R(0,  7, 1,  1, C.l1, 'cBL'),
        R(13, 7, 1,  1, C.l1, 'cBR'),
        R(0,  3, 1,  2, C.l1, 'cTL'),
        R(13, 3, 1,  2, C.l1, 'cTR'),
        // 7 flowers distributed across plant
        R(0,  6, 2,  2, C.fp, 'f1'), R(1,  7, 1, 1, C.fl, 'f1c'),
        R(12, 6, 2,  2, C.fp, 'f2'), R(12, 7, 1, 1, C.fl, 'f2c'),
        R(4,  4, 2,  2, C.fp, 'f3'), R(5,  5, 1, 1, C.fl, 'f3c'),
        R(8,  3, 2,  2, C.fp, 'f4'), R(9,  4, 1, 1, C.fl, 'f4c'),
        R(6,  0, 2,  2, C.fp, 'f5'), R(7,  1, 1, 1, C.fl, 'f5c'),
        R(1,  2, 2,  2, C.fp, 'f6'), R(2,  3, 1, 1, C.fl, 'f6c'),
        R(10, 1, 2,  2, C.fp, 'f7'), R(11, 2, 1, 1, C.fl, 'f7c'),
        // Sparkle pixels at 90%+
        ...(pct >= 90 ? [
          R(0,  0, 1, 1, C.fl, 'sp1'),
          R(13, 0, 1, 1, C.fl, 'sp2'),
          R(0, 10, 1, 1, C.fl, 'sp3'),
          R(13,10, 1, 1, C.fl, 'sp4'),
        ] : []),
      ]}
    </svg>
  );
}

// ─── Stage themes ─────────────────────────────────────────────────────────────

type StageTheme = {
  label: string;
  StageIcon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  desc: string;
  outerBg: string;
  illustBg: string;
  accentColor: string;
  textColor: string;
  barColor: string;
  borderColor: string;
};

const stageInfo = (pct: number): StageTheme => {
  if (pct >= 100) return {
    label: 'Tercapai!',
    StageIcon: Trophy,
    desc: 'Selamat! Goal kamu berhasil terpenuhi!',
    outerBg: 'linear-gradient(145deg, #FFFDE7 0%, #FFF9C4 100%)',
    illustBg: 'linear-gradient(180deg, #FFFFF5 0%, #FFFBDF 70%, #FFF5E0 100%)',
    accentColor: '#F57F17',
    textColor: '#E65100',
    barColor: 'linear-gradient(90deg, #FF8929, #FFD700)',
    borderColor: 'rgba(245,127,23,0.4)',
  };
  if (pct < 25) return {
    label: 'Benih',
    StageIcon: Sprout,
    desc: 'Baru dimulai — setiap tabungan berarti!',
    outerBg: 'linear-gradient(145deg, #F1F8E9 0%, #DCEDC8 100%)',
    illustBg: 'linear-gradient(180deg, #F6FFF5 0%, #EDF8E8 70%, #F5EEE4 100%)',
    accentColor: '#558B2F',
    textColor: '#33691E',
    barColor: 'linear-gradient(90deg, #8BC34A, #C5E1A5)',
    borderColor: 'rgba(139,195,74,0.4)',
  };
  if (pct < 50) return {
    label: 'Tumbuh',
    StageIcon: Leaf,
    desc: 'Momentum terbentuk — terus semangat!',
    outerBg: 'linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 100%)',
    illustBg: 'linear-gradient(180deg, #F4FFF4 0%, #E8F5E8 70%, #F2EDE6 100%)',
    accentColor: '#2E7D32',
    textColor: '#1B5E20',
    barColor: 'linear-gradient(90deg, #43A047, #81C784)',
    borderColor: 'rgba(67,160,71,0.4)',
  };
  if (pct < 75) return {
    label: 'Berkembang',
    StageIcon: Flower2,
    desc: 'Sudah lebih dari setengah jalan!',
    outerBg: 'linear-gradient(145deg, #FFF8E1 0%, #FFECB3 100%)',
    illustBg: 'linear-gradient(180deg, #FFFFF2 0%, #FFFBEA 70%, #FBF3E4 100%)',
    accentColor: '#F57F17',
    textColor: '#E65100',
    barColor: 'linear-gradient(90deg, #FFA726, #FFD54F)',
    borderColor: 'rgba(245,127,23,0.35)',
  };
  return {
    label: 'Hampir Terwujud',
    StageIcon: TreeDeciduous,
    desc: 'Finish line sudah sangat dekat!',
    outerBg: 'linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 100%)',
    illustBg: 'linear-gradient(180deg, #FFFFF5 0%, #FFF8EE 70%, #FEF0E4 100%)',
    accentColor: '#E65100',
    textColor: '#BF360C',
    barColor: 'linear-gradient(90deg, #FF8929, #FFD700)',
    borderColor: 'rgba(255,137,41,0.45)',
  };
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function GoalDetailSheet({
  goal,
  onAddFunds,
  onClose,
}: {
  goal: Goal;
  onAddFunds: (amount: number) => void;
  onClose: () => void;
}) {
  const [addingFunds, setAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  const pct = Math.min(100, Math.round((goal.collected / goal.target) * 100));
  const remaining = goal.target - goal.collected;
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000));
  const info = stageInfo(pct);
  const milestones = [25, 50, 75];

  const handleFundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFundAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  const rawFund = parseInt(fundAmount.replace(/\./g, '') || '0');

  const handleAddFunds = () => {
    if (!rawFund) return;
    onAddFunds(rawFund);
    setFundAmount('');
    setAddingFunds(false);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 110,
        backgroundColor: 'rgba(7,37,72,0.55)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
        fontFamily: "'Inter', sans-serif",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#FCFCFC',
          borderRadius: '24px 24px 0 0',
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 -12px 48px rgba(7,37,72,0.22)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>

        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#717182" />
          </button>
        </div>

        {/* ── Progress visual section ────────────────────────────────────── */}
        <div
          style={{
            margin: '6px 16px 0',
            borderRadius: 22, padding: '18px 16px 16px',
            background: info.outerBg,
            border: `1.5px solid ${info.borderColor}`,
          }}
        >
          {/* Stage badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 16px', borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.75)',
                border: `1.5px solid ${info.borderColor}`,
                fontSize: 13, fontWeight: 800,
                color: info.accentColor,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              <info.StageIcon size={14} color={info.accentColor} strokeWidth={2.2} />
              {info.label}
            </div>
          </div>

          {/* Illustration frame */}
          <div
            style={{
              background: info.illustBg,
              borderRadius: 16,
              padding: '18px 20px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -2px 8px rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.8)',
              marginBottom: 14,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle dot pattern in illustration background */}
            <div
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, ${info.accentColor}20 1px, transparent 1px)`,
                backgroundSize: '14px 14px',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PixelArt pct={pct} />
            </div>
          </div>

          {/* Motivational message */}
          <p style={{ fontSize: 13, color: info.textColor, margin: '0 0 14px', textAlign: 'center', fontWeight: 600, lineHeight: 1.4 }}>
            {info.desc}
          </p>

          {/* Percentage + progress bar card */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.65)',
              borderRadius: 16, padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            {/* Big percentage */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 10, justifyContent: 'center' }}>
              <span
                style={{
                  fontSize: 56, fontWeight: 900,
                  color: info.accentColor,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-3px', lineHeight: 1,
                }}
              >
                {pct}
              </span>
              <span style={{ fontSize: 24, fontWeight: 700, color: info.accentColor, opacity: 0.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                %
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 10, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 7 }}>
              <div
                style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.max(pct, 2)}%`,
                  background: info.barColor,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 0 8px ${info.accentColor}55`,
                }}
              />
            </div>

            {/* Milestone tick marks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2%' }}>
              {milestones.map(m => (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div
                    style={{
                      width: 4, height: 4, borderRadius: '50%',
                      backgroundColor: pct >= m ? info.accentColor : '#CACACE',
                      transition: 'background-color 0.4s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9, fontWeight: 700,
                      color: pct >= m ? info.accentColor : '#B8B8C0',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {m}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal name + rank */}
        <div style={{ padding: '16px 16px 0' }}>
          <h2
            style={{
              fontSize: 20, fontWeight: 800, color: '#1E1E1E', margin: '0 0 4px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {goal.name}
          </h2>
          <p style={{ fontSize: 13, color: '#A0A0A8', margin: 0 }}>
            Prioritas #{goal.rank} · Kepentingan {goal.importance}/5
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px' }}>
          {[
            { Icon: TrendingUp, label: 'Terkumpul', value: formatRupiah(goal.collected), color: '#22C55E' },
            { Icon: Target, label: 'Target', value: formatRupiah(goal.target), color: '#298DFF' },
            { Icon: X, label: 'Sisa', value: remaining > 0 ? formatRupiah(remaining) : 'Tercapai!', color: remaining > 0 ? '#FF8929' : '#22C55E' },
            { Icon: Calendar, label: 'Deadline', value: `${daysLeft} hari lagi`, color: daysLeft < 30 ? '#EF4444' : '#717182' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'white', borderRadius: 14, padding: '12px 14px',
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <p style={{ fontSize: 11, color: '#A0A0A8', margin: '0 0 3px', fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add funds section */}
        <div style={{ padding: '0 16px 36px' }}>
          {addingFunds ? (
            <div
              style={{
                backgroundColor: '#F0F7FF', borderRadius: 16, padding: '16px',
                border: '1.5px solid rgba(41,141,255,0.2)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: '#717182', margin: '0 0 10px' }}>
                Tambah Dana ke Goal
              </p>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#717182' }}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={fundAmount}
                  onChange={handleFundChange}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: 12,
                    border: '2px solid #298DFF', backgroundColor: 'white',
                    fontSize: 18, fontWeight: 700, color: '#1E1E1E', outline: 'none',
                    boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setAddingFunds(false); setFundAmount(''); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12,
                    border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                    color: '#717182', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={!rawFund}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                    background: rawFund ? 'linear-gradient(135deg, #298DFF, #0070E0)' : '#E0E0E0',
                    color: rawFund ? 'white' : '#A0A0A8',
                    fontSize: 14, fontWeight: 700, cursor: rawFund ? 'pointer' : 'not-allowed',
                    fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Check size={15} strokeWidth={2.5} /> Tambahkan
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingFunds(true)}
              style={{
                width: '100%', padding: '15px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #FF8929, #E86800)',
                color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,137,41,0.38)',
                fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Tambah Dana ke Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
