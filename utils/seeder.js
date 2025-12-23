const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGODB_URI);

const createAdmins = async () => {
  try {
    const configPath = path.join(__dirname, '../config/admins.json');
    
    // Check if admins.json exists
    if (!fs.existsSync(configPath)) {
      console.log('========================================');
      console.log('No admins.json found!');
      console.log('');
      console.log('Create backend/config/admins.json with:');
      console.log('[');
      console.log('  {');
      console.log('    "name": "Admin Name",');
      console.log('    "email": "admin@college.com",');
      console.log('    "password": "YourSecurePassword",');
      console.log('    "department": "Administration"');
      console.log('  }');
      console.log(']');
      console.log('');
      console.log('See admins.example.json for reference');
      console.log('========================================');
      process.exit(1);
    }

    const admins = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!Array.isArray(admins) || admins.length === 0) {
      console.log('admins.json is empty or invalid');
      process.exit(1);
    }

    console.log('Creating admin accounts...\n');

    for (const adminData of admins) {
      if (!adminData.email || !adminData.password || !adminData.name) {
        console.log(`✗ Skipping invalid entry (missing required fields)`);
        continue;
      }

      const exists = await User.findOne({ email: adminData.email });
      if (!exists) {
        await User.create({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          department: adminData.department || 'Administration',
          role: 'admin'
        });
        console.log(`✓ Admin created: ${adminData.email}`);
      } else {
        console.log(`- Already exists: ${adminData.email}`);
      }
    }

    console.log('\n========================================');
    console.log('Admin setup complete!');
    console.log('You can now login with the credentials');
    console.log('defined in config/admins.json');
    console.log('========================================');
    
    process.exit();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createAdmins();
