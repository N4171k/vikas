const express = require('express');
const { Order, Cart, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Get user's orders
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = { user_id: req.user.id };
        if (status) {
            where.status = status;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders.'
        });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order.'
        });
    }
});

// Create order from cart
router.post('/', async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'cod' } = req.body;

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address ||
            !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.phone) {
            return res.status(400).json({
                success: false,
                message: 'Complete shipping address is required.'
            });
        }

        // Get cart items
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty.'
            });
        }

        // Validate stock and build order items
        const orderItems = [];
        let subtotal = 0;

        for (const item of cartItems) {
            if (item.product.stock_online < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.title}.`
                });
            }

            const itemTotal = parseFloat(item.product.price) * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: item.product.id,
                productTitle: item.product.title,
                productImage: item.product.images?.[0] || null,
                price: item.product.price,
                quantity: item.quantity,
                total: itemTotal
            });
        }

        const tax = subtotal * 0.18; // 18% GST
        const shipping = subtotal > 499 ? 0 : 40;
        const total = subtotal + tax + shipping;

        // Create order
        const order = await Order.create({
            order_number: Order.generateOrderNumber(),
            user_id: req.user.id,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            status: 'confirmed',
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        // Update product stock
        for (const item of cartItems) {
            await item.product.update({
                stock_online: item.product.stock_online - item.quantity
            });
        }

        // Clear cart
        await Cart.destroy({
            where: { user_id: req.user.id }
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: { order }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order.'
        });
    }
});

// Buy now (direct purchase without cart)
router.post('/buy-now', async (req, res) => {
    try {
        const { productId, quantity = 1, shippingAddress, paymentMethod = 'cod' } = req.body;

        // Validate
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address ||
            !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.phone) {
            return res.status(400).json({
                success: false,
                message: 'Complete shipping address is required.'
            });
        }

        // Get product
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        // Check stock
        if (product.stock_online < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available.'
            });
        }

        // Calculate totals
        const itemTotal = parseFloat(product.price) * quantity;
        const tax = itemTotal * 0.18;
        const shipping = itemTotal > 499 ? 0 : 40;
        const total = itemTotal + tax + shipping;

        const orderItems = [{
            productId: product.id,
            productTitle: product.title,
            productImage: product.images?.[0] || null,
            price: product.price,
            quantity,
            total: itemTotal
        }];

        // Create order
        const order = await Order.create({
            order_number: Order.generateOrderNumber(),
            user_id: req.user.id,
            items: orderItems,
            subtotal: itemTotal,
            tax,
            shipping,
            total,
            status: 'confirmed',
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_status: 'pending'
        });

        // Update stock
        await product.update({
            stock_online: product.stock_online - quantity
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: { order }
        });
    } catch (error) {
        console.error('Buy now error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process order.'
        });
    }
});

// Cancel order
router.post('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage.'
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                await product.update({
                    stock_online: product.stock_online + item.quantity
                });
            }
        }

        await order.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: 'Order cancelled successfully.'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order.'
        });
    }
});

module.exports = router;
