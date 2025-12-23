import { Op } from 'sequelize';
import { Service, Customer, Machine, Invoice, InvoiceItem, sequelize } from '../models';
import { NotFoundError } from '../utils/errors';
import { CreateServiceInput, UpdateServiceInput } from '../validations/service';

export const createService = async (input: CreateServiceInput) => {
  // Verify customer exists
  const customer = await Customer.findByPk(input.customerId);

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Verify machine exists if provided
  if (input.machineId) {
    const machine = await Machine.findByPk(input.machineId);

    if (!machine) {
      throw new NotFoundError('Machine not found');
    }
  }

  const service = await Service.create({
    customerId: input.customerId,
    machineId: input.machineId || null,
    serviceType: input.serviceType,
    description: input.description || null,
    status: input.status || 'pending',
    serviceDate: new Date(input.serviceDate),
    cost: input.cost ? input.cost : null,
  });

  const serviceWithRelations = await Service.findByPk(service.id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  return serviceWithRelations;
};

export const getServiceById = async (id: string) => {
  const service = await Service.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  return service;
};

export const getAllServices = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const offset = (page - 1) * limit;

  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.serviceDate = {};
    if (filters.startDate) {
      where.serviceDate[Op.gte] = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.serviceDate[Op.lte] = new Date(filters.endDate);
    }
  }

  const { count, rows: services } = await Service.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  // Fetch invoice/payment info for these services in bulk
  const serviceIds = services.map((s) => s.id);
  let paymentMap: Record<
    string,
    { paymentStatus: string; paidAmount: number; totalAmount: number }
  > = {};

  if (serviceIds.length > 0) {
    const invoiceItems = await InvoiceItem.findAll({
      where: {
        itemType: 'service',
        referenceId: serviceIds,
      },
      include: [{ model: Invoice, as: 'invoice' }],
    });

    paymentMap = invoiceItems.reduce((acc, item: any) => {
      if (item.invoice) {
        acc[item.referenceId] = {
          paymentStatus: item.invoice.paymentStatus,
          paidAmount: Number(item.invoice.paidAmount || 0),
          totalAmount: Number(item.invoice.totalAmount || 0),
        };
      }
      return acc;
    }, {} as Record<string, { paymentStatus: string; paidAmount: number; totalAmount: number }>);
  }

  const servicesWithPayment = services.map((service) => {
    const json = service.toJSON() as any;
    const pay = paymentMap[service.id];
    return {
      ...json,
      paymentInfo: pay || null,
    };
  });

  return {
    services: servicesWithPayment,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// Helper function to generate invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year + 1}-01-01`);

  const count = await Invoice.count({
    where: {
      invoiceDate: {
        [Op.gte]: startOfYear,
        [Op.lt]: endOfYear,
      },
    },
  });

  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  return invoiceNumber;
};

// Helper function to check if service already has an invoice
const serviceHasInvoice = async (serviceId: string): Promise<boolean> => {
  const existingInvoiceItem = await InvoiceItem.findOne({
    where: {
      itemType: 'service',
      referenceId: serviceId,
    },
  });
  return !!existingInvoiceItem;
};

// Helper function to automatically create invoice for completed service
const createInvoiceForService = async (service: Service) => {
  // Check if service already has an invoice
  const hasInvoice = await serviceHasInvoice(service.id);
  if (hasInvoice) {
    return null; // Service already has an invoice
  }

  // Only create invoice if service has a cost
  if (!service.cost || Number(service.cost) <= 0) {
    return null; // No cost, no invoice needed
  }

  // Load customer relationship
  const customer = await Customer.findByPk(service.customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found for service');
  }

  const invoiceNumber = await generateInvoiceNumber();
  const totalAmount = Number(service.cost);

  // Create invoice with service item in a transaction
  const invoice = await sequelize.transaction(async (t) => {
    const newInvoice = await Invoice.create(
      {
        customerId: service.customerId,
        invoiceNumber,
        totalAmount,
        invoiceDate: new Date(),
        dueDate: null, // Can be set later
        paymentStatus: 'unpaid',
      },
      { transaction: t }
    );

    // Create invoice item for the service
    await InvoiceItem.create(
      {
        invoiceId: newInvoice.id,
        itemType: 'service',
        referenceId: service.id,
        quantity: 1,
        price: totalAmount,
      },
      { transaction: t }
    );

    const invoiceWithRelations = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: InvoiceItem, as: 'items' },
      ],
      transaction: t,
    });

    return invoiceWithRelations;
  });

  return invoice;
};

export const updateService = async (id: string, input: UpdateServiceInput) => {
  const service = await Service.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  // Verify customer exists if updating
  if (input.customerId) {
    const customer = await Customer.findByPk(input.customerId);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
  }

  // Verify machine exists if updating
  if (input.machineId) {
    const machine = await Machine.findByPk(input.machineId);

    if (!machine) {
      throw new NotFoundError('Machine not found');
    }
  }

  const updateData: any = {};
  if (input.customerId) updateData.customerId = input.customerId;
  if (input.machineId !== undefined) updateData.machineId = input.machineId || null;
  if (input.serviceType) updateData.serviceType = input.serviceType;
  if (input.description !== undefined) updateData.description = input.description || null;
  
  // Check if status is being changed to 'completed'
  const isBeingCompleted = input.status === 'completed' && service.status !== 'completed';
  
  if (input.status) updateData.status = input.status;
  if (input.serviceDate) updateData.serviceDate = new Date(input.serviceDate);
  if (input.cost !== undefined) updateData.cost = input.cost || null;

  await service.update(updateData);

  const updatedService = await Service.findByPk(id, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Machine, as: 'machine' },
    ],
  });

  // Automatically create invoice when service is completed
  if (isBeingCompleted) {
    try {
      await createInvoiceForService(updatedService);
    } catch (error) {
      // Log error but don't fail the service update
      console.error('Failed to create invoice for completed service:', error);
    }
  }

  return updatedService;
};

export const deleteService = async (id: string) => {
  const service = await Service.findByPk(id);

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  await service.destroy();

  return { message: 'Service deleted successfully' };
};

