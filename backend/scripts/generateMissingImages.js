const { Product, sequelize } = require('../models');
const geminiService = require('../services/gemini');

async function generateMissingImages() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        const products = await Product.findAll();
        let count = 0;

        console.log(`🔍 Checking ${products.length} products for missing images...`);

        for (const product of products) {
            // Check if image is missing or empty array or empty string
            if (!product.images || product.images.length === 0 || (product.images.length === 1 && !product.images[0])) {
                console.log(`Processing: ${product.title}...`);

                try {
                    const generatedImage = await geminiService.generateImage(`Product image for: ${product.title}. ${product.description || ''}. Professional clean background.`);

                    if (generatedImage) {
                        product.images = [generatedImage];
                        await product.save();
                        count++;
                        console.log(`✅ Updated: ${product.title}`);
                    } else {
                        console.log(`⚠️ Skipped (Generation failed): ${product.title}`);
                    }
                } catch (err) {
                    console.error(`❌ Error processing ${product.title}:`, err.message);
                }
            }
        }

        console.log(`\n🎉 Process complete. Generated images for ${count} products.`);

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await sequelize.close();
    }
}

generateMissingImages();
