'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import styles from './Header.module.css';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, isAuthenticated, logout, cartCount } = useAuth();
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
        router.push('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>V</div>
                    <span className={styles.logoText}>VIKAS</span>
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} className={styles.search}>
                    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search 28,000+ products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        id="tour-search"
                    />
                    <button type="submit" className={styles.searchBtn}>
                        Search
                    </button>
                </form>

                {/* Account & Cart - Right aligned */}
                <div className={styles.actions}>
                    {/* User Menu */}
                    <div className={styles.userMenu}>
                        <button
                            id="tour-account"
                            className={styles.userBtn}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className={styles.avatar}>
                                {isAuthenticated ? user?.name?.charAt(0).toUpperCase() : '👤'}
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.greeting}>
                                    {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}` : 'Hello'}
                                </span>
                                <span className={styles.account}>
                                    {isAuthenticated ? 'Account ▾' : 'Sign in ▾'}
                                </span>
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className={styles.dropdown}>
                                {isAuthenticated ? (
                                    <>
                                        <Link href="/orders" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                                            <span>📦</span> My Orders
                                        </Link>
                                        <Link href="/stores" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                                            <span>🏪</span> Find Stores
                                        </Link>
                                        <hr className={styles.divider} />
                                        <button onClick={() => { localStorage.removeItem('vikas_tour_seen'); window.location.reload(); }} className={styles.dropdownItem}>
                                            <span>👀</span> Watch Tutorial Again
                                        </button>
                                        <Link href="/account/change-password" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                                            <span>🔒</span> Change Password
                                        </Link>
                                        <hr className={styles.divider} />
                                        <button onClick={handleLogout} className={styles.dropdownItem}>
                                            <span>🚪</span> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                                            <span>🔑</span> Sign In
                                        </Link>
                                        <Link href="/auth/register" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                                            <span>✨</span> Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <Link href="/cart" className={styles.cart} id="tour-cart">
                        <div className={styles.cartIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 6h15l-1.5 9h-12z" />
                                <circle cx="9" cy="20" r="1" />
                                <circle cx="18" cy="20" r="1" />
                                <path d="M6 6L5 3H2" />
                            </svg>
                            {cartCount > 0 && (
                                <span className={styles.cartBadge}>{cartCount}</span>
                            )}
                        </div>
                        <span className={styles.cartText}>Cart</span>
                    </Link>
                </div>
            </div>

            {/* Category Nav */}
            <nav className={styles.nav}>
                <div className={styles.navInner}>
                    <Link href="/products" className={styles.navLink}>All Products</Link>
                    <Link href="/products?category=Clothing+and+Accessories" className={styles.navLink}>Fashion</Link>
                    <Link href="/products?category=Footwear" className={styles.navLink}>Footwear</Link>
                    <Link href="/products?category=Toys" className={styles.navLink}>Toys</Link>
                    <Link href="/stores" className={styles.navLink} id="tour-store-finder">
                        <span className={styles.storeIcon}>📍</span> Find Store
                    </Link>
                    <Link href="/ar" className={styles.navLink} style={{ color: '#FF9900' }}>
                        <span style={{ marginRight: '4px' }}>👓</span> AR Beta
                    </Link>
                </div>
            </nav>
        </header>
    );
}
