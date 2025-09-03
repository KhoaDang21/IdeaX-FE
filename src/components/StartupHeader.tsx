import type { FC } from 'react'
import { FiBell } from 'react-icons/fi' // chuông từ Feather icons

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
    return (
        <header style={{ background: '#DBEAFE', padding: '16px 18px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#34419A' }}>Startup Dashboard</h2>
                    <span style={{ color: '#6b7280' }}>Manage your projects and connect with investors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={iconWrap}>
                        <FiBell size={18} color="#111" />
                    </div>
                    <div style={circle}>JS</div>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>John Smith</span>
                </div>
            </div>
        </header>
    )
}

export default StartupHeader