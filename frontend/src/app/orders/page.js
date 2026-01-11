'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successOrder, setSuccessOrder] = useState(searchParams.get('success'));

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/orders');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const [ordersRes, reservationsRes] = await Promise.all([
                api.getOrders(),
                api.getMyReservations()
            ]);

            let allItems = [];

            // Process Orders
            if (ordersRes.success) {
                const formattedOrders = ordersRes.data.orders.map(order => ({
                    ...order,
                    type: 'delivery',
                    sortDate: new Date(order.created_at)
                }));
                allItems = [...allItems, ...formattedOrders];
            }

            // Process Reservations
            if (reservationsRes.success) {
                const formattedReservations = reservationsRes.data.reservations.map(res => ({
                    id: `res-${res.id}`,
                    originalId: res.id,
                    order_number: res.code,
                    created_at: res.createdAt,
                    sortDate: new Date(res.createdAt),
                    total: res.totalAmount,
                    status: res.status,
                    type: 'reservation',
                    store: res.store,
                    items: [{
                        productId: res.product.id,
                        productTitle: res.product.title,
                        price: res.product.price,
                        quantity: res.quantity,
                        productImage: null // Backend doesn't send image for reservations list yet
                    }]
                }));
                allItems = [...allItems, ...formattedReservations];
            }

            // Sort by date desc
            allItems.sort((a, b) => b.sortDate - a.sortDate);
            setOrders(allItems);

        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status, type) => {
        if (type === 'reservation') {
            const resClasses = {
                pending: styles.statusPending,
                paid: styles.statusConfirmed,
                picked_up: styles.statusDelivered,
                expired: styles.statusCancelled,
                cancelled: styles.statusCancelled
            };
            return resClasses[status] || styles.statusPending;
        }

        const statusClasses = {
            pending: styles.statusPending,
            confirmed: styles.statusConfirmed,
            processing: styles.statusProcessing,
            shipped: styles.statusShipped,
            delivered: styles.statusDelivered,
            cancelled: styles.statusCancelled
        };
        return statusClasses[status] || styles.statusPending;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isAuthenticated) return null;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Your Orders & Reservations</h1>

                    {/* Success Message */}
                    {successOrder && (
                        <div className={styles.successBanner}>
                            <div className={styles.successIcon}>✓</div>
                            <div>
                                <h3>Order Placed Successfully!</h3>
                                <p>Your order #{successOrder} has been confirmed. Thank you for shopping with VIKAS!</p>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading your history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles.emptyOrders}>
                            <div className={styles.emptyIcon}>📦</div>
                            <h2>No orders yet</h2>
                            <p>You haven't placed any orders or reservations. Start shopping now!</p>
                            <a href="/products" className="btn btn-primary">
                                Browse Products
                            </a>
                        </div>
                    ) : (
                        <div className={styles.ordersList}>
                            {orders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    {/* Order Header */}
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderMeta}>
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>
                                                    {order.type === 'reservation' ? 'RESERVED ON' : 'ORDER PLACED'}
                                                </span>
                                                <span className={styles.metaValue}>{formatDate(order.created_at)}</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>TOTAL</span>
                                                <span className={styles.metaValue}>₹{parseFloat(order.total).toLocaleString()}</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaLabel}>
                                                    {order.type === 'reservation' ? 'CODE' : 'ORDER #'}
                                                </span>
                                                <span className={styles.metaValue}>{order.order_number}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {order.type === 'reservation' && (
                                                <span className={styles.storeBadge}>🏪 Store Pickup</span>
                                            )}
                                            <div className={`${styles.status} ${getStatusBadge(order.status, order.type)}`}>
                                                {order.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className={styles.orderItems}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className={styles.orderItem}>
                                                <img
                                                    src={item.productImage || 'https://via.placeholder.com/100?text=Product'}
                                                    alt={item.productTitle}
                                                />
                                                <div className={styles.itemDetails}>
                                                    <a href={`/product/${item.productId}`} className={styles.itemTitle}>
                                                        {item.productTitle}
                                                    </a>
                                                    <p className={styles.itemMeta}>
                                                        Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Actions */}
                                    <div className={styles.orderActions}>
                                        {order.type === 'reservation' ? (
                                            <div className={styles.shippingInfo}>
                                                <strong>Pickup at:</strong> {order.store?.name}
                                                {order.status === 'pending' && (
                                                    <a href={`/reservation/${order.originalId}`} style={{ marginLeft: '15px', color: '#2563eb', textDecoration: 'none' }}>
                                                        View Details & Pay →
                                                    </a>
                                                )}
                                                {order.status === 'paid' && (
                                                    <a href={`/reservation/${order.originalId}`} style={{ marginLeft: '15px', color: '#2563eb', textDecoration: 'none' }}>
                                                        View QR Code →
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            order.shipping_address && (
                                                <div className={styles.shippingInfo}>
                                                    <strong>Ship to:</strong> {order.shipping_address.fullName}, {order.shipping_address.city}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
