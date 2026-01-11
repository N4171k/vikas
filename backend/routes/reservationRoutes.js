/**
 * Reservation Routes
 * Handles store reservation creation, payment simulation, and QR code generation
 */

const express = require('express');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Reservation, Product, User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Store information
const STORES = {
    1: { name: 'VIKAS Mall Store - Mumbai', city: 'Mumbai', address: 'Phoenix Marketcity, Kurla West', column: 'store_1_qty' },
    2: { name: 'VIKAS Premium - Delhi', city: 'Delhi', address: 'Select Citywalk, Saket', column: 'store_2_qty' },
    3: { name: 'VIKAS Express - Bangalore', city: 'Bangalore', address: 'Orion Mall, Rajajinagar', column: 'store_3_qty' },
    4: { name: 'VIKAS Flagship - Hyderabad', city: 'Hyderabad', address: 'Inorbit Mall, Madhapur', column: 'store_4_qty' },
    5: { name: 'VIKAS Store - Chennai', city: 'Chennai', address: 'VR Chennai, Anna Nagar', column: 'store_5_qty' },
    6: { name: 'VIKAS Outlet - Pune', city: 'Pune', address: 'Phoenix Market City, Viman Nagar', column: 'store_6_qty' }
};

// Generate unique reservation code
function generateReservationCode() {
    const prefix = 'VKS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// Create reservation
router.post('/create', authenticate, async (req, res) => {
    try {
        const { productId, storeId, quantity = 1 } = req.body;
        const userId = req.user.id;

        // Validate store
        const store = STORES[storeId];
        if (!store) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store selected.'
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

        // Check store stock
        const storeStock = product[store.column] || 0;
        if (storeStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${storeStock} units available at ${store.name}.`
            });
        }

        // Generate reservation code
        const reservationCode = generateReservationCode();

        // Set expiry (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Calculate total
        const totalAmount = parseFloat(product.price) * quantity;

        // Create reservation
        const reservation = await Reservation.create({
            reservation_code: reservationCode,
            user_id: userId,
            product_id: productId,
            product_title: product.title,
            product_price: product.price,
            quantity,
            store_id: storeId,
            store_name: store.name,
            status: 'pending',
            total_amount: totalAmount,
            expires_at: expiresAt
        });

        res.json({
            success: true,
            data: {
                reservation: {
                    id: reservation.id,
                    code: reservationCode,
                    product: {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.images?.[0]
                    },
                    store: {
                        id: storeId,
                        name: store.name,
                        address: store.address,
                        city: store.city
                    },
                    quantity,
                    totalAmount,
                    expiresAt,
                    status: 'pending'
                }
            }
        });

    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create reservation.'
        });
    }
});

// Simulate payment and generate QR code
router.post('/:id/pay', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod = 'upi' } = req.body;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({
            where: { id, user_id: userId, status: 'pending' }
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found or already processed.'
            });
        }

        // Check if expired
        if (new Date() > new Date(reservation.expires_at)) {
            await reservation.update({ status: 'expired' });
            return res.status(400).json({
                success: false,
                message: 'Reservation has expired.'
            });
        }

        // Simulate payment (always successful)
        const paymentId = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Generate QR code data (JSON string that kiosk will scan)
        const qrCodeData = JSON.stringify({
            type: 'VIKAS_RESERVATION',
            code: reservation.reservation_code,
            productId: reservation.product_id,
            storeId: reservation.store_id,
            quantity: reservation.quantity,
            amount: reservation.total_amount,
            paymentId: paymentId,
            timestamp: Date.now(),
            expiresAt: reservation.expires_at
        });

        // Update reservation
        await reservation.update({
            status: 'paid',
            payment_method: paymentMethod,
            payment_id: paymentId,
            qr_code_data: qrCodeData
        });

        // Reduce store stock
        const product = await Product.findByPk(reservation.product_id);
        const store = STORES[reservation.store_id];
        if (product && store) {
            const currentStock = product[store.column] || 0;
            await product.update({
                [store.column]: Math.max(0, currentStock - reservation.quantity)
            });
        }

        res.json({
            success: true,
            data: {
                reservation: {
                    id: reservation.id,
                    code: reservation.reservation_code,
                    status: 'paid',
                    paymentId,
                    paymentMethod
                },
                qrCode: {
                    data: qrCodeData,
                    // This data can be used to generate QR code on frontend
                    instructions: [
                        'Show this QR code at the store kiosk',
                        'Scan product tag at kiosk',
                        'Collect your item!',
                        `Valid until: ${new Date(reservation.expires_at).toLocaleString()}`
                    ]
                },
                store: {
                    name: reservation.store_name,
                    address: STORES[reservation.store_id]?.address
                }
            }
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment failed. Please try again.'
        });
    }
});

// Get user's reservations
router.get('/my', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const where = { user_id: userId };
        if (status) where.status = status;

        const reservations = await Reservation.findAll({
            where,
            order: [['created_at', 'DESC']],
            limit: 20
        });

        res.json({
            success: true,
            data: {
                reservations: reservations.map(r => ({
                    id: r.id,
                    code: r.reservation_code,
                    product: {
                        id: r.product_id,
                        title: r.product_title,
                        price: r.product_price
                    },
                    store: {
                        id: r.store_id,
                        name: r.store_name
                    },
                    quantity: r.quantity,
                    totalAmount: r.total_amount,
                    status: r.status,
                    qrCodeData: r.qr_code_data,
                    expiresAt: r.expires_at,
                    createdAt: r.created_at
                }))
            }
        });

    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations.'
        });
    }
});

// Get single reservation
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({
            where: { id, user_id: userId }
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found.'
            });
        }

        res.json({
            success: true,
            data: {
                reservation: {
                    id: reservation.id,
                    code: reservation.reservation_code,
                    product: {
                        id: reservation.product_id,
                        title: reservation.product_title,
                        price: reservation.product_price
                    },
                    store: {
                        id: reservation.store_id,
                        name: reservation.store_name,
                        address: STORES[reservation.store_id]?.address
                    },
                    quantity: reservation.quantity,
                    totalAmount: reservation.total_amount,
                    status: reservation.status,
                    qrCodeData: reservation.qr_code_data,
                    paymentId: reservation.payment_id,
                    expiresAt: reservation.expires_at,
                    createdAt: reservation.created_at
                }
            }
        });

    } catch (error) {
        console.error('Get reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservation.'
        });
    }
});

// Verify reservation (for kiosk scanning)
router.post('/verify', async (req, res) => {
    try {
        const { qrData } = req.body;

        let parsed;
        try {
            parsed = JSON.parse(qrData);
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code data.'
            });
        }

        if (parsed.type !== 'VIKAS_RESERVATION') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservation QR code.'
            });
        }

        const reservation = await Reservation.findOne({
            where: { reservation_code: parsed.code }
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found.'
            });
        }

        if (reservation.status === 'picked_up') {
            return res.status(400).json({
                success: false,
                message: 'Reservation already picked up.'
            });
        }

        if (reservation.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Reservation not paid.'
            });
        }

        if (new Date() > new Date(reservation.expires_at)) {
            return res.status(400).json({
                success: false,
                message: 'Reservation has expired.'
            });
        }

        // Mark as picked up
        await reservation.update({
            status: 'picked_up',
            picked_up_at: new Date()
        });

        res.json({
            success: true,
            message: 'Reservation verified! Item picked up successfully.',
            data: {
                code: reservation.reservation_code,
                product: reservation.product_title,
                quantity: reservation.quantity
            }
        });

    } catch (error) {
        console.error('Verify reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed.'
        });
    }
});

module.exports = router;
