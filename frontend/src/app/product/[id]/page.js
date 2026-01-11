'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './page.module.css';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated, updateCartCount, fetchCartCount } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [recommendations, setRecommendations] = useState([]);
    const [stores, setStores] = useState([]);
    const [showStores, setShowStores] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState(null);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [askingAi, setAskingAi] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchRecommendations();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.getProduct(id);
            if (response.success) {
                setProduct(response.data.product);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await api.getRecommendations(id);
            if (response.success) {
                setRecommendations(response.data.products.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await api.getStoreAvailability(id);
            if (response.success) {
                setStores(response.data.stores);
                setShowStores(true);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/product/' + id);
            return;
        }

        setAddingToCart(true);
        try {
            const response = await api.addToCart(product.id, quantity);
            if (response.success) {
                setMessage({ type: 'success', text: 'Added to cart!' });
                await fetchCartCount();
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/product/' + id);
            return;
        }
        router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
    };

    const handleAskAi = async () => {
        if (!aiQuestion.trim()) return;

        setAskingAi(true);
        try {
            const response = await api.askProductQuestion(id, aiQuestion);
            if (response.success) {
                setAiResponse(response.data.response);
            }
        } catch (error) {
            setAiResponse('Sorry, I could not process your question.');
        } finally {
            setAskingAi(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}>
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading product...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.notFound}>
                        <h2>Product not found</h2>
                        <a href="/products" className="btn btn-primary">Browse Products</a>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/500'];

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                {/* Toast Message */}
                {message && (
                    <div className={`${styles.toast} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.container}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/products">Products</a>
                        <span>/</span>
                        <a href={`/products?category=${product.category}`}>{product.category}</a>
                        <span>/</span>
                        <span>{product.title.substring(0, 40)}...</span>
                    </nav>

                    <div className={styles.productLayout}>
                        {/* Image Gallery */}
                        <div className={styles.gallery}>
                            <div className={styles.mainImage}>
                                <img src={images[selectedImage]} alt={product.title} />
                            </div>
                            {images.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.thumbnail} ${selectedImage === idx ? styles.active : ''}`}
                                            onClick={() => setSelectedImage(idx)}
                                        >
                                            <img src={img} alt={`${product.title} ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className={styles.productInfo}>
                            {product.brand && <p className={styles.brand}>{product.brand}</p>}
                            <h1 className={styles.title}>{product.title}</h1>

                            {/* Rating */}
                            <div className={styles.rating}>
                                <div className={styles.stars}>{renderStars(product.rating)}</div>
                                <span className={styles.ratingValue}>{product.rating}</span>
                                <a href="#reviews" className={styles.reviewCount}>
                                    {product.rating_count?.toLocaleString()} ratings
                                </a>
                            </div>

                            <hr className={styles.divider} />

                            {/* Price */}
                            <div className={styles.priceSection}>
                                {product.discount_percentage > 0 && (
                                    <span className={styles.discount}>-{product.discount_percentage}%</span>
                                )}
                                <span className={styles.price}>
                                    <span className={styles.symbol}>₹</span>
                                    <span className={styles.amount}>{parseFloat(product.price).toLocaleString()}</span>
                                </span>
                                {product.original_price && (
                                    <span className={styles.mrp}>
                                        M.R.P.: <span className={styles.strikethrough}>₹{parseFloat(product.original_price).toLocaleString()}</span>
                                    </span>
                                )}
                            </div>

                            <p className={styles.taxInfo}>Inclusive of all taxes</p>

                            <hr className={styles.divider} />

                            {/* Description */}
                            <div className={styles.description}>
                                <h3>About this item</h3>
                                <p>{product.description}</p>
                            </div>

                            {/* Features */}
                            {product.features?.length > 0 && (
                                <div className={styles.features}>
                                    <h3>Features</h3>
                                    <ul>
                                        {product.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Buy Box */}
                        <div className={styles.buyBox}>
                            <div className={styles.buyBoxPrice}>
                                <span className={styles.symbol}>₹</span>
                                <span className={styles.amount}>{parseFloat(product.price).toLocaleString()}</span>
                            </div>

                            <p className={styles.freeDelivery}>
                                <span className={styles.checkIcon}>✓</span>
                                FREE Delivery
                            </p>

                            {/* Stock Status */}
                            {product.stock_online > 0 ? (
                                <p className={styles.inStock}>In Stock</p>
                            ) : (
                                <p className={styles.outOfStock}>Currently unavailable</p>
                            )}

                            {/* Quantity */}
                            {product.stock_online > 0 && (
                                <div className={styles.quantity}>
                                    <label>Qty:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    >
                                        {[...Array(Math.min(10, product.stock_online))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.addToCart} btn btn-primary btn-block`}
                                    onClick={handleAddToCart}
                                    disabled={!product.stock_online || addingToCart}
                                >
                                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>

                                <button
                                    className={`${styles.buyNow} btn btn-buy btn-block`}
                                    onClick={handleBuyNow}
                                    disabled={!product.stock_online}
                                >
                                    Buy Now
                                </button>

                                <button
                                    className={`${styles.findStore} btn btn-secondary btn-block`}
                                    onClick={fetchStores}
                                >
                                    📍 Find in Offline Store
                                </button>
                            </div>

                            {/* Seller Info */}
                            <div className={styles.sellerInfo}>
                                <p><span>Sold by:</span> VIKAS Retail</p>
                                <p><span>Fulfilled by:</span> VIKAS</p>
                            </div>
                        </div>
                    </div>

                    {/* Store Availability Modal */}
                    {showStores && (
                        <div className={styles.storeModal}>
                            <div className={styles.storeModalContent}>
                                <div className={styles.storeModalHeader}>
                                    <h2>Store Availability</h2>
                                    <button onClick={() => setShowStores(false)}>×</button>
                                </div>
                                <div className={styles.storeList}>
                                    {stores.length > 0 ? (
                                        stores.map((store, idx) => (
                                            <div key={idx} className={styles.storeItem}>
                                                <div className={styles.storeInfo}>
                                                    <h4>{store.store_name}</h4>
                                                    <p>{store.store_address}</p>
                                                    <p>{store.city} - {store.pincode}</p>
                                                    {store.phone && <p>📞 {store.phone}</p>}
                                                </div>
                                                <div className={styles.storeActions}>
                                                    <span className={store.stock > 5 ? styles.available : styles.limited}>
                                                        {store.stock} in stock
                                                    </span>
                                                    <a
                                                        href={`/reservation?productId=${product.id}&storeId=${store.id}&quantity=${quantity}`}
                                                        className={styles.reserveBtn}
                                                    >
                                                        Reserve & Pay
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.noStores}>No stores found with this product.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Assistant */}
                    <section className={styles.aiSection}>
                        <h2>🤖 Ask AI About This Product</h2>
                        <div className={styles.aiInput}>
                            <input
                                type="text"
                                placeholder="Ask anything about this product..."
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAskAi()}
                            />
                            <button onClick={handleAskAi} disabled={askingAi}>
                                {askingAi ? 'Thinking...' : 'Ask'}
                            </button>
                        </div>
                        {aiResponse && (
                            <div className={styles.aiResponse}>
                                <p>{aiResponse}</p>
                            </div>
                        )}
                    </section>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <section className={styles.recommendations}>
                            <h2>Customers who viewed this also viewed</h2>
                            <div className={styles.recommendationGrid}>
                                {recommendations.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
