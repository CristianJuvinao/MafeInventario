// src/components/atoms/LoadingScreen.jsx
import { Boxes } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 16,
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 28px var(--accent-glow)',
      }}>
        <Boxes size={26} color="#fff" />
      </div>
      <div style={{
        width: 26,
        height: 26,
        border: '3px solid var(--surface3)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}