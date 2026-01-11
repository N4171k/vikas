const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VIKAS-cart table
const Cart = sequelize.define('VIKAS-cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VIKAS-users',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VIKAS-dataset',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    }
}, {
    tableName: 'VIKAS-cart',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['user_id'] },
        {
            unique: true,
            fields: ['user_id', 'product_id']
        }
    ]
});

module.exports = Cart;
