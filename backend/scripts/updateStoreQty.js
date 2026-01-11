// Update existing products with random store quantities
const { Product } = require('../models');
const { sequelize } = require('../config/db');

async function updateStoreQuantities() {
    try {
        console.log('🏪 Updating products with store quantities...');

        // Use raw SQL to update all products with random quantities
        await sequelize.query(`
            UPDATE "VIKAS-dataset" 
            SET 
                store_1_qty = floor(random() * 50),
                store_2_qty = floor(random() * 50),
                store_3_qty = floor(random() * 50),
                store_4_qty = floor(random() * 50),
                store_5_qty = floor(random() * 50),
                store_6_qty = floor(random() * 50)
        `);

        // Verify the update
        const sample = await Product.findOne({
            attributes: ['title', 'store_1_qty', 'store_2_qty', 'store_3_qty', 'store_4_qty', 'store_5_qty', 'store_6_qty']
        });

        console.log('✅ Store quantities updated for all products!');
        console.log('\n📦 Sample product stock:');
        console.log(`   Product: ${sample.title.substring(0, 50)}...`);
        console.log(`   Store 1: ${sample.store_1_qty} units`);
        console.log(`   Store 2: ${sample.store_2_qty} units`);
        console.log(`   Store 3: ${sample.store_3_qty} units`);
        console.log(`   Store 4: ${sample.store_4_qty} units`);
        console.log(`   Store 5: ${sample.store_5_qty} units`);
        console.log(`   Store 6: ${sample.store_6_qty} units`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateStoreQuantities();
