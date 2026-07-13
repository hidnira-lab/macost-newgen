import { useState } from 'react';
import { Plus, X, Shield, Plane, Heart, Monitor, Trophy, Award } from 'lucide-react';
import type { Goal } from '../App';
import { formatRupiah } from '../App';
import { GoalDetailSheet } from './GoalDetailSheet';

const templates = [
  {
    id: 'emergency', name: 'Dana Darurat', Icon: Shield, color: '#298DFF', bg: '#EEF6FF',
    target: 10000000, months: 12, importance: 5,
  },
  {
    id: 'vacation', name: 'Liburan', Icon: Plane, color: '#FF8929', bg: '#FFF3E8',
    target: 5000000, months: 6, importance: 3,
  },
  {
    id: 'health', name: 'Kesehatan', Icon: Heart, color: '#EF4444', bg: '#FEF2F2',
    target: 3000000, months: 3, importance: 4,
  },
  {
    id: 'laptop', name: 'Laptop/Gadget', Icon: Monitor, color: '#A855F7', bg: '#F5F3FF',
    target: 8000000, months: 8, importance: 4,
  },
];

const rankStyle = (rank: number) => {
  if (rank === 1) return { bg: '#FFFBEB', color: '#D97706', border: 'rgba(255,192,7,0.25)', BadgeIcon: Trophy, badge: 'Prioritas #1' };
  if (rank === 2) return { bg: '#EFF6FF', color: '#2563EB', border: 'rgba(41,141,255,0.15)', BadgeIcon: Award, badge: 'Prioritas #2' };
  return { bg: '#F9FAFB', color: '#6B7280', border: 'rgba(0,0,0,0.06)', BadgeIcon: null, badge: `Prioritas ${rank}` };
};

export function GoalsScreen({
  goals, addGoal, updateGoalProgress,
}: {
  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id' | 'rank' | 'collected'>) => void;
  updateGoalProgress: (id: number, amount: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formImportance, setFormImportance] = useState(3);

  const sortedGoals = [...goals].sort((a, b) => a.rank - b.rank);
  const rawTarget = parseInt(formTarget.replace(/\./g, '') || '0');
  const canSubmit = formName.trim() !== '' && rawTarget > 0 && formDeadline !== '';

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFormTarget(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  const handleTemplate = (tmpl: typeof templates[0]) => {
    const d = new Date();
    d.setMonth(d.getMonth() + tmpl.months);
    setFormName(tmpl.name);
    setFormTarget(tmpl.target.toLocaleString('id-ID'));
    setFormDeadline(d.toISOString().split('T')[0]);
    setFormImportance(tmpl.importance);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    addGoal({ name: formName.trim(), target: rawTarget, deadline: formDeadline, importance: formImportance });
    setShowForm(false);
    setFormName('');
    setFormTarget('');
    setFormDeadline('');
    setFormImportance(3);
  };

  const importanceLabels = ['', 'Rendah', 'Cukup', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
  const importanceColors = ['', '#A0A0A8', '#22C55E', '#F59E0B', '#FF8929', '#EF4444'];

  // Keep selectedGoal in sync when goals state updates (e.g. after addFunds)
  const currentSelectedGoal = selectedGoal
    ? (goals.find(g => g.id === selectedGoal.id) ?? null)
    : null;

  return (
    <div style={{ paddingBottom: 32, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
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
          Target Tabungan
        </h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 15px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #298DFF, #0070E0)',
            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 3px 12px rgba(41,141,255,0.38)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Buat Target
        </button>
      </div>

      {/* Quick Start Templates (always visible at top) */}
      <div style={{ padding: '0 16px 16px' }}>
        <p
          style={{
            fontSize: 12, fontWeight: 700, color: '#A0A0A8', margin: '0 0 10px',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}
        >
          Template Cepat
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {templates.map(tmpl => {
            const IconComp = tmpl.Icon;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleTemplate(tmpl)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 14,
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10, backgroundColor: tmpl.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={18} color={tmpl.color} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E', margin: 0 }}>{tmpl.name}</p>
                  <p style={{ fontSize: 11, color: '#A0A0A8', margin: '1px 0 0' }}>
                    {formatRupiah(tmpl.target)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <div style={{ padding: '0 16px 16px' }}>
          <div
            style={{
              backgroundColor: 'white', borderRadius: 20, padding: '18px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(41,141,255,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p
                style={{
                  fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Buat Target Baru
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', backgroundColor: '#F0F0F0',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={15} color="#717182" />
              </button>
            </div>

            {/* Goal Name */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px' }}>Nama Target</p>
              <input
                type="text"
                placeholder="Contoh: Beli Laptop, Dana Darurat..."
                value={formName}
                onChange={e => setFormName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                  fontSize: 14, color: '#1E1E1E', outline: 'none',
                  boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {/* Target Amount */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px' }}>Jumlah Target</p>
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
                  value={formTarget}
                  onChange={handleTargetChange}
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                    border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                    fontSize: 14, fontWeight: 600, color: '#1E1E1E', outline: 'none',
                    boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Deadline */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px' }}>Target Selesai</p>
              <input
                type="date"
                value={formDeadline}
                onChange={e => setFormDeadline(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                  fontSize: 14, color: '#1E1E1E', outline: 'none',
                  boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {/* Importance Slider */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: 0 }}>
                  Seberapa penting ini untukmu?
                </p>
                <span
                  style={{
                    fontSize: 13, fontWeight: 800,
                    color: importanceColors[formImportance],
                  }}
                >
                  {importanceLabels[formImportance]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={formImportance}
                onChange={e => setFormImportance(Number(e.target.value))}
                style={{ width: '100%', accentColor: importanceColors[formImportance] }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: '#A0A0A8' }}>Tidak terlalu</span>
                <span style={{ fontSize: 10, color: '#A0A0A8' }}>Sangat penting</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: canSubmit ? 'linear-gradient(135deg, #298DFF, #0070E0)' : '#E0E0E0',
                color: canSubmit ? 'white' : '#A0A0A8',
                fontSize: 15, fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 16px rgba(41,141,255,0.35)' : 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Simpan Target
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div style={{ padding: showForm ? '0 16px' : '0 16px' }}>
        <p
          style={{
            fontSize: 12, fontWeight: 700, color: '#A0A0A8', margin: '0 0 12px',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}
        >
          Target Aktifmu ({sortedGoals.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedGoals.map(goal => {
            const pct = Math.round((goal.collected / goal.target) * 100);
            const isHigh = pct >= 50;
            const rs = rankStyle(goal.rank);
            const daysLeft = Math.max(0, Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ));
            const remaining = goal.target - goal.collected;

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                style={{
                  backgroundColor: 'white', borderRadius: 20, padding: '18px',
                  boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
                  border: `1.5px solid ${rs.border}`,
                  cursor: 'pointer',
                }}
              >
                {/* Rank + Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 700,
                        padding: '3px 9px', borderRadius: 8,
                        backgroundColor: rs.bg, color: rs.color,
                        marginBottom: 5,
                      }}
                    >
                      {rs.BadgeIcon && <rs.BadgeIcon size={11} strokeWidth={2.5} />}
                      {rs.badge}
                    </span>
                    <h3
                      style={{
                        fontSize: 17, fontWeight: 700, color: '#1E1E1E', margin: 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {goal.name}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.1,
                        color: isHigh ? '#FF8929' : '#298DFF',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {pct}%
                    </p>
                    <p style={{ fontSize: 10, color: '#A0A0A8', margin: '3px 0 0' }}>
                      {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Sudah lewat'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: 11, backgroundColor: '#F0F0F0', borderRadius: 99,
                    overflow: 'hidden', marginBottom: 10,
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

                {/* Stats Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>
                      {formatRupiah(goal.collected)}
                    </p>
                    <p style={{ fontSize: 11, color: '#A0A0A8', margin: '1px 0 0' }}>terkumpul</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 1, height: 30, backgroundColor: '#F0F0F0',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>
                      {formatRupiah(goal.target)}
                    </p>
                    <p style={{ fontSize: 11, color: '#A0A0A8', margin: '1px 0 0' }}>target</p>
                  </div>
                </div>

                {remaining > 0 && (
                  <div
                    style={{
                      marginTop: 10, padding: '8px 12px', borderRadius: 10,
                      backgroundColor: isHigh ? '#FFF8F3' : '#F0F7FF',
                    }}
                  >
                    <p style={{ fontSize: 12, margin: 0, color: isHigh ? '#996633' : '#1D6FA8' }}>
                      Kurang{' '}
                      <strong>{formatRupiah(remaining)}</strong>
                      {' '}lagi untuk mencapai target!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Detail Sheet */}
      {currentSelectedGoal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <GoalDetailSheet
            goal={currentSelectedGoal}
            onAddFunds={amount => updateGoalProgress(currentSelectedGoal.id, amount)}
            onClose={() => setSelectedGoal(null)}
          />
        </div>
      )}
    </div>
  );
}
