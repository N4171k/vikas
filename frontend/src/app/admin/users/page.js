'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.getUsers();
                if (response.success) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <AdminLayout>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>User Management</h2>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Name</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Email</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Role</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Joined At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>{user.name}</td>
                                        <td style={{ padding: '1rem' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                                color: user.role === 'admin' ? '#1e40af' : '#374151'
                                            }}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
