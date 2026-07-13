import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Check, X, Banknote, Smartphone, Building2, Landmark, CreditCard, GraduationCap } from 'lucide-react';
import { formatRupiah } from '../App';

export type Wallet = {
  id: number;
  name: string;
  emoji: string;
  balance: number;
  color: string;
};

const WALLET_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Banknote, Smartphone, Building2, Landmark, CreditCard, GraduationCap,
};

function WalletIconDisplay({ iconName, color, size = 26 }: { iconName: string; color: string; size?: number }) {
  const Icon = WALLET_ICON_MAP[iconName];
  if (Icon) return <Icon size={size} color={color} strokeWidth={1.8} />;
  return <span style={{ fontSize: size * 0.8 }}>{iconName}</span>;
}

const WALLET_PRESETS = [
  { emoji: 'Banknote', name: 'Tunai', color: '#22C55E' },
  { emoji: 'Smartphone', name: 'GoPay', color: '#00AA13' },
  { emoji: 'Smartphone', name: 'OVO', color: '#7B2FBE' },
  { emoji: 'Smartphone', name: 'DANA', color: '#118EEA' },
  { emoji: 'Building2', name: 'Bank BCA', color: '#005BAA' },
  { emoji: 'Landmark', name: 'Bank Mandiri', color: '#F5A623' },
  { emoji: 'CreditCard', name: 'Kartu Kredit', color: '#EF4444' },
  { emoji: 'GraduationCap', name: 'Beasiswa', color: '#FF8929' },
];

function WalletForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Wallet;
  onSave: (name: string, emoji: string, balance: number, color: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? 'Banknote');
  const [balance, setBalance] = useState(initial ? initial.balance.toLocaleString('id-ID') : '');
  const [color, setColor] = useState(initial?.color ?? '#22C55E');

  const rawBalance = parseInt(balance.replace(/\./g, '') || '0');
  const canSave = name.trim() !== '' && rawBalance >= 0;

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setBalance(raw ? parseInt(raw).toLocaleString('id-ID') : '');
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 120,
        backgroundColor: 'rgba(7,37,72,0.55)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '16px 16px 36px', maxHeight: '85vh', overflowY: 'auto' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingTop: 8 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1E1E1E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {initial ? 'Edit Dompet' : 'Tambah Dompet'}
          </p>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="#717182" />
          </button>
        </div>

        {/* Quick presets */}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#717182', margin: '0 0 8px', fontFamily: "'Inter', sans-serif" }}>Pilih Jenis Dompet</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 14 }}>
          {WALLET_PRESETS.map(p => (
            <button
              key={`${p.name}-${p.emoji}`}
              onClick={() => { setName(p.name); setEmoji(p.emoji); setColor(p.color); }}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 20,
                border: `2px solid ${name === p.name ? p.color : '#E0E0E0'}`,
                backgroundColor: name === p.name ? `${p.color}15` : 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: name === p.name ? p.color : '#717182',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <WalletIconDisplay iconName={p.emoji} color={name === p.name ? p.color : '#717182'} size={15} />
              {p.name}
            </button>
          ))}
        </div>

        {/* Custom name */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Nama Dompet</p>
          <input
            type="text"
            placeholder="Nama dompet"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid #E0E0E0', backgroundColor: 'white',
              fontSize: 14, color: '#1E1E1E', outline: 'none',
              boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Balance */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#717182', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>Saldo Saat Ini</p>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#717182' }}>Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={balance}
              onChange={handleBalanceChange}
              style={{
                width: '100%', padding: '12px 12px 12px 38px', borderRadius: 12,
                border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                fontSize: 16, fontWeight: 700, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>

        <button
          onClick={() => canSave && onSave(name.trim(), emoji, rawBalance, color)}
          disabled={!canSave}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: canSave ? 'linear-gradient(135deg, #298DFF, #0070E0)' : '#E0E0E0',
            color: canSave ? 'white' : '#A0A0A8',
            fontSize: 15, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Check size={17} /> {initial ? 'Simpan Perubahan' : 'Tambah Dompet'}
        </button>
      </div>
    </div>
  );
}

export function ManageWalletsScreen({
  wallets,
  onAddWallet,
  onEditWallet,
  onDeleteWallet,
  onBack,
}: {
  wallets: Wallet[];
  onAddWallet: (name: string, emoji: string, balance: number, color: string) => void;
  onEditWallet: (id: number, name: string, emoji: string, balance: number, color: string) => void;
  onDeleteWallet: (id: number) => void;
  onBack: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const totalBalance = wallets.reduce((a, w) => a + w.balance, 0);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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
            Kelola Dompet
          </h1>
        </div>

        {/* Total balance card */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18,
          padding: '16px 20px', border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(180,210,255,0.8)', margin: '0 0 4px', fontWeight: 500 }}>Total Saldo Semua Dompet</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {formatRupiah(totalBalance)}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(180,210,255,0.7)', margin: '4px 0 0' }}>{wallets.length} dompet terhubung</p>
        </div>
      </div>

      {/* Wallet list */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F4F6F8', padding: '14px 12px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {wallets.map(wallet => (
            <div
              key={wallet.id}
              style={{
                backgroundColor: 'white', borderRadius: 18, padding: '16px 18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: `1.5px solid ${wallet.color}22`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  backgroundColor: `${wallet.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${wallet.color}30`,
                }}
              >
                <WalletIconDisplay iconName={wallet.emoji} color={wallet.color} size={26} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {wallet.name}
                </p>
                <p style={{ fontSize: 18, fontWeight: 800, color: wallet.color, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {formatRupiah(wallet.balance)}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setEditingWallet(wallet)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none',
                    backgroundColor: '#F0F7FF', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Edit2 size={15} color="#298DFF" />
                </button>
                <button
                  onClick={() => onDeleteWallet(wallet.id)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none',
                    backgroundColor: '#FEF2F2', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={15} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add wallet button */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: '15px', borderRadius: 18, border: '2px dashed #CBD5E1',
            backgroundColor: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            color: '#717182', fontSize: 15, fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus size={20} color="#A0A0A8" />
          Tambah Dompet Baru
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <WalletForm
          onSave={(name, emoji, balance, color) => { onAddWallet(name, emoji, balance, color); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit form */}
      {editingWallet && (
        <WalletForm
          initial={editingWallet}
          onSave={(name, emoji, balance, color) => { onEditWallet(editingWallet.id, name, emoji, balance, color); setEditingWallet(null); }}
          onClose={() => setEditingWallet(null)}
        />
      )}
    </div>
  );
}
