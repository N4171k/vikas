const express = require('express');
const { Op } = require('sequelize');
const { Product, Inventory, Store } = require('../models');
const { optionalAuth, authenticate, adminOnly } = require('../middleware/auth');
const geminiService = require('../services/gemini');

const router = express.Router();

// Get all products with pagination and filters
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = { is_active: true };

        if (category) {
            where.category = category;
        }

        if (brand) {
            where.brand = brand;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        if (minRating) {
            where.rating = { [Op.gte]: parseFloat(minRating) };
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { brand: { [Op.iLike]: `%${search}%` } },
                { category: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Valid sort fields
        const validSortFields = ['price', 'rating', 'rating_count', 'created_at', 'title'];
        const orderField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[orderField, orderDirection]],
            attributes: [
                'id', 'product_id', 'title', 'category', 'price', 'original_price',
                'discount_percentage', 'images', 'rating', 'rating_count', 'brand', 'stock_online'
            ]
        });

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products.'
        });
    }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            where: {
                [Op.or]: [
                    { id },
                    { product_id: id }
                ],
                is_active: true
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        // Auto-generate image if missing
        if (!product.images || product.images.length === 0 || (product.images.length === 1 && !product.images[0])) {
            try {
                const generatedImage = await geminiService.generateImage(`Product image for: ${product.title}. ${product.description || ''}. Professional clean background.`);
                if (generatedImage) {
                    product.images = [generatedImage];
                    await product.save();
                }
            } catch (err) {
                console.error('Auto-generation failed:', err);
                // Continue without image
            }
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product.'
        });
    }
});

// Get product store availability
router.get('/:id/stores', async (req, res) => {
    try {
        const { id } = req.params;

        // Find product with store quantities
        const product = await Product.findOne({
            where: {
                [Op.or]: [
                    { id },
                    { product_id: id }
                ]
            },
            attributes: [
                'id', 'title', 'price',
                'store_1_qty', 'store_2_qty', 'store_3_qty',
                'store_4_qty', 'store_5_qty', 'store_6_qty'
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        // Store information
        const storesDb = await Store.findAll({
            where: { is_active: true },
            order: [['id', 'ASC']]
        });

        // Map to plain objects
        const storeInfo = storesDb.map(s => s.toJSON());

        // Map store quantities to store info
        const stores = storeInfo.map((store, idx) => ({
            ...store,
            stock: product[`store_${idx + 1}_qty`] || 0
        })).filter(store => store.stock > 0); // Only show stores with stock

        res.json({
            success: true,
            data: {
                product: {
                    id: product.id,
                    title: product.title,
                    price: product.price
                },
                stores
            }
        });
    } catch (error) {
        console.error('Get store availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch store availability.'
        });
    }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: ['category'],
            where: { is_active: true },
            group: ['category'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                categories: categories.map(c => c.category).filter(Boolean)
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories.'
        });
    }
});

// Get brands
router.get('/meta/brands', async (req, res) => {
    try {
        const brands = await Product.findAll({
            attributes: ['brand'],
            where: { is_active: true, brand: { [Op.ne]: null } },
            group: ['brand'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                brands: brands.map(b => b.brand).filter(Boolean)
            }
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch brands.'
        });
    }
});

// Search products
router.get('/search/query', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: { products: [] }
            });
        }

        const products = await Product.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { brand: { [Op.iLike]: `%${q}%` } },
                    { category: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: parseInt(limit),
            attributes: ['id', 'product_id', 'title', 'price', 'images', 'category']
        });

        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed.'
        });
    }
});


// ADMIN: Create Product
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const {
            product_id, title, description,
            price, original_price, discount_percentage,
            rating, rating_count, brand,
            category, stock_online,
            images, features, specifications
        } = req.body;

        const product = await Product.create({
            product_id, title, description,
            price, original_price, discount_percentage,
            rating: rating || 0,
            rating_count: rating_count || 0,
            brand, category, stock_online: stock_online || 0,
            images: images || [],
            features: features || [],
            specifications: specifications || {},
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
});

// ADMIN: Update Product
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.update(updates);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// ADMIN: Delete Product (Soft delete)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.update({ is_active: false });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

module.exports = router;

