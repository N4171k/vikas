'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await api.getProducts({ limit: 100 }); // Get first 100 for now
            if (response.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await api.deleteProduct(id);
            if (response.success) {
                setProducts(products.filter(p => p.id !== id));
                alert('Product deleted!');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setFormData(product);
        setIsEditing(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreate = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            category: '',
            brand: '',
            stock_online: 0,
            images: [],
            features: [],
            rating: 0,
            rating_count: 0
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (formData.id) {
                response = await api.updateProduct(formData.id, formData);
            } else {
                response = await api.createProduct({ ...formData, product_id: `prod-${Date.now()}` });
            }

            if (response.success) {
                alert(formData.id ? 'Product updated!' : 'Product created!');
                setIsEditing(false);
                fetchProducts();
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save product');
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Product Management</h2>
                {!isEditing && (
                    <button
                        onClick={handleCreate}
                        style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                        + Add New Product
                    </button>
                )}
            </div>

            {/* Edit/Create Form */}
            {isEditing && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{formData.id ? 'Edit Product' : 'Create Product'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Title</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Stock</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    value={formData.stock_online}
                                    onChange={e => setFormData({ ...formData, stock_online: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                                <input
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Brand</label>
                                <input
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{ padding: '0.5rem 1rem', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Product</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Category</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Price</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Stock</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <span>{product.title}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{product.category}</td>
                                        <td style={{ padding: '1rem' }}>₹{parseFloat(product.price).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ color: product.stock_online > 0 ? '#166534' : '#991b1b', fontWeight: '500' }}>
                                                {product.stock_online}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
