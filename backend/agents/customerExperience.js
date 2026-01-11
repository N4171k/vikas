/**
 * Customer Experience Agent
 * Handles sentiment analysis, escalation, and conversation quality
 */

const groqService = require('../services/groq');

class CustomerExperienceAgent {
    constructor() {
        this.sentimentThresholds = {
            escalate: -0.5,  // Very negative sentiment triggers escalation
            warning: -0.2,   // Mildly negative needs attention
            positive: 0.3    // Happy customer
        };

        this.escalationKeywords = [
            'speak to human', 'talk to agent', 'real person', 'manager',
            'complaint', 'terrible', 'worst', 'sue', 'lawyer', 'refund now'
        ];
    }

    /**
     * Analyze sentiment of user message
     */
    async analyzeSentiment(message) {
        // Quick keyword check first
        const lowerMessage = message.toLowerCase();

        // Check for explicit escalation requests
        for (const keyword of this.escalationKeywords) {
            if (lowerMessage.includes(keyword)) {
                return {
                    score: -0.8,
                    label: 'negative',
                    needsEscalation: true,
                    reason: 'Explicit escalation request detected'
                };
            }
        }

        // Use LLM for nuanced sentiment analysis
        if (groqService.isAvailable) {
            try {
                const prompt = `Analyze the sentiment of this customer message. Return ONLY a JSON object with: score (-1 to 1), label (positive/neutral/negative), and reason (brief explanation).

Customer message: "${message}"

JSON response:`;

                const response = await groqService.chat([
                    { role: 'user', content: prompt }
                ], { maxTokens: 150, temperature: 0.3 });

                const parsed = groqService.parseJSON(response);
                return {
                    score: parsed.score || 0,
                    label: parsed.label || 'neutral',
                    needsEscalation: parsed.score < this.sentimentThresholds.escalate,
                    reason: parsed.reason || ''
                };
            } catch (error) {
                console.error('Sentiment analysis error:', error);
            }
        }

        // Fallback: simple keyword-based analysis
        return this.simpleSentimentAnalysis(message);
    }

    /**
     * Simple keyword-based sentiment fallback
     */
    simpleSentimentAnalysis(message) {
        const positiveWords = ['thanks', 'great', 'awesome', 'love', 'perfect', 'excellent', 'happy', 'satisfied'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'angry', 'worst', 'broken'];

        const lowerMessage = message.toLowerCase();
        let score = 0;

        for (const word of positiveWords) {
            if (lowerMessage.includes(word)) score += 0.2;
        }
        for (const word of negativeWords) {
            if (lowerMessage.includes(word)) score -= 0.3;
        }

        score = Math.max(-1, Math.min(1, score));

        return {
            score,
            label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
            needsEscalation: score < this.sentimentThresholds.escalate,
            reason: 'Keyword-based analysis'
        };
    }

    /**
     * Generate appropriate greeting based on context
     */
    async generateGreeting(context = {}) {
        const { userName, timeOfDay, returningUser } = context;

        let greeting = 'Hello';

        if (timeOfDay) {
            const hour = new Date().getHours();
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 17) greeting = 'Good afternoon';
            else greeting = 'Good evening';
        }

        if (userName) {
            greeting += `, ${userName}`;
        }

        if (returningUser) {
            greeting += '! Welcome back to VIKAS.';
        } else {
            greeting += '! Welcome to VIKAS.';
        }

        return {
            greeting,
            suggestions: [
                'Browse our latest products',
                'Check your orders',
                'Get personalized recommendations'
            ]
        };
    }

    /**
     * Handle escalation to human support
     */
    async handleEscalation(context = {}) {
        const { userId, conversationHistory, sentiment } = context;

        return {
            escalated: true,
            ticketId: `ESC-${Date.now()}`,
            message: "I understand you'd like to speak with a human agent. I've created a support ticket and our team will contact you shortly. In the meantime, is there anything else I can help clarify?",
            priority: sentiment?.score < -0.7 ? 'high' : 'normal',
            context: {
                userId,
                sentiment,
                lastMessages: conversationHistory?.slice(-5) || []
            }
        };
    }

    /**
     * Process customer experience aspects of a query
     */
    async process(query, context = {}) {
        const sentiment = await this.analyzeSentiment(query);

        // Check if escalation needed
        if (sentiment.needsEscalation) {
            const escalation = await this.handleEscalation({
                ...context,
                sentiment
            });
            return {
                success: true,
                sentiment,
                escalation,
                response: escalation.message
            };
        }

        // Determine response tone based on sentiment
        let responseTone = 'friendly';
        if (sentiment.label === 'negative') {
            responseTone = 'empathetic';
        } else if (sentiment.label === 'positive') {
            responseTone = 'enthusiastic';
        }

        return {
            success: true,
            sentiment,
            responseTone,
            escalation: null
        };
    }
}

module.exports = new CustomerExperienceAgent();
