const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/atlantic_proxy'
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@atlanticproxy.com', adminPassword, 'Admin', 'User', 'admin', true]
    );
    
    // Create test user
    const testPassword = await bcrypt.hash('test123', 12);
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      ['test@atlanticproxy.com', testPassword, 'Test', 'User', 'user', true]
    );
    
    // Create referral code for test user
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      await pool.query(
        `INSERT INTO referral_codes (user_id, code) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, `AP${userId}TEST123`]
      );
    }
    
    console.log('✅ Database seeded successfully');
    console.log('📧 Admin: admin@atlanticproxy.com / admin123');
    console.log('📧 Test User: test@atlanticproxy.com / test123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();