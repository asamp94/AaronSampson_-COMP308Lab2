// graphql-server/config/seedAdmin.js
import UserModel from '../models/user.server.model.js';

export async function seedAdmin() {
  try {

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(' ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed');
      return;
    }

    const adminExists = await UserModel.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('ℹ️ Admin user already exists');
      return;
    }

    const adminUser = new UserModel({
      userName: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('✅ Admin user seeded successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log('   Password: (from env)');
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
  }
}
