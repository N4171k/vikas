const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VIKAS-dataset table (Products)
const Product = sequelize.define('VIKAS-dataset', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'General'
    },
    subcategory: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    original_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    discount_percentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0
    },
    rating_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    stock_online: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    // Store-level inventory
    store_1_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    store_2_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    store_3_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    store_4_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    store_5_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    store_6_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    brand: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    variants: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    specifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'VIKAS-dataset',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['category'] },
        { fields: ['brand'] },
        { fields: ['price'] },
        { fields: ['rating'] }
    ]
});

module.exports = Product;
