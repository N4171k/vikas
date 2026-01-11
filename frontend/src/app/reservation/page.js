'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';

export default function ReservationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const [step, setStep] = useState('loading'); // loading, confirm, payment, success
    const [reservation, setReservation] = useState(null);
    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [qrCodeData, setQrCodeData] = useState(null);

    const productId = searchParams.get('productId');
    const storeId = searchParams.get('storeId');
    const quantity = parseInt(searchParams.get('quantity') || '1');

    useEffect(() => {
        if (!isAuthenticated) {
            const redirectPath = `/reservation?productId=${productId}&storeId=${storeId}&quantity=${quantity}`;
            router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }

        if (productId && storeId) {
            fetchProductDetails();
        }
    }, [isAuthenticated, productId, storeId]);

    const fetchProductDetails = async () => {
        try {
            const response = await api.getProduct(productId);
            if (response.success) {
                setProduct(response.data.product);
                // Store info from product page
                const storeMap = {
                    1: { id: 1, name: 'VIKAS Mall Store - Mumbai', address: 'Phoenix Marketcity, Kurla West', city: 'Mumbai' },
                    2: { id: 2, name: 'VIKAS Premium - Delhi', address: 'Select Citywalk, Saket', city: 'Delhi' },
                    3: { id: 3, name: 'VIKAS Express - Bangalore', address: 'Orion Mall, Rajajinagar', city: 'Bangalore' },
                    4: { id: 4, name: 'VIKAS Flagship - Hyderabad', address: 'Inorbit Mall, Madhapur', city: 'Hyderabad' },
                    5: { id: 5, name: 'VIKAS Store - Chennai', address: 'VR Chennai, Anna Nagar', city: 'Chennai' },
                    6: { id: 6, name: 'VIKAS Outlet - Pune', address: 'Phoenix Market City, Viman Nagar', city: 'Pune' }
                };
                setStore(storeMap[parseInt(storeId)]);
                setStep('confirm');
            }
        } catch (err) {
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReservation = async () => {
        setProcessing(true);
        setError(null);

        try {
            const response = await api.createReservation(productId, parseInt(storeId), quantity);
            if (response.success) {
                setReservation(response.data.reservation);
                setStep('payment');
            }
        } catch (err) {
            setError(err.message || 'Failed to create reservation');
        } finally {
            setProcessing(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);

        try {
            const response = await api.payReservation(reservation.id, paymentMethod);
            if (response.success) {
                setQrCodeData(response.data.qrCode);
                setReservation({
                    ...reservation,
                    ...response.data.reservation
                });
                setStep('success');
            }
        } catch (err) {
            setError(err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleKioskScan = async () => {
        if (!qrCodeData) return;

        setProcessing(true);
        setError(null);

        try {
            const response = await api.verifyReservation(qrCodeData.data);
            if (response.success) {
                // Update local reservation status to reflect picked up
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
        // Using QR Server API to generate QR code
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
                        <p>Loading...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Progress Steps */}
                    <div className={styles.progress}>
                        <div className={`${styles.progressStep} ${step === 'confirm' || step === 'payment' || step === 'success' ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>1</span>
                            <span className={styles.stepLabel}>Confirm</span>
                        </div>
                        <div className={styles.progressLine}></div>
                        <div className={`${styles.progressStep} ${step === 'payment' || step === 'success' ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>2</span>
                            <span className={styles.stepLabel}>Pay</span>
                        </div>
                        <div className={styles.progressLine}></div>
                        <div className={`${styles.progressStep} ${step === 'success' ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>3</span>
                            <span className={styles.stepLabel}>Get QR</span>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {/* Error State for Missing Data */}
                    {step === 'confirm' && (!product || !store) && (
                        <div className={styles.card}>
                            <div className={styles.error}>
                                <h3>⚠️ Missing Information</h3>
                                <p>We couldn't load the reservation details.</p>
                                <div style={{ marginTop: '10px', fontSize: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                    <p>Debug Info:</p>
                                    <p>Product ID: {productId || 'Missing'}</p>
                                    <p>Store ID: {storeId || 'Missing'}</p>
                                    <p>Store Data Found: {store ? 'Yes' : 'No'}</p>
                                </div>
                                <button
                                    className={styles.secondaryBtn}
                                    style={{ marginTop: '16px' }}
                                    onClick={() => router.push('/products')}
                                >
                                    Back to Products
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Confirm Reservation */}
                    {step === 'confirm' && product && store && (
                        <div className={styles.card}>
                            <h1 className={styles.title}>🏪 Reserve at Store</h1>
                            <p className={styles.subtitle}>Skip the billing queue - pay now, pickup instantly!</p>

                            <div className={styles.reservationDetails}>
                                <div className={styles.productInfo}>
                                    <img
                                        src={product.images?.[0] || 'https://via.placeholder.com/100'}
                                        alt={product.title}
                                        className={styles.productImage}
                                    />
                                    <div>
                                        <h3>{product.title}</h3>
                                        <p className={styles.price}>₹{parseFloat(product.price).toLocaleString()}</p>
                                        <p className={styles.qty}>Quantity: {quantity}</p>
                                    </div>
                                </div>

                                <div className={styles.storeInfo}>
                                    <h4>📍 Pickup Store</h4>
                                    <p className={styles.storeName}>{store.name}</p>
                                    <p className={styles.storeAddress}>{store.address}</p>
                                    <p className={styles.storeCity}>{store.city}</p>
                                </div>

                                <div className={styles.totalSection}>
                                    <div className={styles.totalRow}>
                                        <span>Subtotal</span>
                                        <span>₹{(parseFloat(product.price) * quantity).toLocaleString()}</span>
                                    </div>
                                    <div className={styles.totalRow}>
                                        <span>Convenience Fee</span>
                                        <span className={styles.free}>FREE</span>
                                    </div>
                                    <hr />
                                    <div className={styles.totalRow + ' ' + styles.grandTotal}>
                                        <span>Total</span>
                                        <span>₹{(parseFloat(product.price) * quantity).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className={styles.benefits}>
                                    <h4>✨ Benefits</h4>
                                    <ul>
                                        <li>⚡ Skip long billing queues</li>
                                        <li>📱 Just scan QR at kiosk</li>
                                        <li>🎁 Item ready for pickup</li>
                                        <li>⏰ Valid for 24 hours</li>
                                    </ul>
                                </div>

                                <button
                                    className={styles.primaryBtn}
                                    onClick={handleCreateReservation}
                                    disabled={processing}
                                >
                                    {processing ? 'Creating Reservation...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 'payment' && reservation && (
                        <div className={styles.card}>
                            <h1 className={styles.title}>💳 Payment</h1>
                            <p className={styles.subtitle}>Reservation: {reservation.code}</p>

                            <div className={styles.paymentSection}>
                                <div className={styles.amountDisplay}>
                                    <span>Amount to Pay</span>
                                    <span className={styles.amount}>₹{parseFloat(reservation.totalAmount).toLocaleString()}</span>
                                </div>

                                <div className={styles.paymentMethods}>
                                    <h4>Select Payment Method</h4>

                                    <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === 'upi'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className={styles.paymentIcon}>📱</span>
                                        <span>UPI (GPay, PhonePe, Paytm)</span>
                                    </label>

                                    <label className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className={styles.paymentIcon}>💳</span>
                                        <span>Credit / Debit Card</span>
                                    </label>

                                    <label className={`${styles.paymentOption} ${paymentMethod === 'netbanking' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="netbanking"
                                            checked={paymentMethod === 'netbanking'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className={styles.paymentIcon}>🏦</span>
                                        <span>Net Banking</span>
                                    </label>
                                </div>

                                <div className={styles.simulationNote}>
                                    <p>🧪 This is a simulated payment. Click "Pay Now" to proceed.</p>
                                </div>

                                <button
                                    className={styles.primaryBtn}
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing Payment...' : `Pay ₹${parseFloat(reservation.totalAmount).toLocaleString()}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success - QR Code */}
                    {step === 'success' && qrCodeData && (
                        <div className={styles.card}>
                            <div className={styles.successHeader}>
                                <span className={styles.successIcon}>✅</span>
                                <h1 className={styles.title}>Reservation Confirmed!</h1>
                                <p className={styles.reservationCode}>{reservation.code}</p>
                            </div>

                            <div className={styles.qrSection}>
                                <h3>🎫 Your Pickup QR Code</h3>
                                <div className={styles.qrCode}>
                                    <img
                                        src={generateQRCodeUrl(qrCodeData.data)}
                                        alt="Pickup QR Code"
                                    />
                                </div>
                                <p className={styles.qrInstructions}>
                                    Show this QR code at the store kiosk
                                </p>
                            </div>

                            <div className={styles.pickupInstructions}>
                                <h4>📋 Pickup Instructions</h4>
                                <ol>
                                    {qrCodeData.instructions.map((instruction, idx) => (
                                        <li key={idx}>{instruction}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className={styles.storeDetails}>
                                <h4>📍 Pickup Location</h4>
                                <p className={styles.storeName}>{store?.name}</p>
                                <p>{store?.address}</p>
                            </div>

                            <div className={styles.actions}>
                                {reservation.status !== 'picked_up' && (
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
                                    className={styles.secondaryBtn}
                                    onClick={() => router.push('/orders')}
                                >
                                    View My Reservations
                                </button>
                                <button
                                    className={styles.primaryBtn}
                                    onClick={() => router.push('/products')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
