import type { FC, CSSProperties, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, FolderCog, Wallet, FileText, LogOut } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import { App } from 'antd'
import { logout } from '../services/features/auth/authSlice'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const card: CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
}

const NavItem: FC<{ to: string; icon: ReactNode; label: string }> = ({
  to,
  icon,
  label
}) => {
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
      <span style={{ width: 20, display: 'flex', justifyContent: 'center' }}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}

const AdminSidebar: FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const getInitials = (name?: string, email?: string) =>
    name
      ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      : email
        ? email.slice(0, 2).toUpperCase()
        : 'AD'

  const menuItems = [
    {
      to: '/admin/user-management',
      icon: <Users size={18} />,
      label: 'User Management'
    },
    {
      to: '/admin/project-management',
      icon: <FolderCog size={18} />,
      label: 'Project Management'
    },
    {
      to: '/admin/financial-management',
      icon: <Wallet size={18} />,
      label: 'Financial Management'
    },
    {
      to: '/admin/room-and-contract',
      icon: <FileText size={18} />,
      label: 'Room & Contract'
    }
  ]

  const handleLogout = () => {
    message.success({
      content: 'Logged out successfully',
      key: 'logout',
      duration: 1.2
    })
    dispatch(logout())
    setTimeout(() => {
      navigate('/login')
    }, 800)
  }

  return (
    <aside style={{ width: 260, padding: 16, background: '#DBEAFE', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* MAIN CONTENT (được đẩy lên trên) */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ margin: '0 0 20px 4px' }}>
            <img
              src={logo}
              alt="Idea"
              style={{ width: 42, height: 42, borderRadius: 8 }}
            />
          </div>

          <div style={{ ...card, padding: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="avatar"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    objectFit: 'cover'
                  }}
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
                <div style={{ color: '#0f172a', fontWeight: 700 }}>
                  {user?.fullName || user?.email || 'Admin'}
                </div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  Admin Portal
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginBottom: 14,
              color: '#6b7280',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1
            }}
          >
            ADMIN PORTAL
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menuItems.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        {/* LOGOUT BUTTON (ở dưới cùng) */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #ef4444',
              background: '#fff',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Logout"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

      </div>
    </aside>
  )
}

export default AdminSidebar
