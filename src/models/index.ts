import sequelize from '../config/database';
import User from './User';
import Customer from './Customer';
import Machine from './Machine';
import Service from './Service';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';

// Initialize models
User.initModel(sequelize);
Customer.initModel(sequelize);
Machine.initModel(sequelize);
Service.initModel(sequelize);
Invoice.initModel(sequelize);
InvoiceItem.initModel(sequelize);

// Define associations
Customer.hasMany(Service, { foreignKey: 'customerId', as: 'services' });
Service.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Machine.hasMany(Service, { foreignKey: 'machineId', as: 'services' });
Service.belongsTo(Machine, { foreignKey: 'machineId', as: 'machine' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

export {
  sequelize,
  User,
  Customer,
  Machine,
  Service,
  Invoice,
  InvoiceItem,
};

