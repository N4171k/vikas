const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// VIKAS-sessions table
const Session = sequelize.define('VIKAS-sessions', {
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
    token: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'VIKAS-sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Session;
