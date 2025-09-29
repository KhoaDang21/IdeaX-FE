import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { BellOutlined, DownOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { App } from 'antd'
import type { RootState } from '../store'
import { logout, getStartupProfile } from '../services/features/auth/authSlice'

const circle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#34419A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
}

const iconWrap: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 18,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
}

const StartupHeader: FC = () => {
    const { user } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [showDropdown, setShowDropdown] = useState(false)
    const { message } = App.useApp()

    // Đồng bộ profile khi đã có user id
    useEffect(() => {
        if (user?.role === 'startup' && user.id) {
            (dispatch(getStartupProfile(user.id) as any))
        }
    }, [user?.id])

    const getInitials = (name: string | undefined, email: string | undefined) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        if (email) {
            return email.slice(0, 2).toUpperCase()
        }
        return 'U'
    }

    const handleLogout = () => {
        message.success({ content: 'Đăng xuất thành công', key: 'logout', duration: 1.2 })
        dispatch(logout())
        setTimeout(() => {
            navigate('/login')
        }, 800)
    }

    const handleProfile = () => {
        navigate('/startup/profile')
        setShowDropdown(false)
    }

    const path = location.pathname
    const title = (() => {
        if (path.startsWith('/startup/my-projects')) return 'My Projects'
        if (path.startsWith('/startup/roommeet')) return 'Roommeet'
        if (path.startsWith('/startup/profile')) return 'Profile'
        if (path.startsWith('/startup/payment')) return 'Payment'
        return 'Startup Dashboard'
    })()

    return (
        <header style={{ background: '#DBEAFE', padding: '16px 18px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: '#34419A', textAlign: 'left' }}>{title}</h2>
                    <span style={{ color: '#6b7280', display: 'block', textAlign: 'left' }}>Manage your projects and connect with investors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={iconWrap}>
                        <BellOutlined style={{ fontSize: 18, color: '#111' }} />
                    </div>

                    {/* Avatar với dropdown */}
                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 8,
                                transition: 'background-color 0.2s'
                            }}
                            onClick={() => setShowDropdown(!showDropdown)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(52, 65, 154, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {user?.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={circle}>{getInitials(user?.fullName, user?.email)}</div>
                            )}
                            <span style={{ color: '#1f2937', fontWeight: 600 }}>
                                {user?.fullName || user?.email || 'User'}
                            </span>
                            <DownOutlined
                                style={{
                                    fontSize: 16,
                                    color: '#6b7280',
                                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </div>

                        {/* Dropdown menu */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 8,
                                background: '#fff',
                                borderRadius: 12,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                border: '1px solid #e5e7eb',
                                minWidth: 160,
                                zIndex: 1000
                            }}>
                                <div
                                    style={{
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f3f4f6',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onClick={handleProfile}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <UserOutlined style={{ fontSize: 16, color: '#6b7280' }} />
                                    <span style={{ color: '#374151', fontSize: 14 }}>Profile</span>
                                </div>
                                <div
                                    style={{
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onClick={handleLogout}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogoutOutlined style={{ fontSize: 16, color: '#ef4444' }} />
                                    <span style={{ color: '#ef4444', fontSize: 14 }}>Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay để đóng dropdown khi click bên ngoài */}
            {showDropdown && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </header>
    )
}

export default StartupHeader