'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.getAdminOrders();
            if (response.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await api.getAdminOrder(id);
            if (response.success) {
                setSelectedOrder(response.data.order);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
            alert('Failed to load details');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await api.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                // Also update modal if open
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
                alert('Order status updated!');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update status');
        }
    };

    return (
        <AdminLayout>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Management</h2>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? (
                    <p>Loading orders...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Order ID</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Customer</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Total</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Date</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Status</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleViewDetails(order.id)}
                                                style={{ color: '#2563eb', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                {order.order_number}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div>{order.user.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.user.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>₹{parseFloat(order.total).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
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
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Order Details: {selectedOrder.order_number}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Customer Information</h3>
                            <p><strong>Name:</strong> {selectedOrder.user.name}</p>
                            <p><strong>Email:</strong> {selectedOrder.user.email}</p>
                            {selectedOrder.user.phone && <p><strong>Phone:</strong> {selectedOrder.user.phone}</p>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Shipping Address</h3>
                            {selectedOrder.shipping_address ? (
                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.375rem' }}>
                                    <p>{selectedOrder.shipping_address.fullName}</p>
                                    <p>{selectedOrder.shipping_address.addressLine1}</p>
                                    {selectedOrder.shipping_address.addressLine2 && <p>{selectedOrder.shipping_address.addressLine2}</p>}
                                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.zipCode}</p>
                                    <p>Phone: {selectedOrder.shipping_address.mobileNumber}</p>
                                </div>
                            ) : (
                                <p style={{ color: '#6b7280' }}>No shipping address provided (likely store pickup or digital).</p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Order Items</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f3f4f6' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                                        <th style={{ textAlign: 'center', padding: '0.5rem' }}>Qty</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '0.5rem' }}>
                                                <div>{item.title}</div>
                                                {item.variant && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.variant}</div>}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right', padding: '0.5rem' }}>₹{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Subtotal</span>
                                <span>₹{parseFloat(selectedOrder.subtotal).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Shipping</span>
                                <span>₹{parseFloat(selectedOrder.shipping).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Tax</span>
                                <span>₹{parseFloat(selectedOrder.tax).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                <span>Total</span>
                                <span>₹{parseFloat(selectedOrder.total).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
