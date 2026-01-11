'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from '../page.module.css';

export default function ReservationDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('upi');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/reservation/${id}`);
            return;
        }
        fetchReservation();
    }, [isAuthenticated, id]);

    const fetchReservation = async () => {
        try {
            // Remove 'res-' prefix if present from OrderPage link
            const cleanId = id.toString().replace('res-', '');
            const response = await api.getReservation(cleanId);
            if (response.success) {
                setReservation(response.data.reservation);
            }
        } catch (err) {
            setError('Failed to load reservation details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);

        try {
            const response = await api.payReservation(reservation.id, paymentMethod);
            if (response.success) {
                setReservation({
                    ...reservation,
                    ...response.data.reservation,
                    qrCodeData: response.data.qrCode.data // API returns nested qrCode object with data inside
                });
                // Status will update to 'paid' via ...response.data.reservation
            }
        } catch (err) {
            setError(err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleKioskScan = async () => {
        if (!reservation.qrCodeData) return;

        setProcessing(true);
        setError(null);

        try {
            const response = await api.verifyReservation(reservation.qrCodeData);
            if (response.success) {
                setReservation({
                    ...reservation,
                    status: 'picked_up'
                });
                alert('✅ Item dispensed! Order completed.');
                router.push('/orders');
            }
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setProcessing(false);
        }
    };

    const generateQRCodeUrl = (data) => {
        const encoded = encodeURIComponent(data);
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`;
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.container}>
                        <div className={styles.card}>
                            <div className={styles.error}>
                                <h3>⚠️ Error</h3>
                                <p>{error || 'Reservation not found'}</p>
                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => router.push('/orders')}
                                    style={{ marginTop: '15px' }}
                                >
                                    Back to Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Determine current view based on status
    const isPending = reservation.status === 'pending';
    const isPaid = reservation.status === 'paid';
    const isPickedUp = reservation.status === 'picked_up';
    const isExpired = reservation.status === 'expired' || (new Date() > new Date(reservation.expiresAt) && reservation.status === 'pending');

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Status Banner */}
                    <div className={styles.statusBanner} style={{
                        marginBottom: '20px',
                        padding: '15px',
                        borderRadius: '8px',
                        background: isPickedUp ? '#dcfce7' : isPaid ? '#dbeafe' : isExpired ? '#fee2e2' : '#fef9c3',
                        color: isPickedUp ? '#166534' : isPaid ? '#1e40af' : isExpired ? '#991b1b' : '#854d0e',
                        border: '1px solid currentColor'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isPickedUp && '✅ Customer Picked Up'}
                            {isPaid && '🎫 Ready for Pickup'}
                            {isPending && '⏳ Payment Pending'}
                            {isExpired && '❌ Reservation Expired'}
                        </h2>
                    </div>

                    {/* Pending State - Payment UI */}
                    {isPending && !isExpired && (
                        <div className={styles.card}>
                            <h1 className={styles.title}>💳 Complete Payment</h1>
                            <p className={styles.subtitle}>Reservation: {reservation.code}</p>

                            <div className={styles.reservationDetails} style={{ marginBottom: '20px' }}>
                                <div className={styles.productInfo}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{reservation.product.title}</h3>
                                        <p style={{ margin: 0 }}>Quantity: {reservation.quantity} at {reservation.store.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.paymentSection}>
                                <div className={styles.amountDisplay}>
                                    <span>Amount to Pay</span>
                                    <span className={styles.amount}>₹{parseFloat(reservation.totalAmount).toLocaleString()}</span>
                                </div>

                                <div className={styles.paymentMethods}>
                                    <h4>Select Payment Method</h4>
                                    <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                                        <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <span className={styles.paymentIcon}>📱</span> <span>UPI</span>
                                    </label>
                                    <label className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <span className={styles.paymentIcon}>💳</span> <span>Card</span>
                                    </label>
                                </div>

                                <button
                                    className={styles.primaryBtn}
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Paid/Ready State - QR UI */}
                    {(isPaid || isPickedUp) && reservation.qrCodeData && (
                        <div className={styles.card}>
                            <div className={styles.successHeader}>
                                <h1 className={styles.title}>Reservation: {reservation.code}</h1>
                            </div>

                            <div className={styles.qrSection}>
                                <h3>🎫 {isPickedUp ? 'Pickup Completed' : 'Scan at Kiosk'}</h3>
                                <div className={styles.qrCode} style={{ opacity: isPickedUp ? 0.5 : 1 }}>
                                    <img
                                        src={generateQRCodeUrl(reservation.qrCodeData)}
                                        alt="Pickup QR Code"
                                    />
                                </div>
                                {!isPickedUp && (
                                    <p className={styles.qrInstructions}>Show this QR code at the {reservation.store.name} kiosk</p>
                                )}
                            </div>

                            <div className={styles.storeDetails}>
                                <h4>📍 Location</h4>
                                <p className={styles.storeName}>{reservation.store.name}</p>
                                <p>{reservation.store.address}</p>
                                <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                                    Valid until: {new Date(reservation.expiresAt).toLocaleString()}
                                </p>
                            </div>

                            <div className={styles.actions}>
                                {isPaid && (
                                    <button
                                        className={styles.simKioskBtn}
                                        onClick={handleKioskScan}
                                        disabled={processing}
                                        style={{ background: '#eab308', marginBottom: '16px', color: 'black' }}
                                    >
                                        🤖 Simulate Kiosk Scan & Pickup
                                    </button>
                                )}
                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => router.push('/orders')}
                                >
                                    Back to Orders
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Expired State */}
                    {isExpired && (
                        <div className={styles.card}>
                            <p>This reservation has expired and can no longer be processed.</p>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => router.push('/products')}
                            >
                                Browse Products
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
