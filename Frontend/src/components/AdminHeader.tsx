import React from 'react';

const AdminHeader: React.FC = () => {
    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Admin Dashboard</div>
            <nav>
                <a href="/admin/dashboard" style={{ margin: '0 10px' }}>User Management</a>
                <a href="/admin/settings" style={{ margin: '0 10px' }}>Settings</a>
                <a href="/admin/reports" style={{ margin: '0 10px' }}>Reports</a>
            </nav>
        </header>
    );
};

export default AdminHeader;
