import React from 'react'

const GlobalLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="global-loading-overlay" aria-hidden>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="global-loading-spinner" />
                <div style={{ color: '#34419A', fontWeight: 600 }}>{message}</div>
            </div>
        </div>
    )
}

export default GlobalLoading
