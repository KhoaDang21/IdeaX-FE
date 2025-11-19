import type { FC, CSSProperties, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Users, CreditCard, User } from 'lucide-react'
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

const InvestorSidebar: FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const getInitials = (name?: string, email?: string) =>
    name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : email
        ? email.slice(0, 2).toUpperCase()
        : 'U'

  const menuItems = [
    { to: '/investor/find-projects', icon: <Search size={18} />, label: 'Find Projects' },
    { to: '/investor/room', icon: <Users size={18} />, label: 'Roomeet' },
    { to: '/investor/payments', icon: <CreditCard size={18} />, label: 'Payments' },
    { to: '/investor/profile-investor', icon: <User size={18} />, label: 'Profile' }
  ]

  const actions = [
    { icon: <Search size={18} />, label: 'Discover Projects', onClick: () => navigate('/investor/find-projects') },
    { icon: <Users size={18} />, label: 'Join Room', onClick: () => navigate('/investor/room') },
    { icon: <CreditCard size={18} />, label: 'Manage Wallet', onClick: () => navigate('/investor/payments') }
  ]

  return (
    <aside style={{ width: 260, padding: 16, background: '#DBEAFE' }}>
      <div style={{ margin: '0 0 20px 4px' }}>
        <img src={logo} alt="Idea" style={{ width: 42, height: 42, borderRadius: 8 }} />
      </div>

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
            <div style={{ color: '#0f172a', fontWeight: 700 }}>{user?.fullName || user?.email || 'Investor'}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Investor Portal</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14, color: '#6b7280', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
        INVESTOR PORTAL
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {menuItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

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

export default InvestorSidebar