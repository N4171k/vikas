import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            {/* Back to top */}
            <button
                className={styles.backToTop}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                ↑ Back to top
            </button>

            {/* Main Footer */}
            <div className={styles.main}>
                <div className={styles.container}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>V</div>
                            <span className={styles.logoText}>VIKAS</span>
                        </div>
                        <p className={styles.tagline}>
                            Virtually Intelligent Knowledge Assisted Shopping
                        </p>
                        <p className={styles.description}>
                            The future of retail is here. AI-powered shopping with seamless omnichannel experience.
                        </p>
                    </div>

                    {/* Links */}
                    <div className={styles.links}>
                        <div className={styles.column}>
                            <h4>Shop</h4>
                            <Link href="/products">All Products</Link>
                            <Link href="/products?category=Clothing+and+Accessories">Fashion</Link>
                            <Link href="/products?category=Footwear">Footwear</Link>
                            <Link href="/products?category=Toys">Toys</Link>
                        </div>
                        <div className={styles.column}>
                            <h4>Help</h4>
                            <Link href="#">Track Order</Link>
                            <Link href="#">Returns</Link>
                            <Link href="#">FAQ</Link>
                            <Link href="#">Contact</Link>
                        </div>
                        <div className={styles.column}>
                            <h4>Company</h4>
                            <Link href="#">About Us</Link>
                            <Link href="#">Careers</Link>
                            <Link href="/stores">Find Store</Link>
                            <Link href="#">Blog</Link>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className={styles.newsletter}>
                        <h4>Stay Updated</h4>
                        <p>Get the latest deals and AI shopping tips</p>
                        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your email" />
                            <button type="submit">→</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottom}>
                <div className={styles.container}>
                    <p>© 2026 VIKAS. Made by CTRL Freaks ❤️</p>
                    <div className={styles.legal}>
                        <Link href="#">Privacy</Link>
                        <Link href="#">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
