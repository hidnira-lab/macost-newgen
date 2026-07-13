import { useState } from 'react';
import { ArrowLeft, Check, Info, Star, Target, Banknote, Clock, BarChart2, Zap, AlertTriangle } from 'lucide-react';

export type PriorityStrategy = 'quick-win' | 'importance-first';
export type SAWWeights = {
  importance: number;
  progressGap: number;
  capacity: number;
  urgency: number;
  targetAmount: number;
};

const CRITERIA = [
  {
    key: 'importance' as keyof SAWWeights,
    label: 'Kepentingan Pribadi',
    desc: 'Seberapa penting goal ini untukmu',
    Icon: Star,
    color: '#FF8929',
  },
  {
    key: 'progressGap' as keyof SAWWeights,
    label: 'Jarak ke Target',
    desc: 'Seberapa jauh dari target (% sisa)',
    Icon: Target,
    color: '#298DFF',
  },
  {
    key: 'capacity' as keyof SAWWeights,
    label: 'Kapasitas Tabungan',
    desc: 'Kemampuan menabung saat ini',
    Icon: Banknote,
    color: '#22C55E',
  },
  {
    key: 'urgency' as keyof SAWWeights,
    label: 'Urgensi & Deadline',
    desc: 'Sisa waktu hingga batas waktu',
    Icon: Clock,
    color: '#EF4444',
  },
  {
    key: 'targetAmount' as keyof SAWWeights,
    label: 'Besaran Target',
    desc: 'Nilai total yang harus dicapai',
    Icon: BarChart2,
    color: '#A855F7',
  },
];

export function GoalPrioritizationScreen({
  strategy,
  weights,
  onStrategyChange,
  onWeightsChange,
  onBack,
}: {
  strategy: PriorityStrategy;
  weights: SAWWeights;
  onStrategyChange: (s: PriorityStrategy) => void;
  onWeightsChange: (w: SAWWeights) => void;
  onBack: () => void;
}) {
  const [localWeights, setLocalWeights] = useState<SAWWeights>(weights);
  const [localStrategy, setLocalStrategy] = useState<PriorityStrategy>(strategy);
  const [showInfo, setShowInfo] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = Object.values(localWeights).reduce((a, b) => a + b, 0);
  const isValid = Math.abs(total - 100) < 0.5;

  const handleSliderChange = (key: keyof SAWWeights, newVal: number) => {
    const old = localWeights[key];
    const delta = newVal - old;
    if (delta === 0) return;

    const others = (Object.keys(localWeights) as (keyof SAWWeights)[]).filter(k => k !== key);
    const totalOthers = others.reduce((a, k) => a + localWeights[k], 0);

    const updated = { ...localWeights, [key]: newVal };

    if (totalOthers > 0) {
      // Distribute delta proportionally
      const factor = (totalOthers - delta) / totalOthers;
      for (const k of others) {
        updated[k] = Math.max(0, Math.round(localWeights[k] * factor));
      }
    }

    // Normalize to exactly 100
    const currentSum = (Object.keys(updated) as (keyof SAWWeights)[]).reduce((a, k) => a + updated[k], 0);
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      const adjustKey = others.find(k => updated[k] + diff >= 0) ?? others[0];
      updated[adjustKey] = Math.max(0, updated[adjustKey] + diff);
    }

    setLocalWeights(updated);
  };

  const handleSave = () => {
    onStrategyChange(localStrategy);
    onWeightsChange(localWeights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetDefault = () => {
    setLocalWeights({ importance: 30, progressGap: 25, capacity: 20, urgency: 15, targetAmount: 10 });
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
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
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Prioritas Goal
            </h1>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Info size={16} color="white" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(180,210,255,0.8)', margin: '8px 0 0', paddingLeft: 48 }}>
          Atur bagaimana Macost menyarankan alokasi danamu
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F4F6F8' }}>
        {/* Info banner */}
        {showInfo && (
          <div style={{
            margin: '12px 12px 0',
            backgroundColor: '#EFF6FF', borderRadius: 14,
            padding: '14px 16px', border: '1.5px solid rgba(41,141,255,0.2)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#298DFF', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}><Info size={14} /> Apa itu SAW?</p>
            <p style={{ fontSize: 12, color: '#1D6FA8', margin: 0, lineHeight: 1.6 }}>
              Simple Additive Weighting (SAW) adalah metode pemeringkatan multi-kriteria. Setiap goal mendapat skor berdasarkan bobot yang kamu tentukan, lalu diurutkan otomatis. Jumlah semua bobot harus 100%.
            </p>
          </div>
        )}

        {/* Strategy toggle */}
        <div style={{ margin: '12px 12px 0', backgroundColor: 'white', borderRadius: 18, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: '0 0 12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Strategi Prioritas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              {
                value: 'quick-win' as PriorityStrategy,
                StratIcon: Zap,
                title: 'Quick Win',
                desc: 'Dahulukan goal yang paling dekat selesai untuk menjaga motivasi',
                color: '#22C55E',
              },
              {
                value: 'importance-first' as PriorityStrategy,
                StratIcon: Target,
                title: 'Importance First',
                desc: 'Fokus pada goal paling penting dulu, meski butuh waktu lebih lama',
                color: '#FF8929',
              },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocalStrategy(opt.value)}
                style={{
                  padding: '14px 16px', borderRadius: 14, border: 'none',
                  backgroundColor: localStrategy === opt.value ? `${opt.color}12` : '#F8F8F8',
                  cursor: 'pointer', textAlign: 'left',
                  outline: localStrategy === opt.value ? `2px solid ${opt.color}` : '2px solid transparent',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: localStrategy === opt.value ? opt.color : '#1E1E1E', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                      <opt.StratIcon size={15} strokeWidth={2.5} />{opt.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#717182', margin: 0, lineHeight: 1.5 }}>{opt.desc}</p>
                  </div>
                  {localStrategy === opt.value && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
                      <Check size={13} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SAW Weight sliders */}
        <div style={{ margin: '12px 12px 0', backgroundColor: 'white', borderRadius: 18, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Bobot Kriteria SAW
            </p>
            <button
              onClick={resetDefault}
              style={{ fontSize: 12, color: '#298DFF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              Reset
            </button>
          </div>

          {/* Total bar */}
          <div style={{
            padding: '8px 12px', borderRadius: 10, marginBottom: 14,
            backgroundColor: isValid ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${isValid ? '#22C55E40' : '#EF444440'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ fontSize: 12, color: isValid ? '#16A34A' : '#DC2626', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              {isValid
                ? <><Check size={13} strokeWidth={2.5} /> Bobot sudah seimbang</>
                : <><AlertTriangle size={13} /> Total bobot: {total}% (harus 100%)</>
              }
            </p>
            <p style={{
              fontSize: 18, fontWeight: 900, margin: 0,
              color: isValid ? '#22C55E' : '#EF4444',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {total}%
            </p>
          </div>

          {/* Visual weight bar */}
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 18, gap: 2 }}>
            {CRITERIA.map(c => (
              <div
                key={c.key}
                style={{
                  flex: localWeights[c.key],
                  backgroundColor: c.color,
                  transition: 'flex 0.3s ease',
                  minWidth: localWeights[c.key] > 0 ? 2 : 0,
                }}
              />
            ))}
          </div>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {CRITERIA.map(c => (
              <div key={c.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <c.Icon size={17} color={c.color} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 11, color: '#A0A0A8', margin: 0 }}>{c.desc}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: c.color, fontFamily: "'Plus Jakarta Sans', sans-serif", minWidth: 44, textAlign: 'right' }}>
                    {localWeights[c.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={localWeights[c.key]}
                  onChange={e => handleSliderChange(c.key, Number(e.target.value))}
                  style={{ width: '100%', accentColor: c.color, height: 4 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div style={{ padding: '16px 12px 36px' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '15px', borderRadius: 16, border: 'none',
              background: saved
                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                : 'linear-gradient(135deg, #298DFF, #0070E0)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 6px 20px ${saved ? 'rgba(34,197,94,0.38)' : 'rgba(41,141,255,0.38)'}`,
              fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.3s',
            }}
          >
            {saved ? <><Check size={18} strokeWidth={3} /> Tersimpan!</> : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
}
