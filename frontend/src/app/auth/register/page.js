'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import styles from '../login/page.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await register(email, password, name);
            if (response.success) {
                router.push('/');
            } else {
                setError(response.message || 'Registration failed');
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
                        {/* Left Side - Register Form */}
                        <div className={styles.authSection}>
                            <h1 className={styles.title}>Create Account</h1>
                            <p className={styles.subtitle}>Join VIKAS for a smarter shopping experience</p>

                            {error && <div className={styles.error}>{error}</div>}

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={styles.input}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="john@example.com"
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
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="Re-enter password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-block ${styles.submitBtn}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </form>

                            <div className={styles.divider}>
                                <span>Already have an account?</span>
                            </div>

                            <Link href="/auth/login" className={`btn btn-secondary btn-block ${styles.registerBtn}`}>
                                Sign In
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
                                            <p>Seamless integration between our online platform and physical stores with real-time stock availability.</p>
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
