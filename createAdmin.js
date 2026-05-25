const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('./models/User');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@carmart.pk' });
    if (existing) {
      console.log('⚠️  Admin already exists — email: admin@carmart.pk');
      process.exit(0);
    }

    await User.create({
      name:     'Admin',
      email:    'admin@carmart.pk',
      password: 'admin123',
      role:     'admin',
    });

    console.log('✅ Admin created!');
    console.log('   Email:    admin@carmart.pk');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

run();
