/**
 * Groq SDK Service
 * Singleton client for Groq LLM with retry logic
 */

const Groq = require('groq-sdk');

class GroqService {
    constructor() {
        this.client = null;
        this.model = 'llama-3.3-70b-versatile';
        this.isAvailable = false;
    }

    initialize() {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your-groq-api-key-here') {
            console.warn('⚠️  GROQ_API_KEY not set. AI features will be disabled.');
            this.isAvailable = false;
            return;
        }

        try {
            this.client = new Groq({ apiKey });
            this.isAvailable = true;
            console.log('✅ Groq AI service initialized.');
        } catch (error) {
            console.error('❌ Failed to initialize Groq:', error.message);
            this.isAvailable = false;
        }
    }

    async chat(messages, options = {}) {
        if (!this.isAvailable) {
            throw new Error('AI service is not available.');
        }

        const maxRetries = options.maxRetries || 3;
        const timeout = options.timeout || 30000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await Promise.race([
                    this.client.chat.completions.create({
                        model: options.model || this.model,
                        messages,
                        temperature: options.temperature || 0.7,
                        max_tokens: options.maxTokens || 1024,
                        top_p: options.topP || 1,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout')), timeout)
                    )
                ]);

                return response.choices[0]?.message?.content || '';
            } catch (error) {
                console.error(`Groq attempt ${attempt} failed:`, error.message);

                if (attempt === maxRetries) {
                    throw error;
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    /**
     * Helper to parse JSON from LLM response
     * Handles markdown code blocks and cleanup
     */
    parseJSON(content) {
        try {
            // Remove markdown code blocks if present
            let cleaned = content;
            if (content.includes('```')) {
                // Determine if it's ```json or just ```
                const matches = content.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (matches && matches[1]) {
                    cleaned = matches[1];
                }
            }

            // Trim whitespace
            cleaned = cleaned.trim();

            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Failed to parse JSON from AI:', error);
            console.error('Original content:', content);
            return {}; // Return empty object on failure to prevent crash
        }
    }


    // Safe system prompt for RAG
    getSystemPrompt() {
        return `You are VIKAS, an AI shopping assistant for an ecommerce platform.

INSTRUCTIONS:
1. ONLY use information from the CONTEXT provided - never make up details
2. If the context includes store information (🏪 Store:), the user is asking about products at that specific store
3. When showing products, list them clearly with name, price, and stock
4. Be helpful, concise, and friendly
5. If no products match, suggest the user try a different search

STORE AVAILABILITY QUERIES:
- When context shows store stock info, USE IT to answer
- List the products available at that store with their quantities
- Example: "At the Bandra store, we have: 1. Cotton T-Shirt (15 units) - ₹599"

FORMAT:
- Keep responses short (2-4 sentences + product list)
- Use bullet points for product lists
- Include price and stock for each product`;
    }

    async productQuery(query, productContext) {
        if (!this.isAvailable) {
            return {
                success: false,
                message: 'AI service is currently unavailable. Please try browsing our products directly.'
            };
        }

        const messages = [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: `CONTEXT:\n${productContext}\n\nUSER QUERY: ${query}` }
        ];

        try {
            const response = await this.chat(messages, {
                temperature: 0.7,
                maxTokens: 512
            });

            return {
                success: true,
                response
            };
        } catch (error) {
            console.error('Product query error:', error);
            return {
                success: false,
                message: 'Unable to process your request right now.'
            };
        }
    }

    // Generate product recommendations explanation
    async explainRecommendation(product, similarProducts) {
        if (!this.isAvailable) {
            return null;
        }

        const context = `
Main Product: ${product.title} - ₹${product.price}
Category: ${product.category}
Rating: ${product.rating}/5 (${product.rating_count} reviews)

Similar Products:
${similarProducts.map((p, i) => `${i + 1}. ${p.title} - ₹${p.price} (${p.rating}/5)`).join('\n')}
`;

        const messages = [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: `CONTEXT:\n${context}\n\nExplain briefly why these products are recommended together. Keep it to 2-3 sentences.` }
        ];

        try {
            return await this.chat(messages, {
                temperature: 0.8,
                maxTokens: 150
            });
        } catch {
            return null;
        }
    }
}

// Singleton instance
const groqService = new GroqService();

module.exports = groqService;
