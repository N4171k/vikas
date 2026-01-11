/**
 * Agent Registry
 * Central export for all VIKAS agents
 */

const orchestrator = require('./orchestrator');
const customerExperience = require('./customerExperience');
const productInventory = require('./productInventory');
const personalization = require('./personalization');
const orderFulfillment = require('./orderFulfillment');
const immersiveExperience = require('./immersiveExperience');
const analyticsEngine = require('./analyticsEngine');

module.exports = {
    orchestrator,
    customerExperience,
    productInventory,
    personalization,
    orderFulfillment,
    immersiveExperience,
    analyticsEngine,

    // List of all agents for iteration
    all: [
        { name: 'customerExperience', agent: customerExperience },
        { name: 'productInventory', agent: productInventory },
        { name: 'personalization', agent: personalization },
        { name: 'orderFulfillment', agent: orderFulfillment },
        { name: 'immersiveExperience', agent: immersiveExperience },
        { name: 'analyticsEngine', agent: analyticsEngine }
    ]
};
