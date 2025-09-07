import React from 'react';
import InvestorHeader from '../../components/InvestorHeader';

const InvestorDashboard: React.FC = () => {
    return (
        <div>
            <InvestorHeader />
            <main style={{ padding: '20px' }}>
                <h1>Welcome to Investor Dashboard</h1>
            </main>
        </div>
    );
};

export default InvestorDashboard;
