import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const validateEnv = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  // Check if MONGODB_URI contains password placeholder
  if (process.env.MONGODB_URI.includes('<db_password>')) {
    throw new Error('Please replace <db_password> in MONGODB_URI with your actual database password');
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

const seedAdmin = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    await connectDB();

    const adminData = {
      name: 'System Admin',
      email: 'admin@groupflow.com',
      password: 'Admin@123',
      role: 'admin',
      area: 'All Areas'
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('\n👤 Admin user already exists');
      console.log('Email:', adminData.email);
      console.log('If you need to reset the password, use the following MongoDB command:');
      console.log('\ndb.users.updateOne(');
      console.log('  { email: "admin@groupflow.com" },');
      console.log('  { $set: { password: "<new_hashed_password>" } }');
      console.log(');');
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();
    
    console.log('\n✅ Admin user created successfully');
    console.log('----------------------------------------');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('----------------------------------------');
    console.log('\n🔑 You can now log in at http://localhost:5173/login');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\n📋 Database connection closed');
  }
};

// Execute seeding
seedAdmin();