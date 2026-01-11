/**
 * Analytics Engine Agent
 * Tracks interactions, generates insights, and computes KPIs
 */

const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

class AnalyticsEngineAgent {
    constructor() {
        // In-memory analytics storage (in production, use Redis or dedicated analytics DB)
        this.interactions = [];
        this.sentimentHistory = [];
        this.searchQueries = [];
        this.conversationMetrics = {
            total: 0,
            resolved: 0,
            escalated: 0,
            avgDuration: 0
        };

        // KPI thresholds
        this.kpis = {
            containmentRate: 0.85,  // Target: 85% resolved without escalation
            satisfactionTarget: 4.0, // Target: 4.0/5.0 satisfaction
            conversionTarget: 0.03   // Target: 3% conversion rate
        };
    }

    /**
     * Log an interaction
     */
    logInteraction(data) {
        const interaction = {
            id: `INT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: data.userId || 'anonymous',
            query: data.query,
            intent: data.intent,
            agentUsed: data.agentUsed,
            responseTime: data.responseTime || 0,
            sentiment: data.sentiment || null,
            success: data.success !== false,
            products: data.products?.length || 0,
            sessionId: data.sessionId
        };

        this.interactions.push(interaction);

        // Keep only last 10000 interactions in memory
        if (this.interactions.length > 10000) {
            this.interactions = this.interactions.slice(-10000);
        }

        // Update metrics
        this.updateMetrics(interaction);

        return interaction.id;
    }

    /**
     * Update real-time metrics
     */
    updateMetrics(interaction) {
        this.conversationMetrics.total++;

        if (interaction.sentiment) {
            this.sentimentHistory.push({
                score: interaction.sentiment.score,
                timestamp: interaction.timestamp
            });

            // Keep last 1000 sentiment scores
            if (this.sentimentHistory.length > 1000) {
                this.sentimentHistory = this.sentimentHistory.slice(-1000);
            }
        }

        if (interaction.query) {
            this.searchQueries.push({
                query: interaction.query,
                intent: interaction.intent,
                timestamp: interaction.timestamp
            });

            if (this.searchQueries.length > 1000) {
                this.searchQueries = this.searchQueries.slice(-1000);
            }
        }
    }

    /**
     * Get containment rate (resolved without escalation)
     */
    getContainmentRate() {
        const recent = this.interactions.slice(-100);
        if (recent.length === 0) return 1.0;

        const escalated = recent.filter(i => i.agentUsed === 'escalation').length;
        return 1 - (escalated / recent.length);
    }

    /**
     * Get average sentiment score
     */
    getAverageSentiment() {
        if (this.sentimentHistory.length === 0) return 0;

        const sum = this.sentimentHistory.reduce((acc, s) => acc + s.score, 0);
        return sum / this.sentimentHistory.length;
    }

    /**
     * Get popular search queries
     */
    getPopularQueries(limit = 10) {
        const queryCounts = {};

        for (const entry of this.searchQueries) {
            const normalized = entry.query.toLowerCase().trim();
            queryCounts[normalized] = (queryCounts[normalized] || 0) + 1;
        }

        return Object.entries(queryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }

    /**
     * Get intent distribution
     */
    getIntentDistribution() {
        const intentCounts = {};

        for (const interaction of this.interactions.slice(-500)) {
            if (interaction.intent) {
                intentCounts[interaction.intent] = (intentCounts[interaction.intent] || 0) + 1;
            }
        }

        const total = Object.values(intentCounts).reduce((a, b) => a + b, 0);

        return Object.entries(intentCounts).map(([intent, count]) => ({
            intent,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
        }));
    }

    /**
     * Get agent usage statistics
     */
    getAgentUsage() {
        const agentCounts = {};

        for (const interaction of this.interactions.slice(-500)) {
            if (interaction.agentUsed) {
                agentCounts[interaction.agentUsed] = (agentCounts[interaction.agentUsed] || 0) + 1;
            }
        }

        return agentCounts;
    }

    /**
     * Generate insights from analytics data
     */
    generateInsights() {
        const insights = [];

        // Sentiment insight
        const avgSentiment = this.getAverageSentiment();
        if (avgSentiment < -0.2) {
            insights.push({
                type: 'warning',
                category: 'sentiment',
                message: 'Customer sentiment is trending negative. Consider reviewing recent interactions.',
                value: avgSentiment.toFixed(2)
            });
        } else if (avgSentiment > 0.3) {
            insights.push({
                type: 'positive',
                category: 'sentiment',
                message: 'Customer sentiment is positive! Keep up the good work.',
                value: avgSentiment.toFixed(2)
            });
        }

        // Containment rate insight
        const containment = this.getContainmentRate();
        if (containment < this.kpis.containmentRate) {
            insights.push({
                type: 'warning',
                category: 'containment',
                message: `Containment rate (${(containment * 100).toFixed(1)}%) is below target (${this.kpis.containmentRate * 100}%).`,
                value: containment
            });
        }

        // Popular queries insight
        const popularQueries = this.getPopularQueries(3);
        if (popularQueries.length > 0) {
            insights.push({
                type: 'info',
                category: 'trending',
                message: `Top searches: ${popularQueries.map(q => q.query).join(', ')}`,
                data: popularQueries
            });
        }

        return insights;
    }

    /**
     * Get dashboard metrics
     */
    getDashboardMetrics() {
        return {
            totalInteractions: this.conversationMetrics.total,
            containmentRate: this.getContainmentRate(),
            averageSentiment: this.getAverageSentiment(),
            intentDistribution: this.getIntentDistribution(),
            agentUsage: this.getAgentUsage(),
            popularQueries: this.getPopularQueries(5),
            insights: this.generateInsights(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Export analytics data
     */
    exportData(options = {}) {
        const { startDate, endDate, format = 'json' } = options;

        let data = this.interactions;

        if (startDate) {
            data = data.filter(i => new Date(i.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            data = data.filter(i => new Date(i.timestamp) <= new Date(endDate));
        }

        if (format === 'summary') {
            return {
                total: data.length,
                dateRange: {
                    start: data[0]?.timestamp,
                    end: data[data.length - 1]?.timestamp
                },
                metrics: this.getDashboardMetrics()
            };
        }

        return data;
    }

    /**
     * Process analytics query
     */
    async process(query, context = {}) {
        const lowerQuery = query.toLowerCase();

        // Log this interaction
        this.logInteraction({
            ...context,
            query,
            agentUsed: 'analytics'
        });

        if (lowerQuery.includes('metrics') || lowerQuery.includes('dashboard') || lowerQuery.includes('stats')) {
            const metrics = this.getDashboardMetrics();
            return {
                success: true,
                response: `Here are the current analytics: ${metrics.totalInteractions} total interactions, ${(metrics.containmentRate * 100).toFixed(1)}% containment rate.`,
                metrics
            };
        }

        if (lowerQuery.includes('insight') || lowerQuery.includes('trend')) {
            const insights = this.generateInsights();
            return {
                success: true,
                response: insights.length > 0
                    ? `Key insights: ${insights.map(i => i.message).join(' ')}`
                    : 'No significant insights at this time.',
                insights
            };
        }

        // Default: return summary
        return {
            success: true,
            response: 'Analytics are being collected. Ask about "metrics", "insights", or "trends" for more details.',
            summary: {
                interactions: this.conversationMetrics.total,
                sentiment: this.getAverageSentiment().toFixed(2)
            }
        };
    }
}

module.exports = new AnalyticsEngineAgent();
