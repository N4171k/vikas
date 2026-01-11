'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';

export default function CartPage() {
    const router = useRouter();
    const { isAuthenticated, updateCartCount } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/cart');
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await api.getCart();
            if (response.success) {
                setCart(response.data);
                updateCartCount(response.data.items.length);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, quantity) => {
        setUpdating(itemId);
        try {
            await api.updateCartItem(itemId, quantity);
            await fetchCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId) => {
        setUpdating(itemId);
        try {
            await api.removeFromCart(itemId);
            await fetchCart();
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Shopping Cart</h1>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading cart...</p>
                        </div>
                    ) : !cart || cart.items.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyIcon}>🛒</div>
                            <h2>Your cart is empty</h2>
                            <p>Looks like you haven't added anything to your cart yet.</p>
                            <a href="/products" className="btn btn-primary">
                                Continue Shopping
                            </a>
                        </div>
                    ) : (
                        <div className={styles.cartLayout}>
                            {/* Cart Items */}
                            <div className={styles.cartItems}>
                                <div className={styles.cartHeader}>
                                    <span>Price</span>
                                </div>

                                {cart.items.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            <a href={`/product/${item.product.id}`}>
                                                <img
                                                    src={item.product.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={item.product.title}
                                                />
                                            </a>
                                        </div>

                                        <div className={styles.itemDetails}>
                                            <a href={`/product/${item.product.id}`} className={styles.itemTitle}>
                                                {item.product.title}
                                            </a>
                                            {item.product.brand && (
                                                <p className={styles.itemBrand}>{item.product.brand}</p>
                                            )}
                                            <p className={styles.itemStock}>
                                                {item.product.stock_online > 0 ? (
                                                    <span className={styles.inStock}>In Stock</span>
                                                ) : (
                                                    <span className={styles.outOfStock}>Out of Stock</span>
                                                )}
                                            </p>

                                            <div className={styles.itemActions}>
                                                <div className={styles.quantityControl}>
                                                    <label>Qty:</label>
                                                    <select
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                                        disabled={updating === item.id}
                                                    >
                                                        {[...Array(10)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <span className={styles.actionDivider}>|</span>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={updating === item.id}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className={styles.itemPrice}>
                                            <span className={styles.price}>
                                                ₹{parseFloat(item.product.price).toLocaleString()}
                                            </span>
                                            {item.product.original_price && (
                                                <span className={styles.originalPrice}>
                                                    ₹{parseFloat(item.product.original_price).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className={styles.subtotalRow}>
                                    <span>
                                        Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}):
                                    </span>
                                    <span className={styles.subtotalAmount}>
                                        ₹{parseFloat(cart.summary.subtotal).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className={styles.orderSummary}>
                                <div className={styles.summaryCard}>
                                    {parseFloat(cart.summary.subtotal) > 499 && (
                                        <p className={styles.freeDeliveryMsg}>
                                            ✓ Your order is eligible for FREE Delivery
                                        </p>
                                    )}

                                    <p className={styles.summarySubtotal}>
                                        Subtotal ({cart.items.length} items):
                                        <strong> ₹{parseFloat(cart.summary.subtotal).toLocaleString()}</strong>
                                    </p>

                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>

                                <div className={styles.priceBreakdown}>
                                    <h4>Price Details</h4>
                                    <div className={styles.breakdownRow}>
                                        <span>Subtotal</span>
                                        <span>₹{parseFloat(cart.summary.subtotal).toLocaleString()}</span>
                                    </div>
                                    {parseFloat(cart.summary.discount) > 0 && (
                                        <div className={styles.breakdownRow}>
                                            <span>Discount</span>
                                            <span className={styles.discountAmount}>
                                                -₹{parseFloat(cart.summary.discount).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.breakdownRow}>
                                        <span>Delivery</span>
                                        <span>{parseFloat(cart.summary.shipping) === 0 ? 'FREE' : `₹${cart.summary.shipping}`}</span>
                                    </div>
                                    <div className={styles.breakdownRow}>
                                        <span>Tax (GST 18%)</span>
                                        <span>₹{parseFloat(cart.summary.tax).toLocaleString()}</span>
                                    </div>
                                    <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                                        <span>Total</span>
                                        <span>₹{parseFloat(cart.summary.total).toLocaleString()}</span>
                                    </div>
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
