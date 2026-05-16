// src/components/atoms/LoginLogo.jsx
import { Boxes } from 'lucide-react';

export function LoginLogo() {
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 4px 20px rgba(255,255,255,0.4)',
    }}>
      <Boxes size={36} color="#fff" />
    </div>
  );
}
