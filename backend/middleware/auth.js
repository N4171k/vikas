const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');

// Verify JWT token middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if session exists and is active
        const session = await Session.findOne({
            where: {
                user_id: decoded.userId,
                token: token,
                is_active: true
            }
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
            await session.update({ is_active: false });
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }

        // Get user
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;
        req.session = session;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password_hash'] }
        });

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
    });
};

module.exports = { authenticate, optionalAuth, adminOnly };
