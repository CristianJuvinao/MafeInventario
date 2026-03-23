// src/components/atoms/SidebarUserCard.jsx

export function SidebarUserCard({ user }) {
  if (!user) return null;

  return (
    <div style={{
      margin:       '0 12px 12px',
      padding:      '10px 12px',
      borderRadius: 12,
      background:   'var(--surface2)',
      display:      'flex',
      alignItems:   'center',
      gap:          10,
    }}>
      <img
        src={user.photoURL}
        alt={user.displayName}
        referrerPolicy="no-referrer"
        style={{
          width: 34, height: 34, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid var(--accent)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 13,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.displayName}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--text3)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.email}
        </div>
      </div>
    </div>
  );
}
