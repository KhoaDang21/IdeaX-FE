import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/images/541447718_1863458311190035_8212706485109580334_n.jpg'
import { ThunderboltOutlined, DollarOutlined, SafetyOutlined } from '@ant-design/icons'

const FeatureCard: FC<{ title: string; description: string; items: string[]; icon: ReactNode }> = ({ title, description, items, icon }) => {
    return (
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#60a5fa,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, marginBottom: 12 }}>{icon}</div>
            <h3 style={{ margin: '6px 0 8px', color: '#0f172a' }}> {title} </h3>
            <p style={{ margin: '0 0 12px', color: '#475569' }}>{description}</p>
            <ul style={{ paddingLeft: 18, margin: 0, color: '#0f172a' }}>
                {items.map((t) => (
                    <li key={t} style={{ margin: '6px 0' }}>
                        <span style={{ color: '#16a34a', marginRight: 8 }}>✓</span>
                        {t}
                    </li>
                ))}
            </ul>
        </div>
    )
}

const Home: FC = () => {
    return (
        <main>
            {/* Header (inline on Home) */}
            <header style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #eef2f7' }}>
                <nav style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <img src={logo} alt="IdeaX" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>IdeaX</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/login" style={{ padding: '8px 14px', border: '1px solid #dbe7ff', borderRadius: 8, color: '#0f172a', textDecoration: 'none' }}>Login</Link>
                        <Link to="/start" style={{ padding: '8px 14px', borderRadius: 8, background: '#34419A', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>Get Started</Link>
                    </div>
                </nav>
            </header>
            {/* Hero Section */}
            <section style={{ background: 'linear-gradient(180deg,#f1f5ff, #ffffff)', padding: '72px 20px 40px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.15, color: '#34419A', fontWeight: 800 }}>Connect Innovators <span style={{ display: 'block', color: '#3FC7F4' }}>with Capital</span></h1>
                    <p style={{ margin: '16px auto 24px', maxWidth: 760, color: '#475569' }}>
                        The premier platform where groundbreaking startups meet visionary investors. Secure funding, build partnerships, and transform ideas into reality through our intelligent matching system.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link to="/startups" style={{ padding: '12px 18px', borderRadius: 10, background: '#34419A', color: '#fff', textDecoration: 'none', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>Join as Startup</Link>
                        <Link to="/investors" style={{ padding: '12px 18px', borderRadius: 10, background: '#fff', border: '1px solid #dbe7ff', color: '#0f172a', textDecoration: 'none' }}>Join as Investor</Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '24px 20px 40px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <FeatureCard
                        title="For Startups"
                        description="Showcase projects, connect with qualified investors, and secure the funding you need."
                        items={["Project showcase platform", "Secure investor meetings", "Funding milestone tracking"]}
                        icon={<ThunderboltOutlined />}
                    />
                    <FeatureCard
                        title="For Investors"
                        description="Discover high-potential startups, conduct diligence, and invest confidently with analytics."
                        items={["Curated startup pipeline", "Due diligence tools", "Portfolio management"]}
                        icon={<DollarOutlined />}
                    />
                    <FeatureCard
                        title="Secure Platform"
                        description="Enterprise-grade security with encrypted communications, verified users, and legal support."
                        items={["End-to-end encryption", "KYC verification", "Legal compliance"]}
                        icon={<SafetyOutlined />}
                    />
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '30px 20px 60px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', background: 'linear-gradient(100deg,#34419A,#3FC7F4)', borderRadius: 20, padding: '32px 24px', color: '#fff', boxShadow: '0 20px 40px rgba(2,132,199,0.35)' }}>
                    <h2 style={{ margin: '0 0 6px', textAlign: 'center' }}>Ready to Transform Your Future?</h2>
                    <p style={{ margin: '0 auto 16px', maxWidth: 760, textAlign: 'center' }}>Join thousands of successful startups and investors who have already found their perfect match on our platform.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <Link to="/start" style={{ padding: '10px 16px', borderRadius: 10, background: '#fff', color: '#0f172a', textDecoration: 'none' }}>Start Your Journey</Link>
                        <Link to="/signin" style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.7)', color: '#fff', textDecoration: 'none' }}>Sign In</Link>
                    </div>
                </div>
            </section>

            {/* Inline Footer Section */}
            <section style={{ background: '#34419A', color: '#c7d2fe', padding: '48px 20px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 24, alignItems: 'start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <img src={logo} alt="IdeaX" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                                <strong style={{ color: '#e0e7ff' }}>IdeaX</strong>
                            </div>
                            <p style={{ marginTop: 0, lineHeight: 1.7 }}>Connecting innovative startups with visionary investors to build the future of technology and business.</p>
                        </div>
                        <div>
                            <h4 style={{ color: '#e0e7ff', marginTop: 0 }}>Platform</h4>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, lineHeight: 2 }}>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>For Startups</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>For Investors</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Success Stories</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#e0e7ff', marginTop: 0 }}>Support</h4>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, lineHeight: 2 }}>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Help Center</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Contact Us</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Privacy Policy</a></li>
                                <li><a href="#" style={{ color: '#c7d2fe', textDecoration: 'none' }}>Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ height: 1, background: 'rgba(148,163,255,0.25)', margin: '24px 0' }} />
                    <p style={{ textAlign: 'center', margin: 0 }}>© 2025 . All rights reserved.</p>
                </div>
            </section>
        </main>
    )
}

export default Home


