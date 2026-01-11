const { sequelize } = require('../config/db');
const Store = require('../models/Store');

async function testStoreCreate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Test Case 1: All valid inputs
        console.log('Test 1: Valid inputs');
        try {
            const store1 = await Store.create({
                store_name: 'Test Store 1',
                city: 'Test City',
                pincode: '123456',
                store_address: '123 Test St',
                phone: '1234567890',
                latitude: 12.34,
                longitude: 56.78
            });
            console.log('SUCCESS: Test 1 passed', store1.id);
            await store1.destroy();
        } catch (err) {
            console.error('FAIL: Test 1 failed', err.message);
        }

        // Test Case 2: Empty strings for optional numeric fields (The suspected bug)
        console.log('Test 2: Empty strings for numeric fields');
        try {
            const store2 = await Store.create({
                store_name: 'Test Store 2',
                city: 'Test City',
                pincode: '123456',
                store_address: '123 Test St',
                phone: '',
                latitude: '',  // Empty string caused by HTML form input
                longitude: ''  // Empty string caused by HTML form input
            });
            console.log('SUCCESS: Test 2 passed', store2.id);
            await store2.destroy();
        } catch (err) {
            console.error('FAIL: Test 2 failed', err.message);
        }

    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        await sequelize.close();
    }
}

testStoreCreate();
