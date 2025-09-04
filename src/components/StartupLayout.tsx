import { Outlet } from 'react-router-dom'
import StartupHeader from './StartupHeader'
import StartupSidebar from './StartupSidebar'

const StartupLayout = () => {
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
                <StartupSidebar />
            </aside>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <header
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        background: '#DBEAFE',
                        borderLeft: '1px solid #d1d5db',
                        boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <StartupHeader />
                </header>

                <main style={{ flex: 1, padding: 16, background: '#ffffff' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default StartupLayout
