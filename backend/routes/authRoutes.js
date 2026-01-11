const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required.'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        // Hash password and create user
        const password_hash = await User.hashPassword(password);
        const user = await User.create({
            email,
            password_hash,
            name
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: user.id,
            token,
            expires_at: expiresAt
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Invalidate old sessions (optional: keep only last 5)
        await Session.update(
            { is_active: false },
            { where: { user_id: user.id, is_active: true } }
        );

        // Create new session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: user.id,
            token,
            expires_at: expiresAt
        });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
    try {
        // Invalidate current session
        await Session.update(
            { is_active: false },
            { where: { token: req.token } }
        );

        res.json({
            success: true,
            message: 'Logout successful.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed.'
        });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    role: req.user.role,
                    created_at: req.user.created_at
                }
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info.'
        });
    }
});

// Refresh token
router.post('/refresh', authenticate, async (req, res) => {
    try {
        // Generate new token
        const token = jwt.sign(
            { userId: req.user.id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Invalidate old session
        await req.session.update({ is_active: false });

        // Create new session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Session.create({
            user_id: req.user.id,
            token,
            expires_at: expiresAt
        });

        res.json({
            success: true,
            message: 'Token refreshed.',
            data: { token }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token.'
        });
    }
});

module.exports = router;
