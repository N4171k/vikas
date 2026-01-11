const express = require('express');
const orchestrator = require('../agents/orchestrator');
const ragService = require('../services/rag');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Process AI query
router.post('/query', optionalAuth, async (req, res) => {
    try {
        const { query, productId, productIds } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Query is required.'
            });
        }

        const context = {
            productId,
            productIds,
            userId: req.user?.id
        };

        const result = await orchestrator.process(query, context);

        res.json({
            success: result.success,
            data: {
                response: result.response,
                products: result.products || [],
                intent: result.intent
            }
        });
    } catch (error) {
        console.error('AI query error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process query.'
        });
    }
});

// Get product recommendations
router.get('/recommendations/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await ragService.getRecommendations(productId);

        res.json({
            success: result.success,
            data: {
                products: result.products || [],
                explanation: result.explanation
            }
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations.'
        });
    }
});

// Ask product-specific question
router.post('/product/:productId/ask', async (req, res) => {
    try {
        const { productId } = req.params;
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required.'
            });
        }

        const result = await ragService.answerProductQuestion(productId, question);

        res.json({
            success: result.success,
            data: {
                response: result.response
            }
        });
    } catch (error) {
        console.error('Product question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to answer question.'
        });
    }
});

// Compare products
router.post('/compare', async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least 2 product IDs are required.'
            });
        }

        const result = await ragService.compareProducts(productIds);

        res.json({
            success: result.success,
            data: {
                response: result.response,
                products: result.products
            }
        });
    } catch (error) {
        console.error('Compare error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to compare products.'
        });
    }
});

// Get welcome message
router.get('/welcome', async (req, res) => {
    try {
        const result = await orchestrator.getWelcomeMessage();
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.json({
            success: true,
            data: {
                message: 'Welcome to VIKAS! Browse our amazing products.'
            }
        });
    }
});

module.exports = router;
