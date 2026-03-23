// src/pages/LoginPage.jsx
import { useLogin }      from '../hooks/useLogin';
import { LoginLogo }     from '../components/atoms/LoginLogo';
import { GoogleButton }  from '../components/atoms/GoogleButton';

export default function LoginPage() {
  const { loading, error, handleLogin } = useLogin();

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
        <LoginLogo />

        <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>
          MafeInventario
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 36 }}>
          Gestiona tu inventario fácil y rápido
        </div>

        <GoogleButton loading={loading} onClick={handleLogin} />

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
