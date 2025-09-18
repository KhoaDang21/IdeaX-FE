import React, { useState } from 'react';

const Payment: React.FC = () => {
    const [activeTab, setActiveTab] = useState('requests');

    return (
        <div style={{ padding: 24, background: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        style={{ 
                            fontSize: 20, 
                            fontWeight: 600, 
                            color: activeTab === 'requests' ? '#3b82f6' : '#64748b', 
                            margin: 0, 
                            border: 'none', 
                            background: 'none', 
                            cursor: 'pointer',
                            borderBottom: activeTab === 'requests' ? '2px solid #3b82f6' : 'none',
                            paddingBottom: 4 
                        }}
                    >
                        Withdrawal Requests
                    </button>
                    <button 
                        onClick={() => setActiveTab('disbursements')}
                        style={{ 
                            fontSize: 20, 
                            color: activeTab === 'disbursements' ? '#3b82f6' : '#64748b', 
                            margin: 0, 
                            border: 'none', 
                            background: 'none', 
                            cursor: 'pointer',
                            borderBottom: activeTab === 'disbursements' ? '2px solid #3b82f6' : 'none',
                            paddingBottom: 4 
                        }}
                    >
                        Disbursement by Contract
                    </button>
                </div>
                <button style={{ fontSize: 14, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    Request Withdrawal
                </button>
            </div>

            {/* Main Content */}
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 16, marginBottom: 24 }}>
                {activeTab === 'requests' ? (
                    <>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>Withdrawal History</h3>
                        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>Track your withdrawal requests and their processing status</p>

                        {/* Item 1 - Pending */}
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>WR-2024-001</span>
                                    <span style={{ fontSize: 12, background: '#fefce8', color: '#d97706', padding: '2px 8px', borderRadius: 999 }}>Pending</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>$50,000</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}>Development milestone completion</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>Contract: CT-AI-001 • Requested: Feb 15, 2024</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>Est. 3-5 business days</p>
                        </div>

                        {/* Item 2 - Approved */}
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>WR-2024-002</span>
                                    <span style={{ fontSize: 12, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 999 }}>Approved</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>$25,000</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}>Marketing campaign funding</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>Contract: CT-GREEN-002 • Requested: Feb 10, 2024</p>
                        </div>

                        {/* Item 3 - Completed */}
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>WR-2024-003</span>
                                    <span style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 999 }}>Completed</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>$75,000</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}>Product development phase 2</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>Contract: CT-HEALTH-003 • Requested: Feb 5, 2024</p>
                            <p style={{ fontSize: 12, color: '#16a34a', margin: '4px 0' }}>Completed: Feb 8, 2024</p>
                        </div>

                        {/* Item 4 - Rejected */}
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>WR-2024-004</span>
                                    <span style={{ fontSize: 12, background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: 999 }}>Rejected</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>$30,000</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}>Equipment purchase</p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>Contract: CT-AI-001 • Requested: Feb 1, 2024</p>
                            <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0' }}>Rejected: Feb 3, 2024</p>
                            <div style={{ background: '#fee2e2', borderRadius: 8, padding: 8, marginTop: 8 }}>
                                <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>Rejection Reason:</p>
                                <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>Insufficient documentation provided</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>Disbursement by Contract</h3>
                        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>Manage disbursements by contract</p>

                        {/* Placeholder Form for Disbursement */}
                        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 14, color: '#475569', display: 'block', marginBottom: 4 }}>Contract ID</label>
                                <input type="text" placeholder="Enter contract ID" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 14, color: '#475569', display: 'block', marginBottom: 4 }}>Amount</label>
                                <input type="text" placeholder="Enter amount" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 14, color: '#475569', display: 'block', marginBottom: 4 }}>Description</label>
                                <textarea placeholder="Enter description" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db', minHeight: 100 }} />
                            </div>
                            <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                Submit Disbursement Request
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Bottom Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 16 }}>
                    <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Total Received</p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>$625,000</h2>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>From all contracts</p>
                </div>
                <div style={{ flex: 1, minWidth: 200, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 16 }}>
                    <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Pending Withdrawals</p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>$75,000</h2>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>2 requests</p>
                </div>
                <div style={{ flex: 1, minWidth: 200, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 16 }}>
                    <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Available Balance</p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>$550,000</h2>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Ready for withdrawal</p>
                </div>
            </div>
        </div>
    );
};

export default Payment;