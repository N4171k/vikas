const { sequelize } = require('../config/db');
const User = require('./User');
const Session = require('./Session');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const Inventory = require('./Inventory');
const Reservation = require('./Reservation');
const Store = require('./Store');

// Define relationships
// User <-> Session
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Cart
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product <-> Cart
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartEntries' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product <-> Inventory
Product.hasMany(Inventory, { foreignKey: 'product_id', as: 'storeInventory' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> Reservation
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product <-> Reservation
Product.hasMany(Reservation, { foreignKey: 'product_id', as: 'reservations' });
Reservation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
    sequelize,
    User,
    Session,
    Product,
    Cart,
    Order,
    Inventory,
    Inventory,
    Reservation,
    Store
};

