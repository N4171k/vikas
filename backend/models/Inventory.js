const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VIKAS-inventory table (Store Availability)
const Inventory = sequelize.define('VIKAS-inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VIKAS-dataset',
            key: 'id'
        }
    },
    store_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    store_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    }
}, {
    tableName: 'VIKAS-inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['product_id'] },
        { fields: ['store_id'] },
        { fields: ['city'] },
        {
            unique: true,
            fields: ['product_id', 'store_id']
        }
    ]
});

module.exports = Inventory;
