/**
 * Seed Data Script
 * Populates VIKAS-dataset with sample products
 */

require('dotenv').config();
const { sequelize } = require('../config/db');
const { Product, Inventory, User } = require('../models');

// Sample product data - diverse ecommerce catalog
const sampleProducts = [
    // Electronics
    {
        product_id: 'ELEC-001',
        title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Exceptional sound quality with 30-hour battery life. Ultra-comfortable design with soft-fit leather.',
        category: 'Electronics',
        subcategory: 'Headphones',
        price: 29990.00,
        original_price: 34990.00,
        discount_percentage: 14,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        rating: 4.8,
        rating_count: 2847,
        stock_online: 45,
        brand: 'Sony',
        sku: 'SONY-WH1000XM5-BLK',
        features: ['30-hour battery', 'ANC', 'Quick charge', 'Multipoint connection'],
        specifications: { driver: '40mm', frequency: '4Hz-40kHz', weight: '250g' }
    },
    {
        product_id: 'ELEC-002',
        title: 'Apple MacBook Air M2 (2024) - 15 inch',
        description: 'Supercharged by M2 chip. 15.3-inch Liquid Retina display. Up to 18 hours of battery life. Thin, light design in four stunning colors.',
        category: 'Electronics',
        subcategory: 'Laptops',
        price: 134900.00,
        original_price: 144900.00,
        discount_percentage: 7,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        rating: 4.9,
        rating_count: 1523,
        stock_online: 23,
        brand: 'Apple',
        sku: 'APPLE-MBA-M2-15',
        features: ['M2 chip', '8GB RAM', '256GB SSD', '18hr battery'],
        specifications: { display: '15.3-inch Retina', processor: 'M2', memory: '8GB', storage: '256GB' }
    },
    {
        product_id: 'ELEC-003',
        title: 'Samsung Galaxy S24 Ultra 5G (256GB)',
        description: 'Galaxy AI is here. Circle to Search, Live Translate, and more. 200MP camera. Titanium frame. Built-in S Pen.',
        category: 'Electronics',
        subcategory: 'Smartphones',
        price: 129999.00,
        original_price: 134999.00,
        discount_percentage: 4,
        images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
        rating: 4.7,
        rating_count: 3291,
        stock_online: 67,
        brand: 'Samsung',
        sku: 'SAMSUNG-S24U-256',
        features: ['Galaxy AI', '200MP camera', 'S Pen', '5000mAh battery'],
        specifications: { display: '6.8-inch AMOLED', processor: 'Snapdragon 8 Gen 3', camera: '200MP+12MP+50MP+10MP' }
    },
    // Fashion
    {
        product_id: 'FASH-001',
        title: 'Levi\'s 501 Original Fit Jeans - Dark Stonewash',
        description: 'The original jean since 1873. Straight leg, button fly. 100% cotton for authentic denim feel. A timeless classic.',
        category: 'Fashion',
        subcategory: 'Jeans',
        price: 3999.00,
        original_price: 5999.00,
        discount_percentage: 33,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        rating: 4.5,
        rating_count: 8721,
        stock_online: 234,
        brand: 'Levi\'s',
        sku: 'LEVIS-501-DKSTN',
        features: ['100% cotton', 'Button fly', 'Classic fit'],
        specifications: { material: '100% Cotton Denim', fit: 'Original', rise: 'Regular' },
        variants: [{ size: '30' }, { size: '32' }, { size: '34' }, { size: '36' }]
    },
    {
        product_id: 'FASH-002',
        title: 'Nike Air Max 270 Running Shoes - Black/White',
        description: 'The Nike Air Max 270 delivers visible Air and unbelievable comfort. Features the biggest heel Air unit yet for a super-soft ride.',
        category: 'Fashion',
        subcategory: 'Shoes',
        price: 12995.00,
        original_price: 14995.00,
        discount_percentage: 13,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        rating: 4.6,
        rating_count: 5432,
        stock_online: 89,
        brand: 'Nike',
        sku: 'NIKE-AM270-BKWT',
        features: ['Max Air unit', 'Lightweight mesh', 'Foam midsole'],
        specifications: { type: 'Running', closure: 'Lace-up', sole: 'Rubber' },
        variants: [{ size: 'UK 7' }, { size: 'UK 8' }, { size: 'UK 9' }, { size: 'UK 10' }]
    },
    {
        product_id: 'FASH-003',
        title: 'Ray-Ban Aviator Classic Sunglasses - Gold/Green',
        description: 'Originally designed for U.S. aviators in 1937. Iconic teardrop shape, metal frame. Crystal lenses for clarity.',
        category: 'Fashion',
        subcategory: 'Accessories',
        price: 15990.00,
        original_price: 17990.00,
        discount_percentage: 11,
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
        rating: 4.7,
        rating_count: 2156,
        stock_online: 56,
        brand: 'Ray-Ban',
        sku: 'RAYBAN-AV-GLDGR',
        features: ['Crystal lenses', 'Metal frame', 'UV protection'],
        specifications: { lens: 'Crystal Green', frame: 'Gold Metal', fit: 'Standard' }
    },
    // Home & Kitchen
    {
        product_id: 'HOME-001',
        title: 'Dyson V15 Detect Absolute Cordless Vacuum',
        description: 'Reveals invisible dust. Laser Slim Fluffy cleaner head makes invisible dust visible on hard floors. LCD shows real-time dust count.',
        category: 'Home & Kitchen',
        subcategory: 'Vacuums',
        price: 62900.00,
        original_price: 69900.00,
        discount_percentage: 10,
        images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500'],
        rating: 4.8,
        rating_count: 987,
        stock_online: 18,
        brand: 'Dyson',
        sku: 'DYSON-V15-ABS',
        features: ['Laser dust detection', 'LCD screen', '60min runtime', 'HEPA filtration'],
        specifications: { power: '230W', runtime: '60 minutes', capacity: '0.76L' }
    },
    {
        product_id: 'HOME-002',
        title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6 Qt)',
        description: 'Best-selling multi-cooker. Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.',
        category: 'Home & Kitchen',
        subcategory: 'Kitchen Appliances',
        price: 8999.00,
        original_price: 12999.00,
        discount_percentage: 31,
        images: ['https://images.unsplash.com/photo-1585156902756-4e1a73a7e1e1?w=500'],
        rating: 4.6,
        rating_count: 15234,
        stock_online: 145,
        brand: 'Instant Pot',
        sku: 'INSTPOT-DUO-6QT',
        features: ['7-in-1 functionality', '13 programs', 'Stainless steel', 'Easy to clean'],
        specifications: { capacity: '6 Quart', power: '1000W', programs: '13' }
    },
    {
        product_id: 'HOME-003',
        title: 'Philips Air Fryer XXL Premium - Black',
        description: 'The biggest Philips Airfryer. Fat Removal technology extracts and captures excess fat. Rapid Air for crispy results.',
        category: 'Home & Kitchen',
        subcategory: 'Kitchen Appliances',
        price: 24999.00,
        original_price: 29999.00,
        discount_percentage: 17,
        images: ['https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=500'],
        rating: 4.5,
        rating_count: 3421,
        stock_online: 62,
        brand: 'Philips',
        sku: 'PHILIPS-AF-XXL',
        features: ['XXL capacity', 'Fat removal', 'Digital display', 'Keep warm'],
        specifications: { capacity: '1.4kg', power: '2225W', temperature: '40-200°C' }
    },
    // Beauty & Personal Care
    {
        product_id: 'BEAUTY-001',
        title: 'Dyson Airwrap Multi-Styler Complete',
        description: 'Curl, wave, smooth and dry with no extreme heat. Coanda styling technology. Multiple attachments for versatile styling.',
        category: 'Beauty',
        subcategory: 'Hair Tools',
        price: 45900.00,
        original_price: 49900.00,
        discount_percentage: 8,
        images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'],
        rating: 4.7,
        rating_count: 2134,
        stock_online: 24,
        brand: 'Dyson',
        sku: 'DYSON-AIRWRAP-COMP',
        features: ['Coanda technology', 'No extreme heat', '6 attachments', 'All hair types'],
        specifications: { power: '1300W', heating: 'Intelligent heat control', cord: '2.7m' }
    },
    {
        product_id: 'BEAUTY-002',
        title: 'La Mer Crème de la Mer Moisturizing Cream (60ml)',
        description: 'The iconic Miracle Broth™ skincare. Ultra-rich cream that goes beyond hydration. Transforms skin with each application.',
        category: 'Beauty',
        subcategory: 'Skincare',
        price: 32500.00,
        original_price: 35000.00,
        discount_percentage: 7,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'],
        rating: 4.8,
        rating_count: 876,
        stock_online: 18,
        brand: 'La Mer',
        sku: 'LAMER-CREME-60',
        features: ['Miracle Broth', 'Deep hydration', 'Anti-aging', 'Luxurious texture'],
        specifications: { size: '60ml', type: 'Rich Cream', skinType: 'All' }
    },
    // Sports & Fitness
    {
        product_id: 'SPORT-001',
        title: 'Peloton Bike+ with 24" Rotating HD Touchscreen',
        description: 'Next-level indoor cycling. 24" rotating HD touchscreen. Auto-resistance sync. Apple GymKit compatible.',
        category: 'Sports & Fitness',
        subcategory: 'Exercise Equipment',
        price: 249000.00,
        original_price: 275000.00,
        discount_percentage: 9,
        images: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?w=500'],
        rating: 4.9,
        rating_count: 432,
        stock_online: 8,
        brand: 'Peloton',
        sku: 'PELOTON-BIKEPLUS',
        features: ['24" rotating screen', 'Auto-resistance', 'Live classes', 'Apple GymKit'],
        specifications: { display: '24-inch HD', resistance: '100 levels', dimensions: '59"L x 23"W x 59"H' }
    },
    {
        product_id: 'SPORT-002',
        title: 'Garmin Fenix 7X Solar Multisport GPS Watch',
        description: 'Advanced GPS smartwatch with solar charging. Built for endurance athletes. TopoActive maps. Performance metrics.',
        category: 'Sports & Fitness',
        subcategory: 'Smartwatches',
        price: 78990.00,
        original_price: 89990.00,
        discount_percentage: 12,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
        rating: 4.8,
        rating_count: 1567,
        stock_online: 34,
        brand: 'Garmin',
        sku: 'GARMIN-FENIX7X-SOL',
        features: ['Solar charging', 'Topo maps', 'Multi-sport', '28-day battery'],
        specifications: { display: '1.4" x 1.4"', battery: '28 days', waterRating: '10 ATM' }
    },
    // Books
    {
        product_id: 'BOOK-001',
        title: 'Atomic Habits by James Clear (Hardcover)',
        description: 'Tiny changes, remarkable results. #1 New York Times bestseller. Over 10 million copies sold. Transform your habits, transform your life.',
        category: 'Books',
        subcategory: 'Self-Help',
        price: 599.00,
        original_price: 799.00,
        discount_percentage: 25,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        rating: 4.8,
        rating_count: 45231,
        stock_online: 567,
        brand: 'Penguin Random House',
        sku: 'BOOK-ATOMICHABITS',
        features: ['Hardcover', '320 pages', 'Bestseller'],
        specifications: { pages: '320', language: 'English', isbn: '978-0735211292' }
    },
    {
        product_id: 'BOOK-002',
        title: 'The Psychology of Money by Morgan Housel',
        description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money.',
        category: 'Books',
        subcategory: 'Finance',
        price: 449.00,
        original_price: 599.00,
        discount_percentage: 25,
        images: ['https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500'],
        rating: 4.7,
        rating_count: 28456,
        stock_online: 423,
        brand: 'Jaico Publishing',
        sku: 'BOOK-PSYCHMONEY',
        features: ['Paperback', '252 pages', 'Finance bestseller'],
        specifications: { pages: '252', language: 'English', isbn: '978-9390166268' }
    },
    // Gaming
    {
        product_id: 'GAME-001',
        title: 'Sony PlayStation 5 Digital Edition Console',
        description: 'Experience lightning-fast loading, haptic feedback, adaptive triggers, and 3D Audio. 825GB SSD. Ray tracing support.',
        category: 'Gaming',
        subcategory: 'Consoles',
        price: 44990.00,
        original_price: 49990.00,
        discount_percentage: 10,
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'],
        rating: 4.9,
        rating_count: 8923,
        stock_online: 12,
        brand: 'Sony',
        sku: 'SONY-PS5-DIGITAL',
        features: ['825GB SSD', 'Ray tracing', 'HDR', 'DualSense controller'],
        specifications: { storage: '825GB SSD', resolution: '4K@120Hz', hdmi: 'HDMI 2.1' }
    },
    {
        product_id: 'GAME-002',
        title: 'Logitech G Pro X Superlight Wireless Gaming Mouse',
        description: 'Ultra-lightweight at less than 63 grams. HERO 25K sensor. 70-hour battery life. Designed with pros.',
        category: 'Gaming',
        subcategory: 'Accessories',
        price: 13995.00,
        original_price: 15995.00,
        discount_percentage: 13,
        images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
        rating: 4.8,
        rating_count: 3421,
        stock_online: 78,
        brand: 'Logitech',
        sku: 'LOGI-GPROSUPERLT',
        features: ['63g weight', 'HERO 25K sensor', '70hr battery', 'PTFE feet'],
        specifications: { sensor: 'HERO 25K', dpi: '25,600', battery: '70 hours' }
    }
];

// Sample store data for omnichannel demo
const sampleStores = [
    { store_id: 'STORE-MUM-001', store_name: 'VIKAS Electronics Hub - Andheri', city: 'Mumbai', pincode: '400053', store_address: 'Shop 12, Infinity Mall, Andheri West', phone: '022-26234567', latitude: 19.1197, longitude: 72.8464 },
    { store_id: 'STORE-MUM-002', store_name: 'VIKAS Lifestyle Store - Bandra', city: 'Mumbai', pincode: '400050', store_address: 'Ground Floor, Linking Road, Bandra West', phone: '022-26457890', latitude: 19.0596, longitude: 72.8295 },
    { store_id: 'STORE-DEL-001', store_name: 'VIKAS Mega Store - Connaught Place', city: 'Delhi', pincode: '110001', store_address: 'Block A, Connaught Place', phone: '011-23456789', latitude: 28.6315, longitude: 77.2167 },
    { store_id: 'STORE-DEL-002', store_name: 'VIKAS Express - Saket', city: 'Delhi', pincode: '110017', store_address: 'Select Citywalk Mall, Saket', phone: '011-29876543', latitude: 28.5286, longitude: 77.2189 },
    { store_id: 'STORE-BLR-001', store_name: 'VIKAS Tech World - Koramangala', city: 'Bangalore', pincode: '560034', store_address: '80 Feet Road, Koramangala', phone: '080-41234567', latitude: 12.9352, longitude: 77.6245 },
    { store_id: 'STORE-BLR-002', store_name: 'VIKAS Home & Living - Indiranagar', city: 'Bangalore', pincode: '560038', store_address: '100 Feet Road, Indiranagar', phone: '080-42345678', latitude: 12.9784, longitude: 77.6408 }
];

async function seedData() {
    try {
        console.log('🌱 Starting data seeding...\n');

        // Connect and sync database
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Force sync to recreate tables (WARNING: This drops existing data)
        await sequelize.sync({ force: true });
        console.log('✅ Database tables synchronized');

        // Create sample products
        console.log('\n📦 Creating products...');
        const products = await Product.bulkCreate(sampleProducts);
        console.log(`✅ Created ${products.length} products`);

        // Create store inventory for random products
        console.log('\n🏬 Creating store inventory...');
        const inventoryData = [];

        for (const product of products) {
            // Add product to random stores (2-4 stores)
            const storeCount = Math.floor(Math.random() * 3) + 2;
            const shuffledStores = sampleStores.sort(() => Math.random() - 0.5).slice(0, storeCount);

            for (const store of shuffledStores) {
                inventoryData.push({
                    product_id: product.id,
                    store_id: store.store_id,
                    store_name: store.store_name,
                    store_address: store.store_address,
                    city: store.city,
                    pincode: store.pincode,
                    phone: store.phone,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    stock: Math.floor(Math.random() * 15) + 1
                });
            }
        }

        const { Inventory } = require('../models');
        await Inventory.bulkCreate(inventoryData);
        console.log(`✅ Created ${inventoryData.length} inventory entries`);

        // Create demo admin user
        console.log('\n👤 Creating demo users...');
        const demoPassword = await User.hashPassword('demo1234');
        await User.create({
            email: 'demo@vikas.com',
            password_hash: demoPassword,
            name: 'Demo User',
            role: 'customer'
        });

        const adminPassword = await User.hashPassword('admin1234');
        await User.create({
            email: 'admin@vikas.com',
            password_hash: adminPassword,
            name: 'Admin User',
            role: 'admin'
        });
        console.log('✅ Created demo users');
        console.log('   - demo@vikas.com / demo1234');
        console.log('   - admin@vikas.com / admin1234');

        console.log('\n🎉 Data seeding complete!\n');
        console.log('Database summary:');
        console.log(`   Products: ${products.length}`);
        console.log(`   Store inventory entries: ${inventoryData.length}`);
        console.log(`   Users: 2`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedData();
