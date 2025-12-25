import sequelize from '../config/database';
import User from './User';
import Customer from './Customer';
import Machine from './Machine';
import Service from './Service';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import AMC from './AMC';

// Initialize models
User.initModel(sequelize);
Customer.initModel(sequelize);
Machine.initModel(sequelize);
Service.initModel(sequelize);
Invoice.initModel(sequelize);
InvoiceItem.initModel(sequelize);
AMC.initModel(sequelize);

// Define associations
Customer.hasMany(Service, { foreignKey: 'customerId', as: 'services' });
Service.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Machine.hasMany(Service, { foreignKey: 'machineId', as: 'services' });
Service.belongsTo(Machine, { foreignKey: 'machineId', as: 'machine' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Link services to invoice items for lookups
Service.hasMany(InvoiceItem, { foreignKey: 'referenceId', constraints: false, scope: { itemType: 'service' }, as: 'invoiceItems' });
InvoiceItem.belongsTo(Service, { foreignKey: 'referenceId', constraints: false, as: 'service' });

// Link machines to invoice items for lookups
Machine.hasMany(InvoiceItem, { foreignKey: 'referenceId', constraints: false, scope: { itemType: 'machine' }, as: 'invoiceItems' });
InvoiceItem.belongsTo(Machine, { foreignKey: 'referenceId', constraints: false, as: 'machine' });

// AMC associations
Customer.hasMany(AMC, { foreignKey: 'customerId', as: 'amcs' });
AMC.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Machine.hasMany(AMC, { foreignKey: 'machineId', as: 'amcs' });
AMC.belongsTo(Machine, { foreignKey: 'machineId', as: 'machine' });

Service.belongsTo(AMC, { foreignKey: 'amcId', as: 'amc' });
AMC.hasMany(Service, { foreignKey: 'amcId', as: 'services' });

export {
  sequelize,
  User,
  Customer,
  Machine,
  Service,
  Invoice,
  InvoiceItem,
  AMC,
};

