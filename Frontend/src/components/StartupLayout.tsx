import { Outlet, useLocation } from 'react-router-dom'
import StartupHeader from './StartupHeader'
import StartupSidebar from './StartupSidebar'
import { useEffect, useState } from 'react'
import GlobalLoading from './GlobalLoading'

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
                        <GlobalLoading />
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default StartupLayout
