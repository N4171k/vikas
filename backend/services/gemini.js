const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY;
        this.genAI = null;
        this.model = null;

        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        } else {
            console.warn('⚠️ GOOGLE_API_KEY not found. Gemini Image Generation will be disabled.');
        }
    }

    async generateImage(prompt) {
        if (!this.apiKey) return null;

        try {
            console.log(`🎨 Generating image for: "${prompt}"...`);

            // Try Imagen 3 via REST API (if available on the key)
            // Note: Use 'imagen-3.0-generate-001' or similar model name
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`,
                {
                    instances: [{ prompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1"
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data && response.data.predictions && response.data.predictions.length > 0) {
                const base64Image = response.data.predictions[0].bytesBase64Encoded;
                return this.saveImage(base64Image);
            }

        } catch (error) {
            console.error('❌ Imagen generation failed:', error.response?.data || error.message);

            // Fallback: If Imagen fails (e.g., access denied), we can't easily fallback to text-to-image 
            // without another provider.
            // For now, return null so we don't break the app.
        }

        return null;
    }

    saveImage(base64Data) {
        try {
            // Ensure directory exists
            const uploadDir = path.join(__dirname, '../../frontend/public/uploads/ai');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `gen-${uuidv4()}.png`;
            const filePath = path.join(uploadDir, fileName);

            // Save file
            fs.writeFileSync(filePath, base64Data, 'base64');

            console.log(`✅ Image saved to: ${filePath}`);
            return `/uploads/ai/${fileName}`;
        } catch (error) {
            console.error('Failed to save image:', error);
            return null;
        }
    }
}

module.exports = new GeminiService();
