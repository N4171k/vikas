'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import styles from './page.module.css';

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.getProducts({ limit: 20 }),
                api.getCategories()
            ]);

            if (productsRes.success) {
                setProducts(productsRes.data.products);
                const sorted = [...productsRes.data.products].sort((a, b) => b.rating - a.rating);
                setFeaturedProducts(sorted.slice(0, 5));
            }

            if (categoriesRes.success) {
                setCategories(categoriesRes.data.categories.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryImages = {
        'Clothing and Accessories': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
        'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        'Toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
        'Belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <h1 className={styles.heroTitle}>
                                Shop Smarter with <span>AI</span>
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Discover 28,000+ fashion products with intelligent recommendations,
                                seamless checkout, and omnichannel shopping experience.
                            </p>
                            <div className={styles.heroCta}>
                                <a href="/products" className="btn btn-primary btn-lg">
                                    Explore Products
                                </a>
                                <a href="/stores" className="btn btn-secondary btn-lg">
                                    Find Store
                                </a>
                            </div>
                            <div className={styles.heroStats}>
                                <div className={styles.stat}>
                                    <div className={styles.statNumber}>28K+</div>
                                    <div className={styles.statLabel}>Products</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.statNumber}>4.8</div>
                                    <div className={styles.statLabel}>Avg Rating</div>
                                </div>
                                <div className={styles.stat}>
                                    <div className={styles.statNumber}>6</div>
                                    <div className={styles.statLabel}>Stores</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.heroVisual}>
                            <div className={styles.heroGlow}></div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Shop by Category</h2>
                            <a href="/products" className={styles.viewAll}>
                                View all →
                            </a>
                        </div>
                        <div className={styles.categoryGrid}>
                            {categories.map((category) => (
                                <a
                                    key={category}
                                    href={`/products?category=${encodeURIComponent(category)}`}
                                    className={styles.categoryCard}
                                >
                                    <div className={styles.categoryImage}>
                                        <img
                                            src={categoryImages[category] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                                            alt={category}
                                        />
                                    </div>
                                    <h3 className={styles.categoryName}>{category}</h3>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Top Rated */}
                <section className={`${styles.section} ${styles.sectionDark}`}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Top Rated</h2>
                            <a href="/products?sortBy=rating&sortOrder=DESC" className={styles.viewAll}>
                                View all →
                            </a>
                        </div>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>Loading products...</p>
                            </div>
                        ) : (
                            <div className={styles.productGrid}>
                                {featuredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* All Products */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Trending Now</h2>
                            <a href="/products" className={styles.viewAll}>
                                View all →
                            </a>
                        </div>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                            </div>
                        ) : (
                            <div className={styles.productGrid}>
                                {products.slice(0, 10).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* AI Section */}
                <section className={styles.aiSection}>
                    <div className={styles.container}>
                        <div className={styles.aiContent}>
                            <div className={styles.aiIcon}>🤖</div>
                            <h2 className={styles.aiTitle}>Meet Your AI Shopping Assistant</h2>
                            <p className={styles.aiDescription}>
                                Ask questions, get personalized recommendations, compare products,
                                and discover the perfect items for your style.
                            </p>
                            <div className={styles.aiFeatures}>
                                <div className={styles.aiFeature}>
                                    <span className={styles.featureIcon}>🔍</span>
                                    <span>Smart Search</span>
                                </div>
                                <div className={styles.aiFeature}>
                                    <span className={styles.featureIcon}>💡</span>
                                    <span>Recommendations</span>
                                </div>
                                <div className={styles.aiFeature}>
                                    <span className={styles.featureIcon}>⚖️</span>
                                    <span>Compare</span>
                                </div>
                                <div className={styles.aiFeature}>
                                    <span className={styles.featureIcon}>📍</span>
                                    <span>Find Stores</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust */}
                <section className={styles.trustSection}>
                    <div className={styles.container}>
                        <div className={styles.trustGrid}>
                            <div className={styles.trustItem}>
                                <div className={styles.trustIcon}>🚚</div>
                                <h4>Free Delivery</h4>
                                <p>On orders over ₹499</p>
                            </div>
                            <div className={styles.trustItem}>
                                <div className={styles.trustIcon}>🔒</div>
                                <h4>Secure Payment</h4>
                                <p>100% protected</p>
                            </div>
                            <div className={styles.trustItem}>
                                <div className={styles.trustIcon}>↩️</div>
                                <h4>Easy Returns</h4>
                                <p>30-day policy</p>
                            </div>
                            <div className={styles.trustItem}>
                                <div className={styles.trustIcon}>🏬</div>
                                <h4>Omnichannel</h4>
                                <p>Online + offline</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
