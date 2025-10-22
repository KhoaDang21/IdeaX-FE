import type { FC } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { Dropdown, App } from 'antd'
import type { MenuProps } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/features/auth/authSlice'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const InvestorHeader: FC = () => {
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

    const handleProfile = () => {
        navigate('/investor/profile-investor')
    }

    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined style={{ fontSize: 14 }} />,
            onClick: handleProfile
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined style={{ fontSize: 14, color: '#ff4d4f' }} />,
            onClick: handleLogout,
            style: { color: '#ff4d4f' }
        }
    ]

    return (
        <header
            style={{
                background: '#DBEAFE',
                borderBottom: '1px solid #e5e7eb',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px', // có thể tăng/giảm padding để đẹp hơn
                    width: '100%',
                }}
            >
                {/* Logo bên trái - sát viền */}
                <div style={{ flexShrink: 0 }}>
                    <Link
                        to="/investor/find-projects"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                        }}
                    >
                        <img
                            src={logo}
                            alt="IdeaX"
                            style={{ width: 36, height: 36, borderRadius: 8 }}
                        />
                    </Link>
                </div>

                {/* Menu giữa - căn giữa, không bị xuống hàng */}
                <nav
                    style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 40,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {[
                        { to: '/investor/find-projects', label: 'Find Projects' },
                        { to: '/investor/progress-tracking', label: 'Project Tracking' },
                        { to: '/investor/invested-projects', label: 'Invested Projects' },
                        { to: '/investor/payments', label: 'Payments' },
                    ].map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                color: isActive ? '#27348B' : '#4b5563',
                                fontWeight: isActive ? 700 : 500,
                                textDecoration: 'none',
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Avatar + thông báo bên phải - sát viền phải */}
                <div
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                    >
                        <BellOutlined style={{ fontSize: 18, color: '#111' }} />
                    </div>

                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 8,
                            }}
                        >
                            {user?.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt="avatar"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: '#34419A',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                    }}
                                >
                                    {user?.fullName
                                        ? user.fullName
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)
                                        : 'AD'}
                                </div>
                            )}
                            <span style={{ color: '#1f2937', fontWeight: 600 }}>
                                {user?.fullName || user?.email || 'Investor'}
                            </span>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </header>

    )
}

export default InvestorHeader