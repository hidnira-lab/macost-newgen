import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Check, GraduationCap, AlertTriangle } from 'lucide-react';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

export function EditProfileScreen({
  profile,
  onSave,
  onBack,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [email] = useState(profile.email); // read-only
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  const canSave = name.trim().length >= 2;

  const handleSave = () => {
    if (!canSave) { setNameError('Nama minimal 2 karakter'); return; }
    setNameError('');
    setSaved(true);
    onSave({ name: name.trim(), email, phone, city });
    setTimeout(() => setSaved(false), 2000);
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14,
    border: '1.5px solid #E0E0E0', backgroundColor: 'white',
    fontSize: 15, color: '#1E1E1E', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 24px',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          flexShrink: 0,
        }}
      >
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
            Edit Profil
          </h1>
        </div>

        {/* Avatar preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #298DFF, #FF8929)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: 30,
                border: '3px solid rgba(255,255,255,0.3)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {name.trim().charAt(0).toUpperCase() || 'R'}
            </div>
            <div
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                backgroundColor: '#298DFF', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <User size={12} color="white" />
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(180,210,255,0.7)', margin: '10px 0 0' }}>
          Ketuk ikon untuk ubah foto
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, backgroundColor: '#F4F6F8', padding: '20px 16px 36px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#A0A0A8', padding: '14px 18px 0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Informasi Pribadi
          </p>

          {/* Full Name */}
          <div style={{ padding: '12px 16px 0' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 5 }}>
              Nama Lengkap
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color={nameError ? '#EF4444' : '#A0A0A8'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(''); }}
                style={{ ...inputBase, border: `1.5px solid ${nameError ? '#EF4444' : '#E0E0E0'}`, backgroundColor: nameError ? '#FEF2F2' : 'white' }}
                placeholder="Nama lengkapmu"
              />
            </div>
            {nameError && <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {nameError}</p>}
          </div>

          {/* Email (read-only) */}
          <div style={{ padding: '12px 16px 0' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 5 }}>
              Email <span style={{ fontSize: 10, color: '#A0A0A8', fontWeight: 400 }}>(tidak dapat diubah)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#C0C0C8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                readOnly
                style={{ ...inputBase, backgroundColor: '#F8F8F8', color: '#A0A0A8', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={{ padding: '12px 16px 0' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 5 }}>
              Nomor Telepon
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#A0A0A8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                style={inputBase}
              />
            </div>
          </div>

          {/* City */}
          <div style={{ padding: '12px 16px 16px' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 5 }}>
              Kota
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="#A0A0A8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Jakarta, Bandung, ..."
                style={inputBase}
              />
            </div>
          </div>
        </div>

        {/* Student info card */}
        <div style={{
          backgroundColor: '#EFF6FF', borderRadius: 16, padding: '14px 16px',
          border: '1.5px solid rgba(41,141,255,0.2)', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <GraduationCap size={22} color="#1D6FA8" strokeWidth={1.8} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1D6FA8', margin: '0 0 2px' }}>Status Mahasiswa Aktif</p>
            <p style={{ fontSize: 12, color: '#5B9CC4', margin: 0 }}>Macost tersedia gratis untuk mahasiswa Indonesia</p>
          </div>
        </div>

        {/* Save button */}
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
          {saved ? <><Check size={18} strokeWidth={3} /> Tersimpan!</> : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
