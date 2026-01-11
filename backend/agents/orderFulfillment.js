/**
 * Order & Fulfillment Agent
 * Handles order lifecycle, tracking, returns, and checkout assistance
 */

const { Order, OrderItem, Product, Cart } = require('../models');
const { Op } = require('sequelize');

class OrderFulfillmentAgent {
    constructor() {
        this.orderStatuses = {
            PENDING: 'pending',
            CONFIRMED: 'confirmed',
            PROCESSING: 'processing',
            SHIPPED: 'shipped',
            OUT_FOR_DELIVERY: 'out_for_delivery',
            DELIVERED: 'delivered',
            CANCELLED: 'cancelled',
            RETURNED: 'returned'
        };

        this.statusMessages = {
            pending: 'Your order is being verified',
            confirmed: 'Order confirmed! Preparing for shipment',
            processing: 'Your order is being packed',
            shipped: 'Your order is on the way!',
            out_for_delivery: 'Out for delivery today',
            delivered: 'Order delivered successfully',
            cancelled: 'Order has been cancelled',
            returned: 'Return processed'
        };
    }

    /**
     * Get order status and details
     */
    async getOrderStatus(orderId, userId) {
        const order = await Order.findOne({
            where: { id: orderId, user_id: userId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }]
        });

        if (!order) {
            return {
                success: false,
                message: 'Order not found or access denied'
            };
        }

        return {
            success: true,
            order: {
                id: order.id,
                status: order.status,
                statusMessage: this.statusMessages[order.status] || order.status,
                total: order.total_amount,
                createdAt: order.created_at,
                items: order.items?.map(item => ({
                    productId: item.product_id,
                    title: item.product?.title || item.product_title,
                    quantity: item.quantity,
                    price: item.price
                })) || [],
                shipping: {
                    address: order.shipping_address,
                    estimatedDelivery: this.getEstimatedDelivery(order)
                }
            }
        };
    }

    /**
     * Get all orders for a user
     */
    async getUserOrders(userId, options = {}) {
        const { status, limit = 10, page = 1 } = options;

        const where = { user_id: userId };
        if (status) where.status = status;

        const orders = await Order.findAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
            include: [{
                model: OrderItem,
                as: 'items',
                limit: 3
            }]
        });

        return {
            success: true,
            orders: orders.map(order => ({
                id: order.id,
                status: order.status,
                statusMessage: this.statusMessages[order.status],
                total: order.total_amount,
                itemCount: order.items?.length || 0,
                createdAt: order.created_at
            }))
        };
    }

    /**
     * Calculate estimated delivery
     */
    getEstimatedDelivery(order) {
        const createdAt = new Date(order.created_at);

        switch (order.status) {
            case 'delivered':
                return 'Delivered';
            case 'out_for_delivery':
                return 'Today';
            case 'shipped':
                const shipDate = new Date(createdAt);
                shipDate.setDate(shipDate.getDate() + 2);
                return shipDate.toLocaleDateString();
            default:
                const estDate = new Date(createdAt);
                estDate.setDate(estDate.getDate() + 5);
                return estDate.toLocaleDateString();
        }
    }

    /**
     * Track order - friendly response for AI
     */
    async trackOrder(query, userId) {
        // Try to extract order ID from query
        const orderIdMatch = query.match(/order\s*#?\s*(\d+|[a-f0-9-]+)/i);

        if (orderIdMatch) {
            return await this.getOrderStatus(orderIdMatch[1], userId);
        }

        // Get recent orders
        const recentOrders = await this.getUserOrders(userId, { limit: 3 });

        if (recentOrders.orders.length === 0) {
            return {
                success: true,
                response: "You don't have any orders yet. Start shopping to place your first order!",
                orders: []
            };
        }

        return {
            success: true,
            response: `Here are your recent orders:`,
            orders: recentOrders.orders
        };
    }

    /**
     * Handle return request
     */
    async initiateReturn(orderId, userId, reason) {
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId,
                status: 'delivered'
            }
        });

        if (!order) {
            return {
                success: false,
                message: 'Order not found or not eligible for return'
            };
        }

        // Check return window (15 days)
        const deliveryDate = new Date(order.updated_at);
        const now = new Date();
        const daysSinceDelivery = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));

        if (daysSinceDelivery > 15) {
            return {
                success: false,
                message: 'Return window has expired (15 days from delivery)'
            };
        }

        // Create return request
        return {
            success: true,
            returnId: `RET-${Date.now()}`,
            message: 'Return request initiated. Our team will contact you within 24 hours.',
            pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };
    }

    /**
     * Checkout assistance
     */
    async assistCheckout(userId) {
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [{ model: Product, as: 'product' }]
        });

        if (cartItems.length === 0) {
            return {
                success: true,
                response: 'Your cart is empty. Add some products to proceed with checkout.',
                canCheckout: false
            };
        }

        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.product?.price || 0) * item.quantity);
        }, 0);

        const outOfStock = cartItems.filter(item =>
            !item.product || item.product.stock_online < item.quantity
        );

        if (outOfStock.length > 0) {
            return {
                success: true,
                response: `Some items in your cart are out of stock. Please update quantities.`,
                canCheckout: false,
                issues: outOfStock.map(item => item.product?.title || 'Unknown product')
            };
        }

        return {
            success: true,
            response: `Ready to checkout! Your total is ₹${total.toLocaleString()}`,
            canCheckout: true,
            summary: {
                itemCount: cartItems.length,
                total,
                items: cartItems.map(item => ({
                    title: item.product?.title,
                    quantity: item.quantity,
                    price: item.product?.price
                }))
            }
        };
    }

    /**
     * Process order/fulfillment query
     */
    async process(query, context = {}) {
        const { userId } = context;
        const lowerQuery = query.toLowerCase();

        if (!userId) {
            return {
                success: true,
                response: 'Please log in to access your orders.'
            };
        }

        // Determine intent
        if (lowerQuery.includes('track') || lowerQuery.includes('where') || lowerQuery.includes('status')) {
            return await this.trackOrder(query, userId);
        }

        if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
            return {
                success: true,
                response: 'To initiate a return, please go to your Orders page and select the order you want to return. Our returns are free within 15 days of delivery.'
            };
        }

        if (lowerQuery.includes('checkout') || lowerQuery.includes('buy')) {
            return await this.assistCheckout(userId);
        }

        // Default: show recent orders
        return await this.trackOrder(query, userId);
    }
}

module.exports = new OrderFulfillmentAgent();
