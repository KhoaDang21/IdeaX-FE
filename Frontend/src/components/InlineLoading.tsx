import React from 'react'

const InlineLoading: React.FC<{ size?: number; message?: string }> = ({ size = 12, message }) => {
    const dots = [0, 1, 2, 3]
    return (
        <div style={{ textAlign: 'center', padding: 30 }}>
            <div className="inline-dots" style={{ height: size, gap: size * 0.6 }}>
                {dots.map((d) => (
                    <span key={d} className="inline-dot" aria-hidden />
                ))}
            </div>
            {message && <div style={{ marginTop: 10, color: '#64748b' }}>{message}</div>}
        </div>
    )
}

export default InlineLoading
