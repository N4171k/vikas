const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User, Order, Product, Store, Reservation } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, adminOnly);

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalOrders = await Order.count();
        const totalProducts = await Product.count();

        // Calculate total revenue
        const orders = await Order.findAll({
            where: { status: { [Op.not]: 'cancelled' } },
            attributes: ['total']
        });
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Recent orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email']
            }]
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// Users Management
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: { users } });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Orders Management
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: { orders } });
    } catch (error) {
        console.error('Admin orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'phone']
            }]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: { order } });
    } catch (error) {
        console.error('Admin get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order details' });
    }
});

router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        await order.update({ status });
        res.json({ success: true, message: 'Order status updated', data: { order } });
    } catch (error) {
        console.error('Admin update order error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
});


// ==========================================
// STORE MANAGEMENT
// ==========================================

// Get all stores (Admin view)
router.get('/stores', authenticate, adminOnly, async (req, res) => {
    try {
        const stores = await Store.findAll({
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: { stores }
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stores.' });
    }
});

// Create new store
router.post('/stores', authenticate, adminOnly, async (req, res) => {
    try {
        let { store_name, city, pincode, store_address, phone, latitude, longitude } = req.body;

        // Sanitize input
        if (latitude === '') latitude = null;
        if (longitude === '') longitude = null;
        if (phone === '') phone = null;

        const store = await Store.create({
            store_name, city, pincode, store_address, phone, latitude, longitude
        });

        res.status(201).json({
            success: true,
            message: 'Store created successfully.',
            data: { store }
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ success: false, message: 'Failed to create store.' });
    }
});

// Update store
router.put('/stores/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Sanitize input
        if (updates.latitude === '') updates.latitude = null;
        if (updates.longitude === '') updates.longitude = null;
        if (updates.phone === '') updates.phone = null;

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        await store.update(updates);

        res.json({
            success: true,
            message: 'Store updated successfully.',
            data: { store }
        });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ success: false, message: 'Failed to update store.' });
    }
});

// Delete store
router.delete('/stores/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findByPk(id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        // We use soft delete by setting a flag or just deleting if no paranoid is set.
        // For now, let's hard delete or set active=false depending of requirement.
        // Assuming we want to keep it simple:
        await store.destroy();

        res.json({
            success: true,
            message: 'Store deleted successfully.'
        });
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete store.' });
    }
});

module.exports = router;
