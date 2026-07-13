import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Zap } from 'lucide-react';
import logoWithText from '../../imports/Logo_Macost_with_Text.svg';

const DEMO_EMAIL = 'demo@macost.com';
const DEMO_PASSWORD = 'demo1234';

type FieldError = { email?: string; password?: string };

export function LoginScreen({
  onLogin,
  onGoRegister,
}: {
  onLogin: () => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFormat = (): boolean => {
    const e: FieldError = {};
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
    setAuthError('');
    if (!validateFormat()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        onLogin();
      } else {
        setAuthError('Email atau password salah. Coba lagi.');
      }
    }, 900);
  };

  return (
    <div
      style={{
        height: '100%', backgroundColor: '#FCFCFC',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'auto',
      }}
    >
      {/* Top Wave / Decoration */}
      <div
        style={{
          height: 220, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 0 32px',
        }}
      >
        {/* Circles */}
        <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(41,141,255,0.2)' }} />
        <div style={{ position: 'absolute', top: 60, left: -30, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,137,41,0.15)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <img
            src={logoWithText}
            alt="Macost"
            style={{ height: 44, width: 'auto', display: 'block', margin: '0 auto 8px' }}
          />
          <p style={{ fontSize: 13, color: 'rgba(180,210,255,0.8)', margin: '4px 0 0' }}>
            Kelola keuangan mahasiswamu
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ flex: 1, padding: '28px 20px 32px' }}>
        <h2
          style={{
            fontSize: 22, fontWeight: 700, color: '#1E1E1E', margin: '0 0 6px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Selamat Datang!
        </h2>
        <p style={{ fontSize: 14, color: '#717182', margin: '0 0 28px' }}>
          Masuk ke akun Macost kamu
        </p>

        {/* Auth error banner */}
        {authError && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 12, marginBottom: 20,
              backgroundColor: '#FEF2F2', border: '1.5px solid rgba(239,68,68,0.25)',
            }}
          >
            <Lock size={16} color="#DC2626" />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', margin: 0 }}>{authError}</p>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
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
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); setAuthError(''); }}
              style={{
                width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14,
                border: `1.5px solid ${errors.email ? '#EF4444' : '#E0E0E0'}`,
                backgroundColor: errors.email ? '#FEF2F2' : 'white',
                fontSize: 15, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 12, color: '#EF4444', margin: '5px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 10 }}>
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
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); setAuthError(''); }}
              style={{
                width: '100%', padding: '13px 44px 13px 42px', borderRadius: 14,
                border: `1.5px solid ${errors.password ? '#EF4444' : '#E0E0E0'}`,
                backgroundColor: errors.password ? '#FEF2F2' : 'white',
                fontSize: 15, color: '#1E1E1E', outline: 'none',
                boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.2s',
              }}
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
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginBottom: 28 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#298DFF', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            Lupa Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none',
            background: loading ? '#C0D8F8' : 'linear-gradient(135deg, #298DFF, #0070E0)',
            color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(41,141,255,0.38)',
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
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
              Masuk...
            </>
          ) : 'Masuk'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
          <span style={{ fontSize: 12, color: '#A0A0A8', fontWeight: 500 }}>atau</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
        </div>

        {/* Demo login */}
        <button
          onClick={onLogin}
          style={{
            width: '100%', padding: '13px', borderRadius: 16,
            border: '1.5px solid rgba(41,141,255,0.3)',
            backgroundColor: '#F0F7FF', color: '#298DFF',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
            <Zap size={16} strokeWidth={2.5} /> Coba Demo Tanpa Daftar
          </span>
        </button>

        {/* Demo credentials hint */}
        <p style={{ textAlign: 'center', margin: '16px 0 0', fontSize: 11, color: '#B0B0BA', lineHeight: 1.5 }}>
          Demo account:{' '}
          <span
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); setErrors({}); setAuthError(''); }}
            style={{ color: '#298DFF', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            demo@macost.com / demo1234
          </span>
        </p>

        {/* Sign up link */}
        <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: 14, color: '#717182' }}>
          Belum punya akun?{' '}
          <button
            onClick={onGoRegister}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#298DFF', fontWeight: 700, fontSize: 14, fontFamily: "'Inter', sans-serif" }}
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
