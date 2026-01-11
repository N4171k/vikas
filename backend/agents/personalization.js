/**
 * Personalization & Style Agent
 * Handles recommendations, user preferences, and personalized experiences
 */

const { Op } = require('sequelize');
const { Product, Order, Cart } = require('../models');
const groqService = require('../services/groq');

class PersonalizationAgent {
    constructor() {
        this.preferenceWeights = {
            purchase: 1.0,      // Highest weight for purchased items
            cart: 0.7,         // Items in cart
            viewed: 0.3,       // Viewed items
            category: 0.5,     // Category affinity
            priceRange: 0.4    // Price preference
        };
    }

    /**
     * Build user preference profile from history
     */
    async buildUserProfile(userId) {
        if (!userId) {
            return { preferences: {}, hasHistory: false };
        }

        try {
            // Get purchase history
            const orders = await Order.findAll({
                where: { user_id: userId },
                include: ['items'],
                limit: 20,
                order: [['created_at', 'DESC']]
            });

            // Get cart items
            const cartItems = await Cart.findAll({
                where: { user_id: userId },
                include: [{ model: Product, as: 'product' }]
            });

            // Analyze preferences
            const categories = {};
            const brands = {};
            const pricePoints = [];

            // Analyze orders
            for (const order of orders) {
                for (const item of order.items || []) {
                    if (item.category) {
                        categories[item.category] = (categories[item.category] || 0) + this.preferenceWeights.purchase;
                    }
                    if (item.brand) {
                        brands[item.brand] = (brands[item.brand] || 0) + this.preferenceWeights.purchase;
                    }
                    if (item.price) {
                        pricePoints.push(parseFloat(item.price));
                    }
                }
            }

            // Analyze cart
            for (const cartItem of cartItems) {
                const product = cartItem.product;
                if (product) {
                    if (product.category) {
                        categories[product.category] = (categories[product.category] || 0) + this.preferenceWeights.cart;
                    }
                    if (product.brand) {
                        brands[product.brand] = (brands[product.brand] || 0) + this.preferenceWeights.cart;
                    }
                    if (product.price) {
                        pricePoints.push(parseFloat(product.price));
                    }
                }
            }

            // Calculate average price preference
            const avgPrice = pricePoints.length > 0
                ? pricePoints.reduce((a, b) => a + b, 0) / pricePoints.length
                : null;

            // Sort preferences
            const topCategories = Object.entries(categories)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, score]) => ({ name, score }));

            const topBrands = Object.entries(brands)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, score]) => ({ name, score }));

            return {
                hasHistory: orders.length > 0 || cartItems.length > 0,
                preferences: {
                    categories: topCategories,
                    brands: topBrands,
                    avgPrice,
                    priceRange: avgPrice ? {
                        min: avgPrice * 0.5,
                        max: avgPrice * 1.5
                    } : null
                },
                stats: {
                    totalOrders: orders.length,
                    cartItems: cartItems.length
                }
            };
        } catch (error) {
            console.error('Build user profile error:', error);
            return { preferences: {}, hasHistory: false };
        }
    }

    /**
     * Get personalized product recommendations
     */
    async getRecommendations(userId, options = {}) {
        const { limit = 10, excludeIds = [] } = options;

        const profile = await this.buildUserProfile(userId);

        // Build query based on preferences
        const where = {
            is_active: true,
            stock_online: { [Op.gt]: 0 }
        };

        if (excludeIds.length > 0) {
            where.id = { [Op.notIn]: excludeIds };
        }

        // Prioritize by user preferences
        let orderBy = [['rating', 'DESC']];

        if (profile.hasHistory && profile.preferences.categories?.length > 0) {
            // Search in preferred categories
            const topCategory = profile.preferences.categories[0].name;
            where.category = topCategory;
        }

        if (profile.preferences.priceRange) {
            where.price = {
                [Op.between]: [
                    profile.preferences.priceRange.min,
                    profile.preferences.priceRange.max
                ]
            };
        }

        const products = await Product.findAll({
            where,
            limit,
            order: orderBy,
            attributes: ['id', 'title', 'price', 'images', 'category', 'brand', 'rating']
        });

        return {
            success: true,
            products,
            personalized: profile.hasHistory,
            reason: profile.hasHistory
                ? `Based on your interest in ${profile.preferences.categories?.[0]?.name || 'similar products'}`
                : 'Top rated products for you'
        };
    }

    /**
     * Generate personalized explanation for recommendation
     */
    async explainRecommendation(product, userProfile) {
        if (!groqService.isAvailable) {
            return `Recommended based on your shopping preferences.`;
        }

        const prompt = `Generate a SHORT (1-2 sentences) personalized explanation for why this product is recommended.

Product: ${product.title}
Category: ${product.category}
Price: ₹${product.price}

User preferences: ${JSON.stringify(userProfile.preferences)}

Explanation:`;

        try {
            const response = await groqService.chat([
                { role: 'user', content: prompt }
            ], { maxTokens: 100, temperature: 0.7 });

            return response;
        } catch (error) {
            return `Recommended based on your shopping history.`;
        }
    }

    /**
     * Process personalization query
     */
    async process(query, context = {}) {
        const { userId, productId } = context;

        // Get personalized recommendations
        const recommendations = await this.getRecommendations(userId, {
            excludeIds: productId ? [productId] : []
        });

        return {
            success: true,
            response: recommendations.reason,
            products: recommendations.products,
            personalized: recommendations.personalized
        };
    }
}

module.exports = new PersonalizationAgent();
