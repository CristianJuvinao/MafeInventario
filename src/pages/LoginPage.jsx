// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Boxes, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'var(--bg)',
      padding:        20,
    }}>
      <div style={{
        width:        '100%',
        maxWidth:     400,
        background:   'var(--surface)',
        borderRadius: 20,
        padding:      '48px 40px',
        boxShadow:    '0 8px 40px rgba(0,0,0,.25)',
        textAlign:    'center',
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0px auto 24px',
          boxShadow: '0 4px 20px rgba(255, 255, 255, 0.4)',
        }}>
          <Boxes size={36} color="#fff" />
        </div>

        <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>
          MafeInventario
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 36 }}>
          Gestiona tu inventario fácil y rápido
        </div>

        {/* Google button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:          '100%',
            padding:        '14px 20px',
            borderRadius:   12,
            border:         '1.5px solid var(--border)',
            background:     loading ? 'var(--surface2)' : 'var(--surface2)',
            color:          'var(--text1)',
            fontSize:       15,
            fontWeight:     600,
            cursor:         loading ? 'not-allowed' : 'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            12,
            transition:     'all .15s',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {loading ? (
            <>
              <span style={{
                width: 18, height: 18, border: '2px solid var(--text3)',
                borderTopColor: 'var(--accent)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              Conectando...
            </>
          ) : (
            <>
              {/* Google icon SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        {error && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(248,113,113,0.12)', color: 'var(--red)', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 28, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          Al iniciar sesión aceptas que tus datos de inventario se guarden de forma segura en la nube
          asociados a tu cuenta de Google.
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}