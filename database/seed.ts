import bcrypt from 'bcrypt';
import { User, Customer, Machine, Service, Invoice, InvoiceItem, sequelize } from '../src/models/index';

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Create admin user
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@biomedical.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@biomedical.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
    });

    if (created) {
      console.log('✅ Created admin user:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample customers
    const customer1 = await Customer.create({
      name: 'Dr. John Smith',
      email: 'john.smith@hospital.com',
      phone: '+1234567890',
      address: '123 Medical Center Dr, City, State 12345',
      hospitalOrLabName: 'City General Hospital',
    });

    const customer2 = await Customer.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.j@lab.com',
      phone: '+1234567891',
      address: '456 Lab Street, City, State 12346',
      hospitalOrLabName: 'Advanced Diagnostics Lab',
    });

    const customer3 = await Customer.create({
      name: 'Dr. Michael Brown',
      email: 'm.brown@clinic.com',
      phone: '+1234567892',
      address: '789 Clinic Avenue, City, State 12347',
      hospitalOrLabName: 'Community Health Clinic',
    });
    console.log('✅ Created 3 customers');

    // Create sample machines
    const machine1 = await Machine.create({
      name: 'Blood Analyzer Pro',
      model: 'BAP-2024',
      serialNumber: 'SN-BAP-001',
      purchasePrice: 50000.00,
      sellingPrice: 75000.00,
      stockQuantity: 5,
      status: 'available',
    });

    const machine2 = await Machine.create({
      name: 'X-Ray Machine Advanced',
      model: 'XMA-3000',
      serialNumber: 'SN-XMA-001',
      purchasePrice: 120000.00,
      sellingPrice: 180000.00,
      stockQuantity: 2,
      status: 'available',
    });

    const machine3 = await Machine.create({
      name: 'Ultrasound Scanner',
      model: 'US-SCAN-500',
      serialNumber: 'SN-US-001',
      purchasePrice: 80000.00,
      sellingPrice: 120000.00,
      stockQuantity: 3,
      status: 'available',
    });
    console.log('✅ Created 3 machines');

    // Create sample services
    const service1 = await Service.create({
      customerId: customer1.id,
      machineId: machine1.id,
      serviceType: 'maintenance',
      description: 'Routine maintenance check',
      status: 'completed',
      serviceDate: new Date('2024-01-15'),
      cost: 500.00,
    });

    const service2 = await Service.create({
      customerId: customer2.id,
      machineId: machine2.id,
      serviceType: 'repair',
      description: 'Fixed calibration issue',
      status: 'completed',
      serviceDate: new Date('2024-01-20'),
      cost: 1200.00,
    });

    const service3 = await Service.create({
      customerId: customer1.id,
      machineId: machine3.id,
      serviceType: 'installation',
      description: 'New machine installation',
      status: 'in_progress',
      serviceDate: new Date('2024-02-01'),
      cost: 1500.00,
    });

    const service4 = await Service.create({
      customerId: customer3.id,
      serviceType: 'maintenance',
      description: 'Scheduled maintenance',
      status: 'pending',
      serviceDate: new Date('2024-02-15'),
    });
    console.log('✅ Created 4 services');

    // Create sample invoices
    const invoice1 = await Invoice.create({
      customerId: customer1.id,
      invoiceNumber: 'INV-2024-0001',
      totalAmount: 500.00,
      paymentStatus: 'paid',
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
    });

    await InvoiceItem.create({
      invoiceId: invoice1.id,
      itemType: 'service',
      referenceId: service1.id,
      quantity: 1,
      price: 500.00,
    });

    const invoice2 = await Invoice.create({
      customerId: customer2.id,
      invoiceNumber: 'INV-2024-0002',
      totalAmount: 1200.00,
      paymentStatus: 'paid',
      invoiceDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
    });

    await InvoiceItem.create({
      invoiceId: invoice2.id,
      itemType: 'service',
      referenceId: service2.id,
      quantity: 1,
      price: 1200.00,
    });

    const invoice3 = await Invoice.create({
      customerId: customer1.id,
      invoiceNumber: 'INV-2024-0003',
      totalAmount: 121500.00,
      paymentStatus: 'partial',
      invoiceDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-01'),
    });

    await InvoiceItem.bulkCreate([
      {
        invoiceId: invoice3.id,
        itemType: 'service',
        referenceId: service3.id,
        quantity: 1,
        price: 1500.00,
      },
      {
        invoiceId: invoice3.id,
        itemType: 'machine',
        referenceId: machine3.id,
        quantity: 1,
        price: 120000.00,
      },
    ]);

    // Update machine stock after invoice creation
    await machine3.update({
      stockQuantity: 2, // Reduced by 1 from invoice
    });

    console.log('✅ Created 3 invoices');
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✅ Seed process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  });

