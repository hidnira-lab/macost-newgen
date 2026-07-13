import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertTriangle, Check as CheckIcon } from 'lucide-react';
import logoWithText from '../../imports/Logo_Macost_with_Text.svg';

type FieldError = { name?: string; email?: string; password?: string };

export function RegisterScreen({
  onRegister,
  onGoLogin,
}: {
  onRegister: () => void;
  onGoLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!name.trim() || name.trim().length < 2) {
      e.name = 'Nama minimal 2 karakter';
    }
    if (!email.trim()) {
      e.email = 'Email tidak boleh kosong';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Format email tidak valid';
    }
    if (!password) {
      e.password = 'Password tidak boleh kosong';
    } else if (password.length < 6) {
      e.password = 'Password minimal 6 karakter';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister();
    }, 1000);
  };

  const inputStyle = (hasError?: boolean) => ({
    width: '100%' as const, padding: '13px 14px 13px 42px', borderRadius: 14,
    border: `1.5px solid ${hasError ? '#EF4444' : '#E0E0E0'}`,
    backgroundColor: hasError ? '#FEF2F2' : 'white',
    fontSize: 15, color: '#1E1E1E', outline: 'none',
    boxSizing: 'border-box' as const, fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
  });

  return (
    <div
      style={{
        height: '100%', backgroundColor: '#FCFCFC',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'auto',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          height: 180, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 0 28px',
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -10, width: 130, height: 130, borderRadius: '50%', backgroundColor: 'rgba(41,141,255,0.18)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,137,41,0.12)' }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <img
            src={logoWithText}
            alt="Macost"
            style={{ height: 38, width: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '24px 20px 32px' }}>
        <h2
          style={{
            fontSize: 22, fontWeight: 700, color: '#1E1E1E', margin: '0 0 4px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Buat Akun Baru
        </h2>
        <p style={{ fontSize: 14, color: '#717182', margin: '0 0 24px' }}>
          Mulai kelola keuanganmu hari ini
        </p>

        {/* Full Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 6 }}>
            Nama Lengkap
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={16} color={errors.name ? '#EF4444' : '#A0A0A8'}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Nama lengkap kamu"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
              style={inputStyle(!!errors.name)}
            />
          </div>
          {errors.name && (
            <p style={{ fontSize: 12, color: '#EF4444', margin: '5px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={16} color={errors.email ? '#EF4444' : '#A0A0A8'}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              style={inputStyle(!!errors.email)}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 12, color: '#EF4444', margin: '5px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#717182', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={16} color={errors.password ? '#EF4444' : '#A0A0A8'}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
              style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              {showPass ? <EyeOff size={16} color="#A0A0A8" /> : <Eye size={16} color="#A0A0A8" />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: '#EF4444', margin: '5px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {errors.password}</p>
          )}
          {password && password.length >= 6 && !errors.password && (
            <p style={{ fontSize: 12, color: '#22C55E', margin: '5px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} strokeWidth={2.5} /> Password aman</p>
          )}
        </div>

        {/* Terms note */}
        <p style={{ fontSize: 12, color: '#A0A0A8', margin: '0 0 18px', lineHeight: 1.6, textAlign: 'center' }}>
          Dengan mendaftar, kamu menyetujui{' '}
          <span style={{ color: '#298DFF', fontWeight: 600 }}>Syarat & Ketentuan</span>
          {' '}dan{' '}
          <span style={{ color: '#298DFF', fontWeight: 600 }}>Kebijakan Privasi</span>
          {' '}Macost.
        </p>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none',
            background: loading ? '#C0D8F8' : 'linear-gradient(135deg, #298DFF, #0070E0)',
            color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(41,141,255,0.38)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                animation: 'spin 1s linear infinite',
              }} />
              Membuat Akun...
            </>
          ) : 'Buat Akun'}
        </button>

        {/* Login link */}
        <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 14, color: '#717182' }}>
          Sudah punya akun?{' '}
          <button
            onClick={onGoLogin}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#298DFF', fontWeight: 700, fontSize: 14, fontFamily: "'Inter', sans-serif" }}
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  );
}
