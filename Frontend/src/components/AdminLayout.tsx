import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
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
                <AdminSidebar />
            </aside>
            <main style={{ flex: 1, padding: 16 }}>
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout


