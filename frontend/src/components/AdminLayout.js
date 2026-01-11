'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/admin');
        } else if (user && user.role !== 'admin') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    if (!user || user.role !== 'admin') {
        return null; // Or a loading spinner
    }

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Orders', path: '/admin/orders', icon: '📦' },
        { name: 'Products', path: '/admin/products', icon: '🏷️' },
        { name: 'Stores', path: '/admin/stores', icon: '🏪' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Top Bar */}
            <header style={{
                background: '#1f2937',
                color: 'white',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        ☰
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>VIKAS Admin Panel</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Welcome, {user.name}</span>
                    <button
                        onClick={() => router.push('/')}
                        style={{ padding: '0.5rem 1rem', background: '#374151', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                        View Store
                    </button>
                    <button
                        onClick={logout}
                        style={{ padding: '0.5rem 1rem', background: '#dc2626', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <aside style={{
                    width: isSidebarOpen ? '250px' : '0',
                    background: '#f3f4f6',
                    borderRight: '1px solid #e5e7eb',
                    transition: 'width 0.3s',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map(item => (
                            <Link
                                key={item.path}
                                href={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    color: pathname === item.path ? '#1f2937' : '#4b5563',
                                    background: pathname === item.path ? '#e5e7eb' : 'transparent',
                                    fontWeight: pathname === item.path ? '600' : 'normal'
                                }}
                            >
                                <span>{item.icon}</span>
                                <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '2rem', background: '#f9fafb' }}>
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;
