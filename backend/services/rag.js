/**
 * RAG (Retrieval-Augmented Generation) Service
 * Retrieves relevant products and uses Groq for intelligent responses
 */

const { Op } = require('sequelize');
const { Product, Store } = require('../models');
const groqService = require('./groq');

class RAGService {
    constructor() {
        this.maxContextProducts = 5;
    }

    // Get all active stores
    async getAllStores() {
        return await Store.findAll({
            where: { is_active: true },
            attributes: ['id', 'store_name', 'city', 'store_address', 'phone', 'pincode']
        });
    }

    // Detect if query is asking about a specific store
    async detectStore(query) {
        const lowerQuery = query.toLowerCase();
        const stores = await this.getAllStores();

        for (const store of stores) {
            // Check store name
            if (lowerQuery.includes(store.store_name.toLowerCase())) {
                return { storeId: store.id, store: { ...store.dataValues, column: `store_${store.id}_qty` } };
            }
            // Check city
            if (lowerQuery.includes(store.city.toLowerCase())) {
                return { storeId: store.id, store: { ...store.dataValues, column: `store_${store.id}_qty` } };
            }
        }
        return null;
    }

    // Answer questions about stores (locations, etc.)
    async answerStoreQuestion(query) {
        try {
            const stores = await this.getAllStores();

            const storeContext = stores.map(s =>
                `- ${s.store_name}: ${s.store_address}, ${s.city} ${s.pincode} (Phone: ${s.phone})`
            ).join('\n');

            const context = `
We have the following physical stores:
${storeContext}
`;
            const result = await groqService.productQuery(query, context);

            return {
                success: result.success,
                response: result.response || result.message
            };
        } catch (error) {
            console.error('Store question error:', error);
            return {
                success: false,
                response: 'I am unable to access store information at the moment.'
            };
        }
    }

    // Search products available at a specific store
    async searchProductsAtStore(query, storeColumn, limit = 10) {
        const keywords = query.toLowerCase()
            .replace(/at|in|store|vikas|available|what|show|find|me/gi, '')
            .split(' ')
            .filter(w => w.length > 2);

        const whereCondition = {
            is_active: true,
            [storeColumn]: { [Op.gt]: 0 }
        };

        if (keywords.length > 0) {
            whereCondition[Op.or] = keywords.map(keyword => ({
                [Op.or]: [
                    { title: { [Op.iLike]: `%${keyword}%` } },
                    { description: { [Op.iLike]: `%${keyword}%` } },
                    { category: { [Op.iLike]: `%${keyword}%` } },
                    { brand: { [Op.iLike]: `%${keyword}%` } }
                ]
            }));
        }

        return await Product.findAll({
            where: whereCondition,
            limit,
            order: [[storeColumn, 'DESC'], ['rating', 'DESC']],
            attributes: [
                'id', 'title', 'price', 'category', 'brand',
                'rating', 'rating_count', 'images', 'description',
                'store_1_qty', 'store_2_qty', 'store_3_qty',
                'store_4_qty', 'store_5_qty', 'store_6_qty', 'stock_online'
            ]
        });
    }

    // Search products based on query keywords
    async searchProducts(query, limit = 5) {
        const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2);

        if (keywords.length === 0) {
            return await Product.findAll({
                where: { is_active: true },
                limit,
                order: [['rating', 'DESC']]
            });
        }

        // Build search conditions
        const searchConditions = keywords.map(keyword => ({
            [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
                { category: { [Op.iLike]: `%${keyword}%` } },
                { brand: { [Op.iLike]: `%${keyword}%` } }
            ]
        }));

        return await Product.findAll({
            where: {
                is_active: true,
                [Op.or]: searchConditions
            },
            limit,
            order: [['rating', 'DESC']]
        });
    }

    // Build context string from products (with optional store info)
    buildProductContext(products, storeInfo = null) {
        if (!products || products.length === 0) {
            return 'No products found matching your query.';
        }

        const storeHeader = storeInfo
            ? `\n🏪 Store: ${storeInfo.name} (${storeInfo.city})\n`
            : '';

        return storeHeader + products.map((p, i) => {
            let stockInfo = `Online: ${p.stock_online > 0 ? p.stock_online + ' available' : 'Out of stock'}`;

            if (storeInfo) {
                const storeQty = p[storeInfo.column] || 0;
                stockInfo = `At ${storeInfo.name}: ${storeQty} units available`;
            }

            return `
Product ${i + 1}:
- Name: ${p.title}
- Price: ₹${p.price}${p.original_price ? ` (Was ₹${p.original_price})` : ''}
- Category: ${p.category}
- Brand: ${p.brand || 'N/A'}
- Rating: ${p.rating}/5 (${p.rating_count} reviews)
- Stock: ${stockInfo}
- Description: ${(p.description || '').substring(0, 150)}...
`;
        }).join('\n---\n');
    }

    // Main RAG query function
    async query(userQuery) {
        try {
            // Step 0: Detect if asking about a specific store
            const storeMatch = await this.detectStore(userQuery);

            let products;
            let context;

            if (storeMatch) {
                // Store-specific query
                products = await this.searchProductsAtStore(
                    userQuery,
                    storeMatch.store.column,
                    this.maxContextProducts
                );
                context = this.buildProductContext(products, storeMatch.store);
            } else {
                // Regular query
                products = await this.searchProducts(userQuery, this.maxContextProducts);
                context = this.buildProductContext(products);
            }

            // Step 3: Get AI response
            const result = await groqService.productQuery(userQuery, context);

            return {
                success: result.success,
                response: result.response || result.message,
                products: products.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    images: p.images,
                    rating: p.rating,
                    storeStock: storeMatch ? p[storeMatch.store.column] : null
                })),
                store: storeMatch ? storeMatch.store.name : null
            };
        } catch (error) {
            console.error('RAG query error:', error);
            return {
                success: false,
                response: 'Sorry, I encountered an error processing your request.',
                products: []
            };
        }
    }

    // Product comparison
    async compareProducts(productIds) {
        try {
            const products = await Product.findAll({
                where: { id: productIds, is_active: true }
            });

            if (products.length < 2) {
                return {
                    success: false,
                    response: 'Please provide at least 2 products to compare.',
                    products: []
                };
            }

            const context = this.buildProductContext(products);
            const query = 'Compare these products and help me decide which one to buy. Consider price, features, and value for money.';

            const result = await groqService.productQuery(query, context);

            return {
                success: result.success,
                response: result.response || result.message,
                products
            };
        } catch (error) {
            console.error('Compare products error:', error);
            return {
                success: false,
                response: 'Unable to compare products right now.',
                products: []
            };
        }
    }

    // Get product recommendations
    async getRecommendations(productId) {
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                return { success: false, products: [] };
            }

            // Find similar products by category and price range
            const priceMin = parseFloat(product.price) * 0.5;
            const priceMax = parseFloat(product.price) * 1.5;

            const similar = await Product.findAll({
                where: {
                    id: { [Op.ne]: productId },
                    category: product.category,
                    is_active: true,
                    price: { [Op.between]: [priceMin, priceMax] }
                },
                limit: 6,
                order: [['rating', 'DESC']]
            });

            // Get AI explanation if available
            let explanation = null;
            if (similar.length > 0) {
                explanation = await groqService.explainRecommendation(product, similar.slice(0, 3));
            }

            return {
                success: true,
                products: similar,
                explanation
            };
        } catch (error) {
            console.error('Get recommendations error:', error);
            return { success: false, products: [] };
        }
    }

    // Answer product-specific questions
    async answerProductQuestion(productId, question) {
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                return {
                    success: false,
                    response: 'Product not found.'
                };
            }

            const context = `
Product Details:
- Name: ${product.title}
- Price: ₹${product.price}
- Category: ${product.category}
- Brand: ${product.brand || 'N/A'}
- Rating: ${product.rating}/5 (${product.rating_count} reviews)
- Stock: ${product.stock_online > 0 ? 'In Stock' : 'Out of Stock'}
- Description: ${product.description || 'No description available.'}
- Features: ${JSON.stringify(product.features || [])}
- Specifications: ${JSON.stringify(product.specifications || {})}
`;

            const result = await groqService.productQuery(question, context);

            return {
                success: result.success,
                response: result.response || result.message
            };
        } catch (error) {
            console.error('Answer product question error:', error);
            return {
                success: false,
                response: 'Unable to answer your question right now.'
            };
        }
    }
}

module.exports = new RAGService();
