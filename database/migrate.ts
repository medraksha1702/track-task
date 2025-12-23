import { sequelize } from '../src/models';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (creates tables if they don't exist)
    // Use { alter: true } to update existing tables, { force: false } to only create new ones
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully');

    console.log('\n📊 Tables created/updated:');
    console.log('  - users');
    console.log('  - customers');
    console.log('  - machines');
    console.log('  - services');
    console.log('  - invoices');
    console.log('  - invoice_items');

    await sequelize.close();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

migrate();

