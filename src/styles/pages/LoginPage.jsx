// src/pages/LoginPage.jsx
import { Boxes, BarChart3, Package, Shield } from 'lucide-react';
import { useLogin }     from '../hooks/useLogin';
import { GoogleButton } from '../components/atoms/GoogleButton';
import '../styles/login.css';

const FEATURES = [
  { icon: Package,   text: 'Gestiona productos y categorías en tiempo real' },
  { icon: BarChart3, text: 'Dashboard con métricas financieras al instante'  },
  { icon: Shield,    text: 'Tus datos seguros con Firebase y Google Auth'    },
];

export default function LoginPage() {
  const { loading, error, handleLogin } = useLogin();

  return (
    <div className="login-page">

      {/* ── Panel izquierdo (decorativo) ── */}
      <div className="login-panel">
        {/* Logo grande */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--accent)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px var(--accent-glow)',
          }}>
            <Boxes size={32} color="#fff" />
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800,
            color: '#fff', letterSpacing: '-0.8px',
          }}>
            MafeInventario
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6 }}>
            Tu inventario, siempre bajo control
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 320 }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 38, height: 38,
                background: 'rgba(232,56,13,0.2)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color="var(--accent)" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.55, paddingTop: 2 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Versión */}
        <div style={{ position: 'absolute', bottom: 28, color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          v1.0 Beta
        </div>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div className="login-form-area">
        <div className="login-card">

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{
                width: 36, height: 36,
                background: 'var(--accent)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}>
                <Boxes size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
                MafeInventario
              </span>
            </div>

            <h1 style={{
              fontSize: 28, fontWeight: 800,
              letterSpacing: '-0.8px', color: 'var(--text)',
              lineHeight: 1.2, marginBottom: 8,
            }}>
              Bienvenido de nuevo
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Inicia sesión para acceder a tu inventario.
            </p>
          </div>

          {/* Botón Google */}
          <GoogleButton loading={loading} onClick={handleLogin} />

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--red-dim)', color: 'var(--red)',
              fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(220,38,38,.2)',
            }}>
              {error}
            </div>
          )}

          {/* Footer legal */}
          <p style={{
            marginTop: 32, fontSize: 12,
            color: 'var(--text3)', lineHeight: 1.6, textAlign: 'center',
          }}>
            Al iniciar sesión aceptas que tus datos se guarden de forma segura
            asociados a tu cuenta de Google.
          </p>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}