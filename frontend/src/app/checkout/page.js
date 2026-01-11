'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, user, updateCartCount } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Buy Now mode
    const buyNowProductId = searchParams.get('productId');
    const buyNowQuantity = searchParams.get('quantity') || 1;
    const [buyNowProduct, setBuyNowProduct] = useState(null);

    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/checkout');
            return;
        }

        if (buyNowProductId) {
            fetchProduct();
        } else {
            fetchCart();
        }
    }, [isAuthenticated, buyNowProductId]);

    const fetchCart = async () => {
        try {
            const response = await api.getCart();
            if (response.success) {
                if (response.data.items.length === 0) {
                    router.push('/cart');
                    return;
                }
                setCart(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await api.getProduct(buyNowProductId);
            if (response.success) {
                setBuyNowProduct(response.data.product);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateAddress = () => {
        const { fullName, phone, address: addr, city, state, pincode } = address;
        if (!fullName || !phone || !addr || !city || !state || !pincode) {
            setError('Please fill in all address fields');
            return false;
        }
        if (!/^\d{10}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }
        if (!/^\d{6}$/.test(pincode)) {
            setError('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateAddress()) return;

        setSubmitting(true);
        setError(null);

        try {
            let response;

            if (buyNowProduct) {
                response = await api.buyNow(
                    buyNowProduct.id,
                    parseInt(buyNowQuantity),
                    address,
                    'cod'
                );
            } else {
                response = await api.createOrder(address, 'cod');
            }

            if (response.success) {
                updateCartCount(0);
                router.push(`/orders?success=${response.data.order.order_number}`);
            }
        } catch (error) {
            setError(error.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate totals for Buy Now
    const getBuyNowTotal = () => {
        if (!buyNowProduct) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
        const subtotal = parseFloat(buyNowProduct.price) * parseInt(buyNowQuantity);
        const tax = subtotal * 0.18;
        const shipping = subtotal > 499 ? 0 : 40;
        const total = subtotal + tax + shipping;
        return { subtotal, tax, shipping, total };
    };

    if (!isAuthenticated) return null;

    const totals = buyNowProduct ? getBuyNowTotal() : null;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Checkout</h1>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div className={styles.checkoutLayout}>
                            {/* Left - Address & Items */}
                            <div className={styles.leftSection}>
                                {/* Shipping Address */}
                                <div className={styles.section}>
                                    <h2>1. Shipping Address</h2>
                                    <div className={styles.addressForm}>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Full Name</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={address.fullName}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={address.phone}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    placeholder="10-digit mobile number"
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Address</label>
                                            <textarea
                                                name="address"
                                                value={address.address}
                                                onChange={handleInputChange}
                                                className={styles.textarea}
                                                placeholder="House No., Building, Street, Area"
                                                rows={3}
                                            />
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={address.city}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={address.state}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Pincode</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={address.pincode}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    placeholder="6-digit pincode"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className={styles.section}>
                                    <h2>2. Review Items</h2>
                                    <div className={styles.items}>
                                        {buyNowProduct ? (
                                            <div className={styles.item}>
                                                <img
                                                    src={buyNowProduct.images?.[0] || 'https://via.placeholder.com/100'}
                                                    alt={buyNowProduct.title}
                                                />
                                                <div className={styles.itemInfo}>
                                                    <p className={styles.itemTitle}>{buyNowProduct.title}</p>
                                                    <p className={styles.itemPrice}>₹{parseFloat(buyNowProduct.price).toLocaleString()}</p>
                                                    <p className={styles.itemQty}>Qty: {buyNowQuantity}</p>
                                                </div>
                                            </div>
                                        ) : cart?.items.map(item => (
                                            <div key={item.id} className={styles.item}>
                                                <img
                                                    src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                                                    alt={item.product.title}
                                                />
                                                <div className={styles.itemInfo}>
                                                    <p className={styles.itemTitle}>{item.product.title}</p>
                                                    <p className={styles.itemPrice}>₹{parseFloat(item.product.price).toLocaleString()}</p>
                                                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className={styles.section}>
                                    <h2>3. Payment Method</h2>
                                    <div className={styles.paymentOptions}>
                                        <label className={styles.paymentOption}>
                                            <input type="radio" name="payment" checked readOnly />
                                            <span>Cash on Delivery (COD)</span>
                                        </label>
                                        <p className={styles.paymentNote}>
                                            * Other payment methods coming soon
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Order Summary */}
                            <div className={styles.rightSection}>
                                <div className={styles.summaryCard}>
                                    <h3>Order Summary</h3>

                                    {error && (
                                        <div className={styles.error}>{error}</div>
                                    )}

                                    <div className={styles.summaryRows}>
                                        <div className={styles.summaryRow}>
                                            <span>Subtotal</span>
                                            <span>₹{(buyNowProduct ? totals.subtotal : parseFloat(cart?.summary.subtotal)).toLocaleString()}</span>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>Delivery</span>
                                            <span>{(buyNowProduct ? totals.shipping : parseFloat(cart?.summary.shipping)) === 0 ? 'FREE' : `₹${buyNowProduct ? totals.shipping : cart?.summary.shipping}`}</span>
                                        </div>
                                        <div className={styles.summaryRow}>
                                            <span>Tax (GST)</span>
                                            <span>₹{(buyNowProduct ? totals.tax : parseFloat(cart?.summary.tax)).toLocaleString()}</span>
                                        </div>
                                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                            <span>Order Total</span>
                                            <span className={styles.totalAmount}>
                                                ₹{(buyNowProduct ? totals.total : parseFloat(cart?.summary.total)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className={`btn btn-buy btn-block ${styles.placeOrderBtn}`}
                                        onClick={handlePlaceOrder}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Processing...' : 'Place Order'}
                                    </button>

                                    <p className={styles.termsNote}>
                                        By placing your order, you agree to VIKAS's privacy policy and terms of use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}
