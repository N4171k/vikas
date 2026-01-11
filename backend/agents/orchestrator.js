/**
 * Orchestrator Agent
 * Central brain that routes user intents to specialized agents
 */

const ragService = require('../services/rag');
const groqService = require('../services/groq');
const customerExperience = require('./customerExperience');
const productInventory = require('./productInventory');
const personalization = require('./personalization');
const orderFulfillment = require('./orderFulfillment');
const immersiveExperience = require('./immersiveExperience');
const analyticsEngine = require('./analyticsEngine');

class OrchestratorAgent {
    constructor() {
        this.intents = {
            SEARCH: 'search',
            RECOMMEND: 'recommend',
            COMPARE: 'compare',
            PRODUCT_INFO: 'product_info',
            AVAILABILITY: 'availability',
            ORDER_STATUS: 'order_status',
            RETURNS: 'returns',
            CHECKOUT: 'checkout',
            AR_VR: 'ar_vr',
            GREETING: 'greeting',
            ESCALATION: 'escalation',
            ANALYTICS: 'analytics',
            GENERAL: 'general'
        };

        // Agent mapping
        this.agentMap = {
            [this.intents.SEARCH]: productInventory,
            [this.intents.AVAILABILITY]: productInventory,
            [this.intents.PRODUCT_INFO]: productInventory,
            [this.intents.RECOMMEND]: personalization,
            [this.intents.ORDER_STATUS]: orderFulfillment,
            [this.intents.RETURNS]: orderFulfillment,
            [this.intents.CHECKOUT]: orderFulfillment,
            [this.intents.AR_VR]: immersiveExperience,
            [this.intents.ESCALATION]: customerExperience,
            [this.intents.ANALYTICS]: analyticsEngine
        };
    }

    /**
     * Classify user intent from query
     */
    async classifyIntent(query) {
        const lowerQuery = query.toLowerCase();

        // Greeting patterns
        if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings)/i.test(lowerQuery)) {
            return this.intents.GREETING;
        }

        // Order/Fulfillment patterns
        if (lowerQuery.includes('track') || lowerQuery.includes('order status') ||
            lowerQuery.includes('where is my order') || lowerQuery.includes('my orders')) {
            return this.intents.ORDER_STATUS;
        }

        if (lowerQuery.includes('return') || lowerQuery.includes('refund') ||
            lowerQuery.includes('exchange')) {
            return this.intents.RETURNS;
        }

        if (lowerQuery.includes('checkout') || lowerQuery.includes('buy now') ||
            lowerQuery.includes('place order')) {
            return this.intents.CHECKOUT;
        }

        // AR/VR patterns
        if (lowerQuery.includes('try on') || lowerQuery.includes('ar') ||
            lowerQuery.includes('virtual') || lowerQuery.includes('3d') ||
            lowerQuery.includes('view in room')) {
            return this.intents.AR_VR;
        }

        // Comparison
        if (lowerQuery.includes('compare') || lowerQuery.includes('vs') ||
            lowerQuery.includes('versus') || lowerQuery.includes('difference')) {
            return this.intents.COMPARE;
        }

        // Recommendations
        if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') ||
            lowerQuery.includes('similar') || lowerQuery.includes('like this')) {
            return this.intents.RECOMMEND;
        }

        // Store availability
        if (lowerQuery.includes('available') || lowerQuery.includes('store') ||
            lowerQuery.includes('near me') || lowerQuery.includes('offline') ||
            lowerQuery.includes('bandra') || lowerQuery.includes('mumbai') ||
            lowerQuery.includes('delhi') || lowerQuery.includes('bangalore')) {
            return this.intents.AVAILABILITY;
        }

        // Analytics (admin queries)
        if (lowerQuery.includes('analytics') || lowerQuery.includes('metrics') ||
            lowerQuery.includes('insights') || lowerQuery.includes('dashboard')) {
            return this.intents.ANALYTICS;
        }

        // Search patterns
        if (lowerQuery.includes('search') || lowerQuery.includes('find') ||
            lowerQuery.includes('looking for') || lowerQuery.includes('show me') ||
            lowerQuery.includes('what') || lowerQuery.includes('which')) {
            return this.intents.SEARCH;
        }

        // Default to general (uses RAG for product queries)
        return this.intents.GENERAL;
    }

    /**
     * Main orchestration function - processes user query through agent pipeline
     */
    async process(query, context = {}) {
        const startTime = Date.now();

        try {
            // Step 1: Analyze sentiment via Customer Experience Agent
            const sentimentResult = await customerExperience.analyzeSentiment(query);

            // Step 2: Check for escalation
            if (sentimentResult.needsEscalation) {
                const escalation = await customerExperience.handleEscalation({
                    ...context,
                    sentiment: sentimentResult
                });

                analyticsEngine.logInteraction({
                    ...context,
                    query,
                    intent: this.intents.ESCALATION,
                    agentUsed: 'customerExperience',
                    sentiment: sentimentResult,
                    responseTime: Date.now() - startTime
                });

                return {
                    success: true,
                    response: escalation.message,
                    intent: this.intents.ESCALATION,
                    sentiment: sentimentResult,
                    escalation
                };
            }

            // Step 3: Classify intent
            const intent = await this.classifyIntent(query);

            // Step 4: Route to appropriate agent
            let response;
            let agentUsed = 'orchestrator';

            switch (intent) {
                case this.intents.GREETING:
                    const greeting = await customerExperience.generateGreeting({
                        userName: context.userName,
                        returningUser: !!context.userId
                    });
                    response = {
                        success: true,
                        response: `${greeting.greeting} How can I help you today?`,
                        suggestions: greeting.suggestions
                    };
                    agentUsed = 'customerExperience';
                    break;

                case this.intents.SEARCH:
                case this.intents.AVAILABILITY:
                case this.intents.PRODUCT_INFO:
                    response = await productInventory.process(query, context);
                    agentUsed = 'productInventory';
                    break;

                case this.intents.RECOMMEND:
                    response = await personalization.process(query, context);
                    agentUsed = 'personalization';
                    break;

                case this.intents.COMPARE:
                    if (context.productIds && context.productIds.length >= 2) {
                        response = await ragService.compareProducts(context.productIds);
                    } else {
                        response = {
                            success: true,
                            response: 'Please select 2 or more products to compare. You can add products to compare from the product pages.'
                        };
                    }
                    agentUsed = 'productInventory';
                    break;

                case this.intents.ORDER_STATUS:
                case this.intents.RETURNS:
                case this.intents.CHECKOUT:
                    response = await orderFulfillment.process(query, context);
                    agentUsed = 'orderFulfillment';
                    break;

                case this.intents.AR_VR:
                    response = await immersiveExperience.process(query, context);
                    agentUsed = 'immersiveExperience';
                    break;

                case this.intents.ANALYTICS:
                    response = await analyticsEngine.process(query, context);
                    agentUsed = 'analyticsEngine';
                    break;

                default:
                    // General query - use RAG service
                    response = await ragService.query(query);
                    agentUsed = 'rag';
            }

            // Step 5: Log interaction to Analytics
            analyticsEngine.logInteraction({
                ...context,
                query,
                intent,
                agentUsed,
                sentiment: sentimentResult,
                responseTime: Date.now() - startTime,
                success: response.success,
                products: response.products
            });

            return {
                ...response,
                intent,
                sentiment: sentimentResult,
                agentUsed
            };

        } catch (error) {
            console.error('Orchestrator error:', error);

            analyticsEngine.logInteraction({
                ...context,
                query,
                intent: this.intents.GENERAL,
                agentUsed: 'error',
                responseTime: Date.now() - startTime,
                success: false
            });

            return {
                success: false,
                response: 'I encountered an error. Please try again or browse our products directly.',
                intent: this.intents.GENERAL
            };
        }
    }

    /**
     * Get greeting/welcome message
     */
    async getWelcomeMessage(context = {}) {
        const greeting = await customerExperience.generateGreeting(context);

        return {
            success: true,
            message: greeting.greeting + " I'm VIKAS AI, your personal shopping assistant. Ask me about products, check store availability, track orders, or get personalized recommendations!",
            suggestions: [
                'Find tshirts available at Mumbai store',
                'Show me trending products',
                'Track my order',
                'Recommend something for me'
            ]
        };
    }

    /**
     * Get analytics dashboard
     */
    getAnalytics() {
        return analyticsEngine.getDashboardMetrics();
    }
}

module.exports = new OrchestratorAgent();

