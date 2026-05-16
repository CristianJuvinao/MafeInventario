export function SidebarUserCard({ user }) {
  if (!user) return null;

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="sidebar-user-card">
      <div className="sidebar-avatar">
        {user.photoURL
          ? <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" />
          : initials
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sidebar-user-name">{user.displayName}</div>
        <div className="sidebar-user-email">{user.email}</div>
      </div>
    </div>
  );
}