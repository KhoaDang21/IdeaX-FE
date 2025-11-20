import { Outlet } from 'react-router-dom'
import InvestorSidebar from './InvestorSidebar'

const InvestorLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
            <aside
                style={{
                    width: 260,
                    background: '#DBEAFE',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto'
                }}
            >
                <InvestorSidebar />
            </aside>
            <main style={{ marginLeft: 260, flex: 1, padding: 16, minHeight: '100vh' }}>
                <Outlet />
            </main>
        </div>
    )
}

export default InvestorLayout


