import { Outlet, useLocation } from 'react-router-dom'
import StartupHeader from './StartupHeader'
import StartupSidebar from './StartupSidebar'
import { useEffect, useState } from 'react'

const StartupLayout = () => {
    const location = useLocation()
    const [routeLoading, setRouteLoading] = useState(false)

    useEffect(() => {
        const skip = (location.state as any)?.skipDelay === true
        if (skip) {
            // If navigation requested skip, clear the flag so it won't persist and don't show overlay
            if (window.history && window.history.replaceState) {
                const newState = { ...window.history.state };
                if (newState && newState.state) {
                    delete newState.state.skipDelay
                }
                try { window.history.replaceState(newState, '') } catch (e) { /* ignore */ }
            }
            setRouteLoading(false)
            return
        }

        setRouteLoading(true)
        const t = setTimeout(() => setRouteLoading(false), 500)
        return () => clearTimeout(t)
    }, [location.pathname, location.state])

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
                <header style={{ background: '#DBEAFE', borderLeft: '1px solid #d1d5db' }}>
                    <StartupHeader />
                </header>

                <main style={{ flex: 1, padding: 16, background: '#ffffff', position: 'relative' }}>
                    {routeLoading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                            <div style={{ padding: 12, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', color: '#34419A', fontWeight: 600 }}>Loading...</div>
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default StartupLayout
