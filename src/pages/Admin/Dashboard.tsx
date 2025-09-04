import React from 'react';
import AdminHeader from '../../components/AdminHeader';

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <AdminHeader />
            <main style={{ padding: '20px' }}>
                <h1>Welcome to Admin Dashboard</h1>
            </main>
        </div>
    );
};

export default AdminDashboard;
