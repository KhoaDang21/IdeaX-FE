import React from 'react';

const InvestorHeader: React.FC = () => {
    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Investor Dashboard</div>
            <nav>
                <a href="/investor/dashboard" style={{ margin: '0 10px' }}>Investments</a>
                <a href="/investor/reports" style={{ margin: '0 10px' }}>Reports</a>
                <a href="/investor/profile" style={{ margin: '0 10px' }}>Profile</a>
            </nav>
        </header>
    );
};

export default InvestorHeader;
