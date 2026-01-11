/**
 * Product & Inventory Agent
 * Handles product search, availability, pricing, and store stock
 */

const { Op } = require('sequelize');
const { Product } = require('../models');
const ragService = require('../services/rag');

class ProductInventoryAgent {
    constructor() {
        // Store mappings
        this.stores = {
            1: { name: 'VIKAS Mall Store - Mumbai', city: 'Mumbai', column: 'store_1_qty' },
            2: { name: 'VIKAS Premium - Delhi', city: 'Delhi', column: 'store_2_qty' },
            3: { name: 'VIKAS Express - Bangalore', city: 'Bangalore', column: 'store_3_qty' },
            4: { name: 'VIKAS Flagship - Hyderabad', city: 'Hyderabad', column: 'store_4_qty' },
            5: { name: 'VIKAS Store - Chennai', city: 'Chennai', column: 'store_5_qty' },
            6: { name: 'VIKAS Outlet - Pune', city: 'Pune', column: 'store_6_qty' }
        };
    }

    /**
     * Search products with filters
     */
    async searchProducts(query, filters = {}) {
        const { category, brand, minPrice, maxPrice, inStock, limit = 10 } = filters;

        const keywords = query.toLowerCase()
            .replace(/show|me|find|search|looking|for|want|need/gi, '')
            .split(' ')
            .filter(w => w.length > 2);

        const where = { is_active: true };

        if (keywords.length > 0) {
            where[Op.or] = keywords.flatMap(keyword => [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
                { category: { [Op.iLike]: `%${keyword}%` } },
                { brand: { [Op.iLike]: `%${keyword}%` } }
            ]);
        }

        if (category) where.category = category;
        if (brand) where.brand = brand;
        if (minPrice) where.price = { ...where.price, [Op.gte]: minPrice };
        if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };
        if (inStock) where.stock_online = { [Op.gt]: 0 };

        const products = await Product.findAll({
            where,
            limit,
            order: [['rating', 'DESC']],
            attributes: [
                'id', 'title', 'price', 'original_price', 'category', 'brand',
                'rating', 'rating_count', 'images', 'description', 'stock_online',
                'store_1_qty', 'store_2_qty', 'store_3_qty',
                'store_4_qty', 'store_5_qty', 'store_6_qty'
            ]
        });

        return {
            success: true,
            products,
            count: products.length
        };
    }

    /**
     * Get product availability at specific store
     */
    async getStoreAvailability(productId, storeId = null) {
        const product = await Product.findByPk(productId, {
            attributes: [
                'id', 'title', 'price', 'stock_online',
                'store_1_qty', 'store_2_qty', 'store_3_qty',
                'store_4_qty', 'store_5_qty', 'store_6_qty'
            ]
        });

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        if (storeId) {
            const store = this.stores[storeId];
            if (!store) {
                return { success: false, message: 'Store not found' };
            }
            return {
                success: true,
                product: { id: product.id, title: product.title, price: product.price },
                store: store.name,
                stock: product[store.column] || 0
            };
        }

        // Return all store availability
        const availability = Object.entries(this.stores).map(([id, store]) => ({
            storeId: parseInt(id),
            storeName: store.name,
            city: store.city,
            stock: product[store.column] || 0
        }));

        return {
            success: true,
            product: { id: product.id, title: product.title, price: product.price },
            online: product.stock_online,
            stores: availability
        };
    }

    /**
     * Find products available at a specific store
     */
    async findProductsAtStore(storeId, query = '', limit = 10) {
        const store = this.stores[storeId];
        if (!store) {
            return { success: false, message: 'Store not found' };
        }

        const where = {
            is_active: true,
            [store.column]: { [Op.gt]: 0 }
        };

        if (query) {
            const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2);
            if (keywords.length > 0) {
                where[Op.or] = keywords.flatMap(keyword => [
                    { title: { [Op.iLike]: `%${keyword}%` } },
                    { category: { [Op.iLike]: `%${keyword}%` } },
                    { brand: { [Op.iLike]: `%${keyword}%` } }
                ]);
            }
        }

        const products = await Product.findAll({
            where,
            limit,
            order: [[store.column, 'DESC'], ['rating', 'DESC']],
            attributes: ['id', 'title', 'price', 'images', 'rating', store.column]
        });

        return {
            success: true,
            store: store.name,
            products: products.map(p => ({
                id: p.id,
                title: p.title,
                price: p.price,
                image: p.images?.[0],
                rating: p.rating,
                storeStock: p[store.column]
            }))
        };
    }

    /**
     * Check price and promotions
     */
    async checkPrice(productId) {
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'title', 'price', 'original_price', 'discount_percentage']
        });

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        return {
            success: true,
            product: product.title,
            currentPrice: product.price,
            originalPrice: product.original_price,
            discount: product.discount_percentage,
            savings: product.original_price ? product.original_price - product.price : 0
        };
    }

    /**
     * Process product/inventory query
     */
    async process(query, context = {}) {
        // Check if it's a general question about stores (locations)
        if (query.toLowerCase().includes('where') ||
            query.toLowerCase().includes('location') ||
            query.toLowerCase().includes('address') ||
            (query.toLowerCase().includes('store') && !query.toLowerCase().includes('stock') && !query.toLowerCase().includes('available'))) {
            return await ragService.answerStoreQuestion(query);
        }

        // Use RAG service for complex product queries
        return await ragService.query(query);
    }
}

module.exports = new ProductInventoryAgent();
