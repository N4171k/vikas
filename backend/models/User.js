const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// VIKAS-users table
const User = sequelize.define('VIKAS-users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        defaultValue: 'customer'
    }
}, {
    tableName: 'VIKAS-users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance method to check password
User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

// Static method to hash password
User.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

module.exports = User;
