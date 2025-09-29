import type { FC } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BellOutlined } from '@ant-design/icons'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'

const InvestorHeader: FC = () => {
    return (
        <header style={{ background: '#DBEAFE', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Link to="/investor/find-projects" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <img src={logo} alt="IdeaX" style={{ width: 36, height: 36, borderRadius: 8 }} />
                </Link>

                <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {[
                        { to: '/investor/find-projects', label: 'Find Projects' },
                        { to: '/investor/progress-tracking', label: 'Project Tracking' },
                        { to: '/investor/invested-projects', label: 'Invested Projects' },
                        { to: '/investor/payments', label: 'Payments' }
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
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#34419A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        AD
                    </div>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>Investor</span>
                </div>
            </div>
        </header>
    )
}

export default InvestorHeader
