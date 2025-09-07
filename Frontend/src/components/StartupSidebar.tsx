import type { FC, CSSProperties, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Folder, Briefcase, Users, User, CreditCard, Plus, FileText, MessageCircle } from 'lucide-react'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const card: CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
}

const NavItem: FC<{ to: string; icon: ReactNode; label: string }> = ({ to, icon, label }) => {
    const { pathname } = useLocation()
    const active = pathname === to
    return (
        <Link
            to={to}
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

const StartupSidebar: FC = () => {
    return (
        <aside style={{ width: 260, padding: 16, background: '#DBEAFE' }}>
            {/* Logo */}
            <div style={{ margin: '0 0 20px 4px' }}>
                <img src={logo} alt="Idea" style={{ width: 42, height: 42, borderRadius: 8 }} />
            </div>

            {/* User Card */}
            <div style={{ ...card, padding: 16, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                        JS
                    </div>
                    <div>
                        <div style={{ color: '#0f172a', fontWeight: 700 }}>John Smith</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>TechStart Inc.</div>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div style={{ marginBottom: 14, color: '#6b7280', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
                STARTUP PORTAL
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <NavItem to="/startup/dashboard" icon={<Folder size={18} />} label="Dashboard" />
                <NavItem to="/startup/my-projects" icon={<Briefcase size={18} />} label="My Projects" />
                <NavItem to="/startup/roommeet" icon={<Users size={18} />} label="Roommeet" />
                <NavItem to="/startup/profile" icon={<User size={18} />} label="Profile" />
                <NavItem to="/startup/payment" icon={<CreditCard size={18} />} label="Payment" />
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
                <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: 12, fontSize: 20 }}>
                    Quick Actions
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                    {[
                        { icon: <Plus size={18} />, label: 'Create New Project' },
                        { icon: <FileText size={18} />, label: 'Upload Documents' },
                        { icon: <MessageCircle size={18} />, label: 'Join Room' }
                    ].map((action, i) => (
                        <button
                            key={i}
                            style={{
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
                                justifyContent: 'flex-start'
                            }}
                        >
                            {action.icon} {action.label}
                        </button>
                    ))}
                </div>
            </div>

        </aside>
    )
}

export default StartupSidebar
