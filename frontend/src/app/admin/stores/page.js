'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';

export default function AdminStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStore, setEditingStore] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        store_name: '',
        city: '',
        pincode: '',
        store_address: '',
        phone: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await api.getStores();
            if (res.success) {
                setStores(res.data.stores);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingStore(null);
        setFormData({
            store_name: '',
            city: '',
            pincode: '',
            store_address: '',
            phone: '',
            latitude: '',
            longitude: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        setFormData({
            store_name: store.store_name,
            city: store.city,
            pincode: store.pincode,
            store_address: store.store_address,
            phone: store.phone || '',
            latitude: store.latitude || '',
            longitude: store.longitude || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this store?')) {
            try {
                const res = await api.deleteStore(id);
                if (res.success) {
                    fetchStores();
                }
            } catch (error) {
                console.error('Failed to delete store:', error);
                alert('Failed to delete store');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStore) {
                await api.updateStore(editingStore.id, formData);
            } else {
                await api.createStore(formData);
            }
            setIsModalOpen(false);
            fetchStores();
        } catch (error) {
            console.error('Failed to save store:', error);
            alert('Failed to save store');
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Offline Stores</h1>
                <button
                    onClick={handleCreate}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                >
                    + Add New Store
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Store Name</th>
                                <th style={{ padding: '0.75rem' }}>City</th>
                                <th style={{ padding: '0.75rem' }}>Pincode</th>
                                <th style={{ padding: '0.75rem' }}>Phone</th>
                                <th style={{ padding: '0.75rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem' }}>{store.store_name}</td>
                                    <td style={{ padding: '0.75rem' }}>{store.city}</td>
                                    <td style={{ padding: '0.75rem' }}>{store.pincode}</td>
                                    <td style={{ padding: '0.75rem' }}>{store.phone}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <button
                                            onClick={() => handleEdit(store)}
                                            style={{ marginRight: '0.5rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(store.id)}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '500px', maxWidth: '90%' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {editingStore ? 'Edit Store' : 'Add New Store'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Store Name"
                                value={formData.store_name}
                                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                                <input
                                    placeholder="Pincode"
                                    value={formData.pincode}
                                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                    required
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                            </div>
                            <textarea
                                placeholder="Full Address"
                                value={formData.store_address}
                                onChange={e => setFormData({ ...formData, store_address: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', minHeight: '80px' }}
                            />
                            <input
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    placeholder="Latitude"
                                    type="number" step="any"
                                    value={formData.latitude}
                                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                                <input
                                    placeholder="Longitude"
                                    type="number" step="any"
                                    value={formData.longitude}
                                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                >
                                    Save Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
