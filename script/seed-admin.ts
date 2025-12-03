import { storage } from '../server/storage';
import bcrypt from 'bcryptjs';

/**
 * Seed script to create the initial admin user
 * 
 * Usage: npm run seed:admin
 * 
 * This script will:
 * 1. Check if an admin user already exists
 * 2. Create a superadmin user if none exists
 * 3. Display the credentials
 * 
 * IMPORTANT: Change the password immediately after first login!
 */

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...\n');

    // Check if admin already exists
    const existingAdmin = await storage.getAdminUserByEmail('admin@atlanticweizard.com');
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@atlanticweizard.com');
      console.log('\nIf you need to reset the password, delete the user from the database first.');
      console.log('Or create a new admin user through the admin panel.\n');
      process.exit(0);
    }

    // Create admin user with hashed password
    console.log('Creating admin user...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    
    const admin = await storage.createAdminUser({
      email: 'admin@atlanticweizard.com',
      passwordHash,
      role: 'superadmin',
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Admin Login Credentials');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@atlanticweizard.com');
    console.log('🔑 Password: Admin@123');
    console.log('🔗 Login at: /admin');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  SECURITY WARNING:');
    console.log('   Change this password immediately after first login!');
    console.log('   Go to Admin Panel → Users → Edit your account\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error seeding admin user:');
    console.error(error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Make sure DATABASE_URL is set in your .env file');
    }
    
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
