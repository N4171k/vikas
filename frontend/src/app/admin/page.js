'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.getAdminStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div>Loading stats...</div>
            </AdminLayout>
        );
    }

    if (!stats) {
        return (
            <AdminLayout>
                <div>Failed to load dashboard data.</div>
            </AdminLayout>
        );
    }

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#10b981' },
        { title: 'Total Orders', value: stats.totalOrders, color: '#3b82f6' },
        { title: 'Total Products', value: stats.totalProducts, color: '#f59e0b' },
        { title: 'Total Users', value: stats.totalUsers, color: '#8b5cf6' },
    ];

    return (
        <AdminLayout>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {cards.map((card, index) => (
                    <div key={index} style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${card.color}`
                    }}>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{card.title}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{card.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Orders</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Order ID</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Customer</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Total</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Status</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>#{order.order_number}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{order.user.name}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>₹{parseFloat(order.total).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            background: order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fee2e2' : '#dbeafe',
                                            color: order.status === 'delivered' ? '#166534' : order.status === 'cancelled' ? '#991b1b' : '#1e40af'
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
