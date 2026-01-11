const { sequelize } = require('../config/db');

async function syncStoreSequence() {
    try {
        await sequelize.authenticate();
        console.log('Database connected. Fixing sequence for VIKAS-stores...');

        // Query to reset the sequence to the maximum ID + 1
        // We use coalesce to handle the case where the table is empty (defaults to 1)
        // The table name is "VIKAS-stores" (quoted because of the hyphen)
        const query = `
            SELECT setval(
                pg_get_serial_sequence('"VIKAS-stores"', 'id'), 
                COALESCE((SELECT MAX(id) + 1 FROM "VIKAS-stores"), 1), 
                false
            );
        `;

        await sequelize.query(query);
        console.log('✅ Sequence synchronized successfully.');

    } catch (error) {
        console.error('❌ Failed to sync sequence:', error);
    } finally {
        await sequelize.close();
    }
}

syncStoreSequence();
