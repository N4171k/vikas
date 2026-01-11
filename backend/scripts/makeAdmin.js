const { User, sequelize } = require('../models');

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log('Please provide an email address.');
        console.log('Usage: node scripts/makeAdmin.js tiwarinaitik9@gmail.com');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Success! User ${user.name} (${email}) is now an Admin.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

makeAdmin();
