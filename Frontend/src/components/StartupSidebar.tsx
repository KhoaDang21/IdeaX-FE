import type { FC, CSSProperties, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Folder, Briefcase, Users, User, CreditCard, Plus, FileText, MessageCircle } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const card: CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
}

const buttonBase: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.25)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontWeight: 600,
  fontSize: 15,
  lineHeight: 1.4,
  justifyContent: 'flex-start',
  cursor: 'pointer'
}

const NavItem: FC<{ to: string; icon: ReactNode; label: string }> = ({ to, icon, label }) => {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Link
      to={to}
      state={{ skipDelay: true }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: active ? '#fff' : '#0f172a',
        background: active ? '#34419A' : 'transparent',
        padding: '10px 14px',
        borderRadius: 10,
        fontWeight: 500
      }}
    >
      <span style={{ width: 20, display: 'flex', justifyContent: 'center' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

const StartupSidebar: FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const getInitials = (name?: string, email?: string) =>
    name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : email
      ? email.slice(0, 2).toUpperCase()
      : 'U'

  const menuItems = [
    { to: '/startup/dashboard', icon: <Folder size={18} />, label: 'Dashboard' },
    { to: '/startup/my-projects', icon: <Briefcase size={18} />, label: 'My Projects' },
    { to: '/startup/roommeet', icon: <Users size={18} />, label: 'Roommeet' },
    { to: '/startup/profile', icon: <User size={18} />, label: 'Profile' },
    { to: '/startup/payment', icon: <CreditCard size={18} />, label: 'Payment' }
  ]

  const actions = [
    { icon: <Plus size={18} />, label: 'Create New Project', onClick: () => navigate('/startup/new-project') },
    { icon: <FileText size={18} />, label: 'Upload Documents', onClick: () => console.log('Upload Documents clicked') },
    { icon: <MessageCircle size={18} />, label: 'Join Room', onClick: () => console.log('Join Room clicked') }
  ]

  return (
    <aside style={{ width: 260, padding: 16, background: '#DBEAFE' }}>
      {/* Logo */}
      <div style={{ margin: '0 0 20px 4px' }}>
        <img src={logo} alt="Idea" style={{ width: 42, height: 42, borderRadius: 8 }} />
      </div>

      {/* User Card */}
      <div style={{ ...card, padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt="avatar"
              style={{ width: 44, height: 44, borderRadius: 22, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: '#34419A',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}
            >
              {getInitials(user?.fullName, user?.email)}
            </div>
          )}
          <div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>{user?.fullName || user?.email || 'User'}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{user?.startupName || 'Startup'}</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ marginBottom: 14, color: '#6b7280', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
        STARTUP PORTAL
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {menuItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Quick Actions */}
      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 16,
          background: 'linear-gradient(135deg,#3FC7F4,#34419A)'
        }}
      >
        <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: 12, fontSize: 20 }}>Quick Actions</div>

        <div style={{ display: 'grid', gap: 12 }}>
          {actions.map((action, i) => (
            <button key={i} onClick={action.onClick} style={buttonBase}>
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default StartupSidebar
