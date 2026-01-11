const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VIKAS-orders table
const Order = sequelize.define('VIKAS-orders', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    order_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VIKAS-users',
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    shipping: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    shipping_address: {
        type: DataTypes.JSON,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'cod'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'VIKAS-orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['order_number'] }
    ]
});

// Generate order number
Order.generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VKS-${timestamp}-${random}`;
};

module.exports = Order;
