/**
 * Flipkart Dataset Ingestion Script
 * Ingests flipkart_fashion_products_dataset.json into VIKAS-dataset table
 */

const fs = require('fs');
const path = require('path');
const { sequelize, Product } = require('../models');

// Path to the dataset
const DATASET_PATH = path.join(__dirname, '../../flipkart_fashion_products_dataset.json');

// Batch size for bulk insert (lower for stability)
const BATCH_SIZE = 100;

// Limit products for initial testing (set to null for all)
const MAX_PRODUCTS = null; // Change to null to import all products

/**
 * Parse price string like "2,999" to float
 */
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.toString().replace(/,/g, '')) || 0;
}

/**
 * Parse discount string like "69% off" to integer
 */
function parseDiscount(discountStr) {
    if (!discountStr) return 0;
    const match = discountStr.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Extract product details array to specifications object
 */
function extractSpecifications(productDetails) {
    if (!Array.isArray(productDetails)) return {};
    const specs = {};
    productDetails.forEach(detail => {
        const key = Object.keys(detail)[0];
        if (key) {
            specs[key] = detail[key];
        }
    });
    return specs;
}

/**
 * Transform Flipkart product to VIKAS-dataset schema
 */
function transformProduct(flipkartProduct, index) {
    const sellingPrice = parsePrice(flipkartProduct.selling_price);
    const actualPrice = parsePrice(flipkartProduct.actual_price);
    const discount = parseDiscount(flipkartProduct.discount);
    const specs = extractSpecifications(flipkartProduct.product_details);

    // Generate random stock (since Flipkart data doesn't have stock numbers)
    const stockOnline = flipkartProduct.out_of_stock ? 0 : Math.floor(Math.random() * 100) + 10;

    // Use pid or _id as the unique product identifier
    const productId = flipkartProduct.pid || flipkartProduct._id || `PROD-${index}`;

    return {
        // Required: product_id (unique identifier from Flipkart)
        product_id: productId,

        // Map pid to sku as well
        sku: productId,

        title: flipkartProduct.title || 'Untitled Product',
        description: flipkartProduct.description || `${flipkartProduct.title} - Quality product from ${flipkartProduct.brand || 'Unknown Brand'}`,

        // Category mapping - use category for main, sub_category for subcategory
        category: flipkartProduct.category || 'Fashion',
        subcategory: flipkartProduct.sub_category || null,

        brand: flipkartProduct.brand || 'Generic',

        // Pricing
        price: sellingPrice,
        original_price: actualPrice > sellingPrice ? actualPrice : null,
        discount_percentage: discount,

        // Images - use the images array
        images: flipkartProduct.images || [],

        // Rating
        rating: parseFloat(flipkartProduct.average_rating) || 0,
        rating_count: Math.floor(Math.random() * 5000) + 100, // Generate random rating count

        // Stock
        stock_online: stockOnline,

        // Variants - extract from specs if available
        variants: specs.Color ? {
            colors: specs.Color.split(',').map(c => c.trim()),
            sizes: ['S', 'M', 'L', 'XL', 'XXL'] // Default sizes for fashion
        } : null,

        // Features - extract key features from specs
        features: Object.entries(specs).slice(0, 5).map(([key, value]) => `${key}: ${value}`),

        // Full specifications
        specifications: specs,

        // Status
        is_active: !flipkartProduct.out_of_stock
    };
}

/**
 * Main ingestion function
 */
async function ingestFlipkartData() {
    console.log('🚀 Starting Flipkart Dataset Ingestion...\n');

    try {
        // Check database connection
        console.log('📡 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully!\n');

        // Sync the Product model (create table if not exists)
        console.log('📊 Syncing database schema...');
        await Product.sync({ alter: true });
        console.log('✅ Schema synced!\n');

        // Read the dataset
        console.log(`📂 Loading dataset from: ${DATASET_PATH}`);
        if (!fs.existsSync(DATASET_PATH)) {
            throw new Error(`Dataset not found at: ${DATASET_PATH}`);
        }

        const rawData = fs.readFileSync(DATASET_PATH, 'utf8');
        const products = JSON.parse(rawData);
        console.log(`✅ Loaded ${products.length.toLocaleString()} products from dataset\n`);

        // Determine how many to process
        const productsToProcess = MAX_PRODUCTS ? products.slice(0, MAX_PRODUCTS) : products;
        console.log(`📦 Will process ${productsToProcess.length.toLocaleString()} products\n`);

        // Clear existing products (optional - comment out to append)
        console.log('🗑️  Clearing existing products...');
        await Product.destroy({ where: {}, truncate: true });
        console.log('✅ Existing products cleared!\n');

        // Process in batches
        let successCount = 0;
        let errorCount = 0;
        const totalBatches = Math.ceil(productsToProcess.length / BATCH_SIZE);

        console.log(`⏳ Starting batch processing (${totalBatches} batches of ${BATCH_SIZE} products)...\n`);

        for (let i = 0; i < productsToProcess.length; i += BATCH_SIZE) {
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const batch = productsToProcess.slice(i, i + BATCH_SIZE);

            try {
                // Transform batch
                const transformedBatch = batch.map((product, idx) => transformProduct(product, i + idx));

                // Bulk insert
                await Product.bulkCreate(transformedBatch, {
                    ignoreDuplicates: true,
                    validate: true
                });

                successCount += batch.length;

                // Progress update every 10 batches
                if (batchNum % 10 === 0 || batchNum === totalBatches) {
                    const progress = ((batchNum / totalBatches) * 100).toFixed(1);
                    console.log(`   Batch ${batchNum}/${totalBatches} (${progress}%) - ${successCount.toLocaleString()} products inserted`);
                }

            } catch (batchError) {
                errorCount += batch.length;
                console.error(`   ❌ Batch ${batchNum} failed:`, batchError.message);

                // Try inserting individually for failed batch
                for (const product of batch) {
                    try {
                        const transformed = transformProduct(product, i);
                        await Product.create(transformed);
                        successCount++;
                        errorCount--; // Correct the count
                    } catch (singleError) {
                        // Skip this product
                    }
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 INGESTION COMPLETE!');
        console.log('='.repeat(50));
        console.log(`✅ Successfully inserted: ${successCount.toLocaleString()} products`);
        console.log(`❌ Failed: ${errorCount.toLocaleString()} products`);

        // Get some stats
        const totalInDB = await Product.count();
        const categories = await Product.findAll({
            attributes: ['category'],
            group: ['category'],
            raw: true
        });

        console.log(`\n📈 Database Stats:`);
        console.log(`   Total products in VIKAS-dataset: ${totalInDB.toLocaleString()}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Sample categories: ${categories.slice(0, 10).map(c => c.category).join(', ')}`);

    } catch (error) {
        console.error('\n❌ INGESTION FAILED!');
        console.error('Error:', error.message);
        if (error.name === 'SequelizeConnectionError') {
            console.error('\n💡 TIP: Make sure your database is accessible. Check:');
            console.error('   - DATABASE_URL in .env is correct');
            console.error('   - Your IP is whitelisted in Aiven');
            console.error('   - Network allows connection to the database host');
        }
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('\n👋 Database connection closed.');
    }
}

// Run the ingestion
ingestFlipkartData();
