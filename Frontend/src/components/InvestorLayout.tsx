import { Outlet } from 'react-router-dom'
import InvestorSidebar from './InvestorSidebar'

const InvestorLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
            <aside
                style={{
                    width: 260,
                    background: '#DBEAFE',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <InvestorSidebar />
            </aside>
            <main style={{ flex: 1, padding: 16 }}>
                <Outlet />
            </main>
        </div>
    )
}

export default InvestorLayout


