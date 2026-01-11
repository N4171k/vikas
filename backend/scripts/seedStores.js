const { Store, sequelize } = require('../models');

const stores = [
    { id: 1, store_name: 'VIKAS Mall Store - Mumbai', city: 'Mumbai', pincode: '400001', store_address: 'Phoenix Marketcity, Kurla West', phone: '+91 22 4567 8901' },
    { id: 2, store_name: 'VIKAS Premium - Delhi', city: 'Delhi', pincode: '110001', store_address: 'Select Citywalk, Saket', phone: '+91 11 4567 8902' },
    { id: 3, store_name: 'VIKAS Express - Bangalore', city: 'Bangalore', pincode: '560001', store_address: 'Orion Mall, Rajajinagar', phone: '+91 80 4567 8903' },
    { id: 4, store_name: 'VIKAS Flagship - Hyderabad', city: 'Hyderabad', pincode: '500001', store_address: 'Inorbit Mall, Madhapur', phone: '+91 40 4567 8904' },
    { id: 5, store_name: 'VIKAS Store - Chennai', city: 'Chennai', pincode: '600001', store_address: 'VR Chennai, Anna Nagar', phone: '+91 44 4567 8905' },
    { id: 6, store_name: 'VIKAS Outlet - Pune', city: 'Pune', pincode: '411001', store_address: 'Phoenix Market City, Viman Nagar', phone: '+91 20 4567 8906' }
];

async function seedStores() {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Ensure table exists

        for (const store of stores) {
            const [data, created] = await Store.findOrCreate({
                where: { id: store.id },
                defaults: store
            });

            if (created) {
                console.log(`✅ Created: ${store.store_name}`);
            } else {
                console.log(`ℹ️ Exists: ${store.store_name}`);
                await data.update(store); // Update if exists to ensure latest data
            }
        }

        console.log('🎉 Store seeding complete.');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await sequelize.close();
    }
}

seedStores();
