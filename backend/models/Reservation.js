/**
 * Reservation Model
 * Stores product reservations for in-store pickup
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Reservation = sequelize.define('VIKAS-reservations', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    reservation_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    product_title: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    product_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'ready', 'picked_up', 'cancelled', 'expired'),
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    qr_code_data: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    picked_up_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'VIKAS-reservations',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Reservation;
