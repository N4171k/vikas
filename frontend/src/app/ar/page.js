'use client';

import { useState } from 'react';
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

    return (
        <div className={styles.page}>
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
