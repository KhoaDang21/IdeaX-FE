import { Outlet } from 'react-router-dom'
import InvestorHeader from './InvestorHeader'

const InvestorLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#ffffff' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <InvestorHeader />
            </header>
            <main style={{ flex: 1, padding: 16 }}>
                <Outlet />
            </main>
        </div>
    )
}

export default InvestorLayout


