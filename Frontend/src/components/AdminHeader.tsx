import type { FC } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BellOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button, App } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/features/auth/authSlice'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const AdminHeader: FC = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state: RootState) => state.auth.user)
    const { message } = App.useApp()

    const handleLogout = () => {
        message.success({ content: 'Đăng xuất thành công', key: 'logout', duration: 1.2 })
        dispatch(logout())
        setTimeout(() => {
            navigate('/login')
        }, 800)
    }

    return (
        <header style={{ background: '#DBEAFE', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Link to="/admin/user-management" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <img src={logo} alt="IdeaX" style={{ width: 36, height: 36, borderRadius: 8 }} />
                </Link>

                <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {[
                        { to: '/admin/user-management', label: 'User Management' },
                        { to: '/admin/project-management', label: 'Project Management' },
                        { to: '/admin/financial-management', label: 'Financial Management' },
                        { to: '/admin/room-and-contract', label: 'Room & Contract' }
                    ].map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                color: isActive ? '#27348B' : '#4b5563',
                                fontWeight: isActive ? 700 : 500,
                                textDecoration: 'none'
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                        <BellOutlined style={{ fontSize: 18, color: '#111' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 8 }}>
                        {user?.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#34419A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
                            </div>
                        )}
                        <span style={{ color: '#1f2937', fontWeight: 600 }}>{user?.fullName || user?.email || 'Admin'}</span>

                        <Button
                            type="text"
                            icon={<LogoutOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />}
                            onClick={handleLogout}
                            style={{
                                padding: '4px 8px',
                                height: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Đăng xuất"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AdminHeader