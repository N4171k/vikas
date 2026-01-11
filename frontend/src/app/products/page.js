'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';
import styles from './page.module.css';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        search: searchParams.get('search') || '',
        sortBy: searchParams.get('sortBy') || 'created_at',
        sortOrder: searchParams.get('sortOrder') || 'DESC',
        page: 1
    });

    useEffect(() => {
        fetchProducts();
        fetchFilters();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: filters.page,
                limit: 12,
                ...(filters.category && { category: filters.category }),
                ...(filters.brand && { brand: filters.brand }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.minRating && { minRating: filters.minRating }),
                ...(filters.search && { search: filters.search }),
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            };

            const response = await api.getProducts(params);
            if (response.success) {
                setProducts(response.data.products);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                api.getCategories(),
                api.getBrands()
            ]);
            if (catRes.success) setCategories(catRes.data.categories);
            if (brandRes.success) setBrands(brandRes.data.brands);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            search: '',
            sortBy: 'created_at',
            sortOrder: 'DESC',
            page: 1
        });
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <a href="/">Home</a>
                        <span>/</span>
                        <span>{filters.category || 'All Products'}</span>
                    </nav>

                    <div className={styles.content}>
                        {/* Sidebar Filters */}
                        <aside className={styles.sidebar}>
                            <div className={styles.filterSection}>
                                <h3 className={styles.filterTitle}>Category</h3>
                                <ul className={styles.filterList}>
                                    <li>
                                        <button
                                            className={!filters.category ? styles.active : ''}
                                            onClick={() => handleFilterChange('category', '')}
                                        >
                                            All Categories
                                        </button>
                                    </li>
                                    {categories.map(cat => (
                                        <li key={cat}>
                                            <button
                                                className={filters.category === cat ? styles.active : ''}
                                                onClick={() => handleFilterChange('category', cat)}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.filterSection}>
                                <h3 className={styles.filterTitle}>Brand</h3>
                                <select
                                    className={styles.filterSelect}
                                    value={filters.brand}
                                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                                >
                                    <option value="">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.filterSection}>
                                <h3 className={styles.filterTitle}>Price Range</h3>
                                <div className={styles.priceInputs}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className={styles.priceInput}
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className={styles.priceInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.filterSection}>
                                <h3 className={styles.filterTitle}>Customer Rating</h3>
                                <ul className={styles.filterList}>
                                    {[4, 3, 2, 1].map(rating => (
                                        <li key={rating}>
                                            <button
                                                className={filters.minRating === String(rating) ? styles.active : ''}
                                                onClick={() => handleFilterChange('minRating', String(rating))}
                                            >
                                                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} & Up
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className={styles.clearFilters} onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        </aside>

                        {/* Products */}
                        <div className={styles.productsSection}>
                            {/* Search & Sort Header */}
                            <div className={styles.resultsHeader}>
                                <p className={styles.resultsCount}>
                                    {pagination.total || 0} results
                                    {filters.search && ` for "${filters.search}"`}
                                </p>
                                <div className={styles.sortControls}>
                                    <label>Sort by:</label>
                                    <select
                                        value={`${filters.sortBy}-${filters.sortOrder}`}
                                        onChange={(e) => {
                                            const [sortBy, sortOrder] = e.target.value.split('-');
                                            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                                        }}
                                    >
                                        <option value="created_at-DESC">Newest First</option>
                                        <option value="price-ASC">Price: Low to High</option>
                                        <option value="price-DESC">Price: High to Low</option>
                                        <option value="rating-DESC">Avg. Customer Review</option>
                                        <option value="rating_count-DESC">Most Reviews</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading products...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className={styles.productGrid}>
                                        {products.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className={styles.pagination}>
                                            <button
                                                disabled={pagination.page === 1}
                                                onClick={() => handleFilterChange('page', pagination.page - 1)}
                                            >
                                                ← Previous
                                            </button>
                                            <span>Page {pagination.page} of {pagination.totalPages}</span>
                                            <button
                                                disabled={pagination.page === pagination.totalPages}
                                                onClick={() => handleFilterChange('page', pagination.page + 1)}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.noResults}>
                                    <h3>No products found</h3>
                                    <p>Try adjusting your filters or search query</p>
                                    <button className="btn btn-primary" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
