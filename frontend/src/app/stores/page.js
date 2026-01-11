'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from './page.module.css';

// Mock store data
const storeData = [
    {
        id: 'STORE-MUM-001',
        name: 'VIKAS Electronics Hub - Andheri',
        city: 'Mumbai',
        pincode: '400053',
        address: 'Shop 12, Infinity Mall, Andheri West',
        phone: '022-26234567',
        hours: '10:00 AM - 9:00 PM',
        features: ['Electronics', 'Mobile Phones', 'Laptops']
    },
    {
        id: 'STORE-MUM-002',
        name: 'VIKAS Lifestyle Store - Bandra',
        city: 'Mumbai',
        pincode: '400050',
        address: 'Ground Floor, Linking Road, Bandra West',
        phone: '022-26457890',
        hours: '10:00 AM - 10:00 PM',
        features: ['Fashion', 'Beauty', 'Home Decor']
    },
    {
        id: 'STORE-DEL-001',
        name: 'VIKAS Mega Store - Connaught Place',
        city: 'Delhi',
        pincode: '110001',
        address: 'Block A, Connaught Place',
        phone: '011-23456789',
        hours: '10:00 AM - 9:00 PM',
        features: ['All Categories', 'Premium Zone']
    },
    {
        id: 'STORE-DEL-002',
        name: 'VIKAS Express - Saket',
        city: 'Delhi',
        pincode: '110017',
        address: 'Select Citywalk Mall, Saket',
        phone: '011-29876543',
        hours: '10:00 AM - 10:00 PM',
        features: ['Electronics', 'Fashion', 'Quick Pickup']
    },
    {
        id: 'STORE-BLR-001',
        name: 'VIKAS Tech World - Koramangala',
        city: 'Bangalore',
        pincode: '560034',
        address: '80 Feet Road, Koramangala',
        phone: '080-41234567',
        hours: '10:00 AM - 9:00 PM',
        features: ['Electronics', 'Gaming', 'Mobile Phones']
    },
    {
        id: 'STORE-BLR-002',
        name: 'VIKAS Home & Living - Indiranagar',
        city: 'Bangalore',
        pincode: '560038',
        address: '100 Feet Road, Indiranagar',
        phone: '080-42345678',
        hours: '10:00 AM - 9:00 PM',
        features: ['Home & Kitchen', 'Furniture', 'Decor']
    }
];

export default function StoresPage() {
    const [searchCity, setSearchCity] = useState('');
    const [filteredStores, setFilteredStores] = useState(storeData);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            const filtered = storeData.filter(store =>
                store.city.toLowerCase().includes(searchCity.toLowerCase()) ||
                store.pincode.includes(searchCity)
            );
            setFilteredStores(filtered);
        } else {
            setFilteredStores(storeData);
        }
    };

    const cities = [...new Set(storeData.map(s => s.city))];

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <section className={styles.hero}>
                        <h1>Find a VIKAS Store Near You</h1>
                        <p>Experience our products in person. Visit a VIKAS store today.</p>

                        <form className={styles.searchForm} onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Enter city or pincode"
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className={styles.searchInput}
                            />
                            <button type="submit" className="btn btn-primary">
                                Find Stores
                            </button>
                        </form>

                        <div className={styles.quickLinks}>
                            {cities.map(city => (
                                <button
                                    key={city}
                                    className={styles.quickLink}
                                    onClick={() => { setSearchCity(city); handleSearch({ preventDefault: () => { } }); }}
                                >
                                    {city}
                                </button>
                            ))}
                            <button
                                className={styles.quickLink}
                                onClick={() => { setSearchCity(''); setFilteredStores(storeData); }}
                            >
                                All Stores
                            </button>
                        </div>
                    </section>

                    {/* Stores List */}
                    <section className={styles.storesSection}>
                        <h2>{filteredStores.length} Stores Found</h2>

                        <div className={styles.storesGrid}>
                            {filteredStores.map(store => (
                                <div key={store.id} className={styles.storeCard}>
                                    <div className={styles.storeImage}>
                                        <div className={styles.storeIcon}>🏬</div>
                                    </div>
                                    <div className={styles.storeInfo}>
                                        <h3>{store.name}</h3>
                                        <p className={styles.storeAddress}>{store.address}</p>
                                        <p className={styles.storeCity}>{store.city} - {store.pincode}</p>
                                        <p className={styles.storePhone}>📞 {store.phone}</p>
                                        <p className={styles.storeHours}>🕐 {store.hours}</p>
                                        <div className={styles.storeFeatures}>
                                            {store.features.map(feature => (
                                                <span key={feature} className={styles.feature}>{feature}</span>
                                            ))}
                                        </div>
                                        <div className={styles.storeActions}>
                                            <button className={`btn btn-secondary ${styles.directionBtn}`}>
                                                Get Directions
                                            </button>
                                            <button className={`btn btn-primary ${styles.callBtn}`}>
                                                Call Store
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredStores.length === 0 && (
                            <div className={styles.noStores}>
                                <h3>No stores found in this area</h3>
                                <p>Try searching for a different city or pincode</p>
                            </div>
                        )}
                    </section>

                    {/* Services Section */}
                    <section className={styles.servicesSection}>
                        <h2>In-Store Services</h2>
                        <div className={styles.servicesGrid}>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>📦</div>
                                <h4>Click & Collect</h4>
                                <p>Order online, pick up in-store within hours</p>
                            </div>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>🔄</div>
                                <h4>Easy Returns</h4>
                                <p>Return or exchange items at any store</p>
                            </div>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>🎯</div>
                                <h4>Product Demos</h4>
                                <p>Try before you buy with live demonstrations</p>
                            </div>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>🤖</div>
                                <h4>AI Assistance</h4>
                                <p>Get personalized recommendations from our AI kiosks</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
