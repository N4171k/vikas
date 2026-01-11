'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import styles from './page.module.css';

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirect = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirect);
        }
    }, [isAuthenticated, redirect, router]);

    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            if (response.success) {
                router.push(redirect);
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.splitLayout}>
                        {/* Left Side - Login Form */}
                        <div className={styles.authSection}>
                            <h1 className={styles.title}>Welcome Back</h1>
                            <p className={styles.subtitle}>Sign in to continue to VIKAS</p>

                            {error && <div className={styles.error}>{error}</div>}

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="········"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-block ${styles.submitBtn}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <div className={styles.divider}>
                                <span>New to VIKAS?</span>
                            </div>

                            <Link href="/auth/register" className={`btn btn-secondary btn-block ${styles.registerBtn}`}>
                                Create Account
                            </Link>
                        </div>

                        {/* Right Side - About VIKAS */}
                        <div className={styles.infoSection}>
                            <div className={styles.infoContent}>
                                <div className={styles.infoLogo}>VIKAS</div>
                                <p className={styles.infoTagline}>Experience the future of shopping</p>

                                <div className={styles.featuresList}>
                                    <div className={styles.featureItem}>
                                        <span className={styles.featureIcon}>🤖</span>
                                        <div className={styles.featureText}>
                                            <h4>AI Shopping Assistant</h4>
                                            <p>Chat with our intelligent assistant to find products, get recommendations, and compare items instantly.</p>
                                        </div>
                                    </div>

                                    <div className={styles.featureItem}>
                                        <span className={styles.featureIcon}>👓</span>
                                        <div className={styles.featureText}>
                                            <h4>Immersive Experience (Coming Soon)</h4>
                                            <p>Future planned: Try before you buy with our AR Virtual Try-On and interactive 3D product viewer.</p>
                                        </div>
                                    </div>

                                    <div className={styles.featureItem}>
                                        <span className={styles.featureIcon}>📍</span>
                                        <div className={styles.featureText}>
                                            <h4>Omni-channel Shopping</h4>
                                            <p>Example seamless integration between our online platform and physical stores with real-time stock availability.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}
