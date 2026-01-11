'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
    const price = parseFloat(product.price) || 0;
    const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
    const discount = product.discount_percentage || 0;
    const rating = parseFloat(product.rating) || 0;
    const imageUrl = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <svg key={i} viewBox="0 0 24 24" className={i < fullStars ? styles.starFilled : styles.starEmpty}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            );
        }
        return stars;
    };

    return (
        <Link href={`/product/${product.id}`} className={styles.card}>
            {discount > 0 && (
                <div className={styles.badge}>-{discount}%</div>
            )}

            <div className={styles.imageWrapper}>
                <img
                    src={imageUrl}
                    alt={product.title}
                    className={styles.image}
                    loading="lazy"
                />
                <div className={styles.overlay}>
                    <span className={styles.quickView}>Quick View</span>
                </div>
            </div>

            <div className={styles.content}>
                <p className={styles.brand}>{product.brand || 'VIKAS'}</p>
                <h3 className={styles.title}>{product.title}</h3>

                <div className={styles.rating}>
                    <div className={styles.stars}>
                        {renderStars(rating)}
                    </div>
                    <span className={styles.ratingText}>
                        {rating.toFixed(1)} ({product.rating_count || 0})
                    </span>
                </div>

                <div className={styles.priceRow}>
                    <span className={styles.price}>₹{price.toLocaleString()}</span>
                    {originalPrice && originalPrice > price && (
                        <span className={styles.originalPrice}>₹{originalPrice.toLocaleString()}</span>
                    )}
                </div>

                {product.stock_online === 0 ? (
                    <p className={styles.outOfStock}>Out of Stock</p>
                ) : product.stock_online && product.stock_online < 10 ? (
                    <p className={styles.lowStock}>Only {product.stock_online} left!</p>
                ) : null}
            </div>
        </Link>
    );
}
