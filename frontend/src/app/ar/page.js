'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

// Dynamically import ARView to avoid SSR issues with browser APIs (camera, window, canvas)
const ARView = dynamic(() => import('../../components/ARView'), {
    ssr: false,
    loading: () => <div className={styles.loadingOverlay}>Loading AR Engine...</div>
});

export default function ARPage() {
    const [activeExperience, setActiveExperience] = useState(null);
    const [showBanner, setShowBanner] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Check if user has seen the popup before
        const hasSeenPopup = localStorage.getItem('ar-popup-seen');
        if (!hasSeenPopup) {
            setShowPopup(true);
        }
        
        // Check if user has dismissed the banner
        const bannerDismissed = localStorage.getItem('ar-banner-dismissed');
        if (bannerDismissed) {
            setShowBanner(false);
        }
    }, []);

    const handleCloseBanner = () => {
        setShowBanner(false);
        localStorage.setItem('ar-banner-dismissed', 'true');
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        localStorage.setItem('ar-popup-seen', 'true');
    };

    return (
        <div className={styles.page}>
            {/* Context Banner */}
            {showBanner && (
                <div className={styles.banner}>
                    <div className={styles.bannerContent}>
                        <div className={styles.bannerText}>
                            <span className={styles.bannerIcon}>ℹ️</span>
                            <span>
                                <strong>Local Mode Required:</strong> This AR feature only works by running the app locally. 
                                Please clone the repository from{' '}
                                <a 
                                    href="https://github.com/N4171k/vikas" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.bannerLink}
                                >
                                    GitHub
                                </a>
                            </span>
                        </div>
                        <button 
                            className={styles.bannerClose}
                            onClick={handleCloseBanner}
                            aria-label="Close banner"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Context Popup */}
            {showPopup && (
                <div className={styles.popupOverlay} onClick={handleClosePopup}>
                    <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                        <button 
                            className={styles.popupClose}
                            onClick={handleClosePopup}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                        <div className={styles.popupIcon}>🚀</div>
                        <h2 className={styles.popupTitle}>AR Feature - Local Setup Required</h2>
                        <p className={styles.popupText}>
                            To experience our Augmented Reality features, you need to run this application locally 
                            on your device. This is because AR requires direct camera access and local processing.
                        </p>
                        <div className={styles.popupSteps}>
                            <h3>Quick Setup:</h3>
                            <ol>
                                <li>Clone the repository from GitHub</li>
                                <li>Install dependencies and run locally</li>
                                <li>Allow camera permissions when prompted</li>
                            </ol>
                        </div>
                        <a 
                            href="https://github.com/N4171k/vikas" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.popupButton}
                        >
                            Visit GitHub Repository
                        </a>
                        <button 
                            className={styles.popupButtonSecondary}
                            onClick={handleClosePopup}
                        >
                            Got It, Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Main Selection Screen */}
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>← Back to Shop</Link>
                    <h1>VIKAS AR Beta</h1>
                    <p>Experience our products in your space using Augmented Reality.</p>
                </div>

                <div className={styles.grid}>
                    {/* Experience Card 1: Glasses */}
                    <div className={styles.card} onClick={() => setActiveExperience('glasses')}>
                        <div className={styles.cardImage}>
                            <span className={styles.icon}>👓</span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Virtual Glasses</h3>
                            <p>Try on our latest eyewear collection.</p>
                            <button className={styles.tryBtn}>Try On</button>
                        </div>
                    </div>

                    {/* Experience Card 2: Cap */}
                    <div className={styles.card} onClick={() => setActiveExperience('cap')}>
                        <div className={styles.cardImage}>
                            <span className={styles.icon}>🧢</span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Baseball Cap</h3>
                            <p>See how this cap fits your style.</p>
                            <button className={styles.tryBtn}>Try On</button>
                        </div>
                    </div>

                    {/* Experience Card 3: Knit Cap */}
                    <div className={styles.card} onClick={() => setActiveExperience('knitcap')}>
                        <div className={styles.cardImage}>
                            <span className={styles.icon}>🧶</span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Winter Knit Cap</h3>
                            <p>Perfect for cold days. Try it on!</p>
                            <button className={styles.tryBtn}>Try On</button>
                        </div>
                    </div>

                    {/* Experience Card 4: Glasses v2 */}
                    <div className={styles.card} onClick={() => setActiveExperience('glasses2')}>
                        <div className={styles.cardImage}>
                            <span className={styles.icon}>🕶️</span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>Designer Glasses</h3>
                            <p>Exclusive luxury frame try-on.</p>
                            <button className={styles.tryBtn}>Try On</button>
                        </div>
                    </div>
                </div>

                <div className={styles.betaNote}>
                    <span className={styles.badge}>BETA</span>
                    <p>This is an experimental feature. Performance may vary by device. Please ensure you are in a well-lit area and allow camera permissions.</p>
                </div>
            </div>

            {/* Active AR View Overlay */}
            {activeExperience && (
                <ARView
                    modelType={activeExperience}
                    onClose={() => setActiveExperience(null)}
                />
            )}
        </div>
    );
}
