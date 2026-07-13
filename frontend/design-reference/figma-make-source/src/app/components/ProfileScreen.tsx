import { ChevronRight, History, Wallet, SlidersHorizontal, Bell, LogOut, Edit2, Clock, GraduationCap } from 'lucide-react';
import logoIcon from '../../imports/Logo_Macost.svg';
import { formatRupiah } from '../App';

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
  color: string;
  badge?: string;
  danger?: boolean;
};

export function ProfileScreen({
  balance,
  transactionCount,
  goalCount,
  pendingSuggestionsCount,
  onNavigateHistory,
  onNavigateWallets,
  onNavigatePrioritization,
  onNavigatePendingSuggestions,
  onNavigateEditProfile,
  onLogout,
}: {
  balance: number;
  transactionCount: number;
  goalCount: number;
  pendingSuggestionsCount: number;
  onNavigateHistory: () => void;
  onNavigateWallets: () => void;
  onNavigatePrioritization: () => void;
  onNavigatePendingSuggestions: () => void;
  onNavigateEditProfile: () => void;
  onLogout: () => void;
}) {
  const menuItems: MenuItem[] = [
    {
      icon: <History size={20} />,
      label: 'Riwayat Transaksi',
      desc: `${transactionCount} transaksi tercatat`,
      onClick: onNavigateHistory,
      color: '#298DFF',
    },
    {
      icon: <Wallet size={20} />,
      label: 'Kelola Dompet',
      desc: 'Tambah dan atur sumber dana',
      onClick: onNavigateWallets,
      color: '#22C55E',
    },
    {
      icon: <SlidersHorizontal size={20} />,
      label: 'Prioritas Goal',
      desc: 'Atur bobot SAW & strategi',
      onClick: onNavigatePrioritization,
      color: '#FF8929',
    },
    {
      icon: <Clock size={20} />,
      label: 'Saran Tertunda',
      desc: pendingSuggestionsCount > 0 ? `${pendingSuggestionsCount} saran menunggu` : 'Tidak ada saran tertunda',
      onClick: onNavigatePendingSuggestions,
      color: '#F59E0B',
      badge: pendingSuggestionsCount > 0 ? `${pendingSuggestionsCount}` : undefined,
    },
    {
      icon: <Bell size={20} />,
      label: 'Notifikasi',
      desc: 'Pengingat tabungan & tagihan',
      onClick: () => {},
      color: '#A855F7',
      badge: 'Segera',
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: 32 }}>
      {/* Profile hero */}
      <div
        style={{
          padding: '52px 24px 24px',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(41,141,255,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,137,41,0.12)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #298DFF, #FF8929)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 28,
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              border: '3px solid rgba(255,255,255,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              flexShrink: 0,
            }}
          >
            R
          </div>

          {/* Name & info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Rania Putri
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(180,210,255,0.85)', margin: 0 }}>
              rania@mahasiswa.ac.id
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,179,107,0.85)', margin: '3px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <GraduationCap size={13} strokeWidth={2} /> Mahasiswa Aktif · Jakarta
            </p>
          </div>

          {/* Edit button */}
          <button
            onClick={onNavigateEditProfile}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Edit2 size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex', gap: 0,
          margin: '0 16px', marginTop: -20,
          backgroundColor: 'white', borderRadius: 18,
          boxShadow: '0 4px 20px rgba(7,37,72,0.12)',
          overflow: 'hidden',
          position: 'relative', zIndex: 2,
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {[
          { label: 'Saldo', value: formatRupiah(balance), color: '#1E1E1E', highlight: true },
          { label: 'Transaksi', value: `${transactionCount}`, color: '#298DFF', highlight: false },
          { label: 'Target Aktif', value: `${goalCount}`, color: '#FF8929', highlight: false },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1, padding: '14px 8px', textAlign: 'center',
              borderLeft: i > 0 ? '1px solid #F0F0F0' : 'none',
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 800, color: stat.color, margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 11, color: '#A0A0A8', margin: 0, fontWeight: 500 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu section */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Menu Utama
        </p>
        <div style={{ backgroundColor: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.onClick}
              style={{
                width: '100%', padding: '16px 18px',
                borderTop: i > 0 ? '1px solid #F4F4F4' : 'none',
                border: 'none', backgroundColor: 'transparent',
                cursor: item.badge ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                textAlign: 'left', fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  backgroundColor: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', margin: '0 0 2px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 12, color: '#A0A0A8', margin: 0 }}>{item.desc}</p>
              </div>

              {/* Badge or chevron */}
              {item.badge ? (
                <span style={{
                  padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  backgroundColor: /^\d+$/.test(item.badge) ? '#FF8929' : '#F4F4F4',
                  color: /^\d+$/.test(item.badge) ? 'white' : '#A0A0A8',
                }}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight size={18} color="#C0C0C8" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App info */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Tentang Aplikasi
        </p>
        <div style={{ backgroundColor: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={logoIcon}
                alt="Macost"
                style={{ width: 36, height: 36, borderRadius: 10, display: 'block', flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>Macost</p>
                <p style={{ fontSize: 12, color: '#A0A0A8', margin: 0 }}>Versi 1.0.0 · Beta</p>
              </div>
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, backgroundColor: '#F0FDF4', color: '#22C55E', fontWeight: 700 }}>Terbaru</span>
          </div>
          <p style={{ fontSize: 12, color: '#A0A0A8', margin: 0, lineHeight: 1.6 }}>
            Pocket Management Information System untuk mahasiswa Indonesia. Kelola uang saku, side income, dan goals tabunganmu dengan cerdas.
          </p>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '16px 16px 0' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '15px', borderRadius: 16,
            border: '1.5px solid rgba(239,68,68,0.25)',
            backgroundColor: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            color: '#DC2626', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <LogOut size={18} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
