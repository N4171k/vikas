const express = require('express');
const { Cart, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', async (req, res) => {
    try {
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'product_id', 'title', 'price', 'original_price',
                    'discount_percentage', 'images', 'stock_online', 'brand']
            }],
            order: [['created_at', 'DESC']]
        });

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;

        const items = cartItems.map(item => {
            const price = parseFloat(item.product.price);
            const originalPrice = parseFloat(item.product.original_price) || price;
            const itemTotal = price * item.quantity;
            const itemDiscount = (originalPrice - price) * item.quantity;

            subtotal += itemTotal;
            totalDiscount += itemDiscount;

            return {
                id: item.id,
                quantity: item.quantity,
                product: item.product,
                itemTotal
            };
        });

        const tax = subtotal * 0.18; // 18% GST
        const shipping = subtotal > 499 ? 0 : 40; // Free shipping over ₹499
        const total = subtotal + tax + shipping;

        res.json({
            success: true,
            data: {
                items,
                summary: {
                    itemCount: items.length,
                    subtotal: subtotal.toFixed(2),
                    discount: totalDiscount.toFixed(2),
                    tax: tax.toFixed(2),
                    shipping: shipping.toFixed(2),
                    total: total.toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart.'
        });
    }
});

// Add item to cart
router.post('/', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }

        // Check if product exists
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

        // Check if item already in cart
        let cartItem = await Cart.findOne({
            where: {
                user_id: req.user.id,
                product_id: productId
            }
        });

        if (cartItem) {
            // Update quantity
            const newQuantity = cartItem.quantity + parseInt(quantity);
            if (product.stock_online < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more items. Insufficient stock.'
                });
            }

            await cartItem.update({ quantity: newQuantity });
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                user_id: req.user.id,
                product_id: productId,
                quantity: parseInt(quantity)
            });
        }

        // Fetch updated cart item with product
        cartItem = await Cart.findByPk(cartItem.id, {
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'product_id', 'title', 'price', 'images']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Item added to cart.',
            data: { cartItem }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart.'
        });
    }
});

// Update cart item quantity
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required.'
            });
        }

        const cartItem = await Cart.findOne({
            where: { id, user_id: req.user.id },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found.'
            });
        }

        // Check stock
        if (cartItem.product.stock_online < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available.'
            });
        }

        await cartItem.update({ quantity: parseInt(quantity) });

        res.json({
            success: true,
            message: 'Cart updated.',
            data: { cartItem }
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart.'
        });
    }
});

// Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found.'
            });
        }

        await cartItem.destroy();

        res.json({
            success: true,
            message: 'Item removed from cart.'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart.'
        });
    }
});

// Clear entire cart
router.delete('/', async (req, res) => {
    try {
        await Cart.destroy({
            where: { user_id: req.user.id }
        });

        res.json({
            success: true,
            message: 'Cart cleared.'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart.'
        });
    }
});

module.exports = router;
